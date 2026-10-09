import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const input = readInput();

try {
  const message = followup(input);
  process.stdout.write(message ? JSON.stringify({ followup_message: message }) : "{}");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.stdout.write("{}");
}

function followup(event) {
  if (event.status !== "completed") return "";
  const root = projectRoot(event);
  const snapshot = sourceSnapshot(root);
  if (!snapshot) return "";
  const hash = createHash("sha256").update(snapshot).digest("hex");
  const statePath = path.join(root, ".cursor", "hooks", "jev-review-state.json");
  const state = readState(statePath);
  const loop = number(event.loop_count);
  if (state.hash === hash) return "";
  if (typeof state.loop === "number" && loop > state.loop) {
    writeState(statePath, { hash, loop });
    return "";
  }
  writeState(statePath, { hash, loop });
  return [
    "src に未採点の差分がある。終了する前に .cursor/skills/yard-jev-review/SKILL.md を読み、その手順で jev_review を一度通す。",
    "ユーザーが修正しないと言っているときは、点数と信頼度と、コードを読んだ日本語の説明で終える。",
    "そうでなければ、正しさ・信頼性・セキュリティ・テスト品質のうち最も弱い一点だけを直して、同じ対象で再採点してから終える。",
    "package-lock と src/components/ui は送らない。点数は作らない。",
  ].join("");
}

function sourceSnapshot(root) {
  const status = git(root, ["status", "--porcelain", "--untracked-files=all", "--", "src"]);
  const lines = status.split(/\r?\n/).filter(Boolean).filter(isAppSource);
  if (lines.length === 0) return "";
  const diff = gitAllowFailure(root, ["diff", "HEAD", "--", "src", ":(exclude)src/components/ui"]);
  const untracked = lines
    .filter((line) => line.startsWith("?? "))
    .map(pathOf)
    .filter((file) => !file.startsWith("src/components/ui/"));
  const bodies = untracked.map((file) => {
    const absolute = path.join(root, file);
    return fs.existsSync(absolute) ? fs.readFileSync(absolute) : Buffer.alloc(0);
  });
  return Buffer.concat([Buffer.from(`${lines.join("\n")}\n${diff}\n`), ...bodies]);
}

function isAppSource(line) {
  const file = pathOf(line);
  return file.startsWith("src/") && !file.startsWith("src/components/ui/");
}

function pathOf(line) {
  const rest = line.slice(3).trim();
  const parts = rest.split(" -> ");
  return parts[parts.length - 1].replaceAll("\\", "/");
}

function gitAllowFailure(root, args) {
  try {
    return git(root, args);
  } catch {
    return "";
  }
}

function git(root, args) {
  const result = spawnSync("git", ["--no-pager", ...args], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(result.stderr || `git exited ${result.status}`);
  }
  return result.stdout ?? "";
}

function projectRoot(event) {
  const fromEnv = text(process.env.CURSOR_PROJECT_DIR);
  if (fromEnv) return fromEnv;
  const roots = Array.isArray(event.workspace_roots) ? event.workspace_roots : [];
  const first = roots.map(text).find(Boolean);
  return first || process.cwd();
}

function readState(file) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!parsed || typeof parsed !== "object") return {};
    return {
      hash: text(parsed.hash),
      loop: number(parsed.loop),
    };
  } catch {
    return {};
  }
}

function writeState(file, state) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(state)}\n`, "utf8");
}

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

function number(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function text(value) {
  return typeof value === "string" ? value : "";
}
