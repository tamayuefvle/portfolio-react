import fs from "node:fs";
import path from "node:path";

const input = readInput();

try {
  if (input.hook_event_name === "beforeSubmitPrompt") recordUser(input);
  if (input.hook_event_name === "afterAgentResponse") recordAssistant(input);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
}

if (input.hook_event_name === "beforeSubmitPrompt") {
  process.stdout.write(JSON.stringify({ continue: true }));
} else {
  process.stdout.write("{}");
}

function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

function recordUser(event) {
  const generationId = text(event.generation_id) || `missing-${Date.now()}`;
  const file = conversationFile(event);
  const body = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : header(event);
  if (body.includes(generationMark(generationId))) return;

  const turn = nextTurn(body);
  const attachments = fileAttachments(event.attachments);
  const attachmentBlock =
    attachments.length === 0 ? "" : `\n\n添付:\n${attachments.map((item) => `- ${item}`).join("\n")}`;
  const section = [
    `## ${turn}`,
    "",
    generationMark(generationId),
    "",
    "### ユーザー",
    "",
    text(event.prompt),
    attachmentBlock,
    "",
    "### アシスタント",
    "",
    pendingMark(generationId),
    "",
  ].join("\n");

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${body.trimEnd()}\n\n${section}`, "utf8");
}

function recordAssistant(event) {
  const generationId = text(event.generation_id);
  const file = conversationFile(event);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const lines = [header(event).trimEnd(), "", "## 1", ""];
    if (generationId) lines.push(generationMark(generationId), "");
    lines.push("### アシスタント", "", text(event.text), "");
    fs.writeFileSync(file, `${lines.join("\n")}\n`, "utf8");
    return;
  }

  const body = fs.readFileSync(file, "utf8");
  const pending = generationId ? pendingMark(generationId) : "";
  if (pending && body.includes(pending)) {
    const reply = text(event.text);
    fs.writeFileSync(file, body.replace(pending, () => reply), "utf8");
    return;
  }

  if (generationId && body.includes(generationMark(generationId)) && !body.includes(pendingMark(generationId))) {
    return;
  }

  const lines = [`## ${nextTurn(body)}`, ""];
  if (generationId) lines.push(generationMark(generationId), "");
  lines.push("### アシスタント", "", text(event.text), "");
  fs.writeFileSync(file, `${body.trimEnd()}\n\n${lines.join("\n")}\n`, "utf8");
}

function conversationFile(event) {
  const root = projectRoot(event);
  const id = safeId(text(event.conversation_id) || "unknown");
  const dir = path.join(root, "docs", "chats");
  if (fs.existsSync(dir)) {
    const existing = fs.readdirSync(dir).find((name) => name.endsWith(`_${id}.md`));
    if (existing) return path.join(dir, existing);
  }
  return path.join(dir, `${tokyoDate()}_${id}.md`);
}

function header(event) {
  const id = text(event.conversation_id) || "unknown";
  return `# チャット記録 ${tokyoDate()}\n\nconversation_id: \`${id}\`\n\n発言は省略せず、送られた順に全文を残す。\n`;
}

function projectRoot(event) {
  const fromEnv = text(process.env.CURSOR_PROJECT_DIR);
  if (fromEnv) return fromEnv;
  const roots = Array.isArray(event.workspace_roots) ? event.workspace_roots : [];
  const first = roots.map(text).find(Boolean);
  return first || process.cwd();
}

function tokyoDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function nextTurn(body) {
  const matches = body.match(/^## \d+$/gm) ?? [];
  return matches.length + 1;
}

function fileAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .filter((item) => item && item.type === "file" && text(item.file_path))
    .map((item) => text(item.file_path));
}

function generationMark(id) {
  return `<!-- generation:${id} -->`;
}

function pendingMark(id) {
  return `<!-- assistant-pending:${id} -->`;
}

function safeId(value) {
  const cleaned = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80);
  return cleaned || "unknown";
}

function text(value) {
  return typeof value === "string" ? value : "";
}
