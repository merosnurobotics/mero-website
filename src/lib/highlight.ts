import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import cpp from "highlight.js/lib/languages/cpp";
import ini from "highlight.js/lib/languages/ini";
import json from "highlight.js/lib/languages/json";
import powershell from "highlight.js/lib/languages/powershell";
import python from "highlight.js/lib/languages/python";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

const languages = { bash, cpp, ini, json, powershell, python, xml, yaml };
for (const [name, language] of Object.entries(languages)) if (!hljs.getLanguage(name)) hljs.registerLanguage(name, language);
const aliases: Record<string, string> = { sh: "bash", shell: "bash", console: "bash", zsh: "bash", py: "python", arduino: "cpp", ino: "cpp", c: "cpp", "c++": "cpp", yml: "yaml", html: "xml", toml: "ini", ps1: "powershell" };
const shellCommands = new Set(["cd", "ls", "sudo", "pip", "pip3", "python", "python3", "ros2", "colcon", "git", "source", "export", "npm", "npx", "ssh", "ssh-keygen", "scp", "rsync", "mkdir", "cp", "mv", "rm", "cat", "echo", "chmod", "apt", "apt-get", "curl", "wget", "tmux", "tailscale", "conda", "uv", "docker", "make", "cmake", "systemctl", "ip", "ping", "nvidia-smi", "blender", "yolo", "arduino-cli", "unzip", "tar", "bash", "sh", "nano", "code", "rosdep", "ros2bag", "sed", "grep", "find", "touch", "ln", "which", "env", "watch", "jtop", "rviz2", "./", "mamba", "brew", "winget", "ssh-copy-id", "type", "Get-Content"]);

export const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const decodeHtml = (html: string) => html.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#0?39;|&#x27;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");

function looksLikeShell(code: string) {
  const lines = code.split("\n").map(line => line.trim()).filter(line => line && !line.startsWith("#"));
  if (!lines.length) return false;
  const commands = lines.filter(line => {
    const first = line.replace(/^\$\s+/, "").split(/\s+/)[0];
    return line.startsWith("$ ") || line.startsWith("./") || shellCommands.has(first) || /^[A-Z_][A-Z0-9_]*=\S*(\s|$)/.test(line) || /^(~|\/usr|\/opt|\/bin)\/\S+/.test(first);
  });
  return commands.length / lines.length >= 0.6;
}

/** Picks a language when none is given. Unclear text (program output, configs) stays plain. */
export function detectLanguage(code: string, label = ""): string {
  if (/powershell/i.test(label)) return "powershell";
  if (/#include\s*<|void\s+(setup|loop)\s*\(|\bSerial\.\w+\(|int\s+main\s*\(/.test(code)) return "cpp";
  if (/^\s*(def |class \w+|import \w|from [\w.]+ import |async def |@\w+)/m.test(code) || /^\s*(for|while|if|elif|with)\b[^\n]*:\s*$/m.test(code)) return "python";
  if (looksLikeShell(code)) return "bash";
  const statements = code.split("\n").map(line => line.trim()).filter(line => line && !line.startsWith("#"));
  const pythonish = statements.filter(line => /^[\w.\[\], ]+\s[+\-*/]?=\s\S/.test(line) || /^(for|if|elif|else|while|return|print)\b/.test(line) || /^\w[\w.]*\(.*\)$/.test(line));
  if (statements.length && pythonish.length / statements.length >= 0.6) return "python";
  const trimmed = code.trim();
  if (/^[[{]/.test(trimmed)) { try { JSON.parse(trimmed); return "json"; } catch {} }
  if (/^<[\w?!]/.test(trimmed) && /<\/\w+>|\/>/.test(trimmed)) return "xml";
  const auto = hljs.highlightAuto(code, ["python", "bash", "cpp", "yaml"]);
  return auto.language && auto.relevance >= 10 ? auto.language : "plaintext";
}

export function highlightCode(code: string, language?: string, label?: string): { html: string; language: string } {
  const requested = language ? (aliases[language.toLowerCase()] || language.toLowerCase()) : detectLanguage(code, label);
  if (requested === "plaintext" || requested === "text" || !hljs.getLanguage(requested)) return { html: escapeHtml(code), language: "plaintext" };
  const html = hljs.highlight(code, { language: requested, ignoreIllegals: true }).value;
  return { html: requested === "python" || requested === "cpp" ? markIdentifiers(html) : html, language: requested };
}

const controlKeywords = new Set(["if", "elif", "else", "for", "while", "return", "import", "from", "try", "except", "finally", "break", "continue", "with", "as", "raise", "yield", "await", "pass", "switch", "case", "do", "goto", "include"]);
/** VS Code-style extras: control keywords, function calls and plain variables in top-level code text. */
function markIdentifiers(html: string) {
  let depth = 0;
  return html.split(/(<span[^>]*>|<\/span>)/).map(part => {
    if (part.startsWith("<span")) { depth++; return part; }
    if (part === "</span>") { depth--; return part; }
    if (depth > 0) return part;
    return part.replace(/(&[a-z]+;)|\b([A-Za-z_]\w*)\b(\s*\()?/g, (whole, entity: string | undefined, name: string, call: string | undefined) => {
      if (entity) return whole;
      return call ? `<span class="hljs-title function_ invoke__">${name}</span>${call}` : `<span class="hljs-variable">${name}</span>`;
    });
  }).join("").replace(/<span class="hljs-keyword">(\w+)<\/span>/g, (whole, word: string) => controlKeywords.has(word) ? `<span class="hljs-keyword hljs-control">${word}</span>` : whole);
}

/** Splits highlighted HTML into lines, closing and reopening spans that cross a line break. */
function splitHighlightedLines(html: string) {
  const lines: string[] = [];
  let open: string[] = [], current = "";
  for (const part of html.split(/(<span[^>]*>|<\/span>|\n)/)) {
    if (part === "\n") { lines.push(current + "</span>".repeat(open.length)); current = open.join(""); }
    else if (part.startsWith("<span")) { open.push(part); current += part; }
    else if (part === "</span>") { open.pop(); current += part; }
    else current += part;
  }
  lines.push(current);
  return lines;
}

/** Highlights code inside generated lesson HTML: per-line `am-code` blocks and plain `<pre><code>` blocks. */
export function highlightHtmlBlocks(html: string): string {
  const lineBlocks = html.replace(/<code data-lang="([\w+-]*)">((?:<span class="am-ln"[^>]*>[\s\S]*?<\/span>)*)<\/code>/g, (whole, lang: string, body: string) => {
    const lines = [...body.matchAll(/<span class="am-ln"([^>]*)>([\s\S]*?)<\/span>/g)];
    if (lines.some(line => /<[a-z]/i.test(line[2]))) return whole;   // already marked up
    const { html: highlighted } = highlightCode(lines.map(line => decodeHtml(line[2])).join("\n"), lang || undefined);
    const out = splitHighlightedLines(highlighted);
    return `<code data-lang="${lang}" class="hljs">${lines.map((line, i) => `<span class="am-ln"${line[1]}>${out[i] ?? ""}</span>`).join("")}</code>`;
  });
  return lineBlocks.replace(/(<pre[^>]*>)<code>([^<]*)<\/code>(<\/pre>)/g, (_whole, pre: string, body: string, end: string) => {
    const { html: highlighted, language } = highlightCode(decodeHtml(body));
    return `${pre}<code class="hljs language-${language}">${highlighted}</code>${end}`;
  });
}
