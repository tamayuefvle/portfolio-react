import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(skillDir, "../../..");
const runDir = path.join(skillDir, "run");
const instancePath = path.join(runDir, "instance.json");
const logPath = path.join(runDir, "server.log");
const host = "127.0.0.1";
const port = 3100;
const origin = `http://${host}:${port}`;

const command = process.argv[2];

if (command === "launch") {
  await launch();
} else if (command === "doctor") {
  const report = await doctor();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else if (command === "cleanup") {
  cleanup();
} else {
  process.stderr.write("usage: node .cursor/skills/verify-yard/verify-yard.mjs <launch|doctor|cleanup>\n");
  process.exit(1);
}

async function launch() {
  if (fs.existsSync(instancePath)) {
    try {
      const report = await doctor();
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
      return;
    } catch {
      cleanup();
    }
  }

  const foreigners = nextProcesses().filter((row) => row.pid !== process.pid);
  if (foreigners.length > 0) {
    const lines = foreigners.map((row) => `${row.pid} ${row.command}`).join("\n");
    fail(`このチェックアウトでは next が既に動いています。data/store.json を共有するため、別の検証サーバーは起動しません。\n${lines}`);
  }
  if (listeningPid(port)) {
    fail(`${origin} は別のプロセスが待受中です。検証サーバーは起動しません。`);
  }

  const nextBin = path.join(repoRoot, "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(nextBin)) {
    fail("node_modules/next がありません。リポジトリのルートで npm install を実行してください。");
  }

  fs.mkdirSync(runDir, { recursive: true });
  const logFd = fs.openSync(logPath, "a");
  const child = spawn(process.execPath, [nextBin, "dev", "-H", host, "-p", String(port)], {
    cwd: repoRoot,
    detached: true,
    stdio: ["ignore", logFd, logFd],
    windowsHide: true,
  });
  child.unref();
  fs.closeSync(logFd);

  const instance = {
    pid: child.pid,
    port,
    host,
    cwd: repoRoot,
    url: origin,
    store: path.join(repoRoot, "data", "store.json"),
    startedAt: new Date().toISOString(),
  };
  fs.writeFileSync(instancePath, `${JSON.stringify(instance, null, 2)}\n`);

  const ready = await waitForLogin(90_000);
  if (!ready) {
    cleanup();
    fail(`90秒待っても ${origin}/login が「機材ヤード」を返しませんでした。ログ: ${logPath}`);
  }
  process.stdout.write(`${JSON.stringify(await doctor(), null, 2)}\n`);
}

async function doctor() {
  if (!fs.existsSync(instancePath)) {
    fail("検証サーバーの記録がありません。先に launch を実行してください。");
  }
  const instance = JSON.parse(fs.readFileSync(instancePath, "utf8"));
  if (path.resolve(instance.cwd) !== repoRoot) {
    fail(`記録された cwd がこのリポジトリと違います: ${instance.cwd}`);
  }
  if (!alive(instance.pid)) {
    fail(`記録された pid ${instance.pid} は動いていません。`);
  }
  const listener = listeningPid(instance.port);
  if (!listener) {
    fail(`${instance.url} を待受しているプロセスがありません。`);
  }
  if (!sameTree(instance.pid, listener)) {
    fail(`ポート ${instance.port} の待受 pid ${listener} は、起動した pid ${instance.pid} の配下ではありません。`);
  }
  const login = await fetch(`${instance.url}/login`);
  const body = await login.text();
  if (!body.includes("機材ヤード")) {
    fail(`${instance.url}/login の応答に「機材ヤード」がありません。status ${login.status}`);
  }
  return {
    ok: true,
    url: instance.url,
    pid: instance.pid,
    listener,
    cwd: instance.cwd,
    store: instance.store,
    loginStatus: login.status,
    marker: "機材ヤード",
  };
}

function cleanup() {
  if (!fs.existsSync(instancePath)) {
    process.stdout.write("検証サーバーの記録はありません。\n");
    return;
  }
  const instance = JSON.parse(fs.readFileSync(instancePath, "utf8"));
  if (alive(instance.pid)) {
    execFileSync("taskkill", ["/PID", String(instance.pid), "/T", "/F"], { stdio: "ignore" });
  }
  fs.rmSync(runDir, { recursive: true, force: true });
  process.stdout.write(`pid ${instance.pid} のプロセスツリーを停止し、${runDir} を削除しました。\n`);
}

function nextProcesses() {
  const script = [
    "Get-CimInstance Win32_Process -Filter \"Name = 'node.exe'\"",
    "| Select-Object ProcessId, CommandLine",
    "| ConvertTo-Json -Compress",
  ].join(" ");
  const raw = execFileSync("powershell.exe", ["-NoProfile", "-Command", script], { encoding: "utf8" }).trim();
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  const rows = Array.isArray(parsed) ? parsed : [parsed];
  return rows
    .map((row) => ({ pid: Number(row.ProcessId), command: String(row.CommandLine ?? "") }))
    .filter((row) => {
      const command = row.command.toLowerCase();
      return command.includes("portfolio-react") && command.includes("next");
    });
}

function listeningPid(targetPort) {
  const raw = execFileSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
  const needle = `:${targetPort}`;
  for (const line of raw.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts[3] !== "LISTENING") continue;
    if (!parts[1]?.endsWith(needle)) continue;
    return Number(parts[4]);
  }
  return null;
}

function sameTree(rootPid, candidate) {
  if (rootPid === candidate) return true;
  const script = [
    `$parent = ${Number(candidate)}`,
    `$root = ${Number(rootPid)}`,
    "for ($i = 0; $i -lt 8; $i++) {",
    "  $row = Get-CimInstance Win32_Process -Filter \"ProcessId = $parent\"",
    "  if (-not $row) { break }",
    "  if ([int]$row.ParentProcessId -eq $root) { 'yes'; exit 0 }",
    "  if ([int]$row.ParentProcessId -le 0) { break }",
    "  $parent = [int]$row.ParentProcessId",
    "}",
    "'no'",
  ].join("; ");
  const raw = execFileSync("powershell.exe", ["-NoProfile", "-Command", script], { encoding: "utf8" }).trim();
  return raw.endsWith("yes");
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForLogin(timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${origin}/login`);
      const body = await response.text();
      if (body.includes("機材ヤード")) return true;
    } catch {
      // The server is still booting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
