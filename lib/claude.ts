// Server-only. Talks to the AI model through OpenRouter. The key comes from .env.local
// (OPENROUTER_API_KEY) and is never sent to the browser.

const URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-haiku-5.5"; // fast and cheap, to stay inside the 10-second goal
const TIMEOUT_MS = 8000;

export type AiFailure = "no_key" | "timeout" | "unavailable" | "bad_output";

export class AiError extends Error {
  constructor(public reason: AiFailure) {
    super(reason);
  }
}

export function aiErrorMessage(reason: AiFailure): string {
  switch (reason) {
    case "no_key":
      return "The AI isn't set up on this server (missing API key).";
    case "timeout":
      return "The AI took too long to answer.";
    case "bad_output":
      return "The AI gave an answer we couldn't use.";
    default:
      return "The AI service is unavailable right now.";
  }
}

type Message = { role: string; content: string | null; tool_calls?: { function: { arguments: string } }[] };

async function chat(body: Record<string, unknown>): Promise<Message> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.startsWith("paste-your")) throw new AiError("no_key");
  let res: Response;
  try {
    res = await fetch(URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, ...body }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    throw new AiError(timedOut ? "timeout" : "unavailable");
  }
  if (!res.ok) throw new AiError("unavailable");
  try {
    const data = await res.json();
    const msg = data?.choices?.[0]?.message;
    if (!msg) throw new Error("no message");
    return msg;
  } catch {
    throw new AiError("bad_output");
  }
}

/** Asks Claude to fill in a fixed form (a "tool") so we get clean fields back. */
export async function askForJson(opts: {
  system: string;
  user: string;
  toolName: string;
  schema: Record<string, unknown>;
}): Promise<unknown> {
  const msg = await chat({
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    tools: [{ type: "function", function: { name: opts.toolName, description: "Record the extracted facts.", parameters: opts.schema } }],
    tool_choice: { type: "function", function: { name: opts.toolName } },
  });
  try {
    return JSON.parse(msg.tool_calls?.[0]?.function.arguments ?? "");
  } catch {
    throw new AiError("bad_output");
  }
}

export async function askForText(opts: { system: string; user: string }): Promise<string> {
  const msg = await chat({
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  });
  const text = (msg.content ?? "").trim();
  if (!text) throw new AiError("bad_output");
  return text;
}
