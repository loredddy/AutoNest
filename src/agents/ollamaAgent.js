// ═══════════════════════════════════════════════
// AUTONEST — AI AGENT CORE
// Local:      Ollama at localhost:11434
// Production: Vercel function → Groq API
// Auto-detects environment
// ═══════════════════════════════════════════════

const IS_LOCAL = window.location.hostname === "localhost";
const VERCEL_FUNCTION = "/api/chat";
const OLLAMA_BASE = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3.2:3b";

export async function callOllama({ system, user, maxTokens = 80 }) {
  if (IS_LOCAL) {
    return callOllamaLocal({ system, user, maxTokens });
  } else {
    return callGroqViaVercel({ system, user, maxTokens });
  }
}

async function callOllamaLocal({ system, user, maxTokens }) {
  const response = await fetch(OLLAMA_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      system,
      prompt: user,
      stream: false,
      options: {
        num_predict: maxTokens,
        num_ctx: 512,
        temperature: 0.85,
        top_k: 20,
        repeat_penalty: 1.1,
        stop: ["\n\n", "User:", "Human:"],
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error ${response.status}: ${err}`);
  }

  const data = await response.json();
  if (!data.response) throw new Error("Ollama returned empty response");
  return data.response.trim();
}

async function callGroqViaVercel({ system, user, maxTokens }) {
  const response = await fetch(VERCEL_FUNCTION, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user, maxTokens }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  if (!data.text) throw new Error("API returned empty response");
  return data.text;
}

export async function callOllamaJSON({ system, user, maxTokens = 600 }) {
  const raw = await callOllama({
    system: system + "\n\nOutput ONLY raw JSON. No markdown. No explanation. Start with [ or {",
    user,
    maxTokens,
  });

  try {
    const jsonMatch = raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    const clean = jsonMatch ? jsonMatch[0] : raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON parse failed:", raw.slice(0, 400));
    throw new Error("Agent returned invalid JSON");
  }
}

export async function checkOllamaStatus() {
  if (!IS_LOCAL) {
    try {
      const res = await fetch(VERCEL_FUNCTION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: "ping", maxTokens: 5 }),
      });
      return { online: res.ok, hasModel: res.ok, models: ["groq/llama3-8b"] };
    } catch {
      return { online: false, hasModel: false, models: [] };
    }
  }

  try {
    const res = await fetch("http://localhost:11434/api/tags");
    if (!res.ok) return { online: false, hasModel: false };
    const data = await res.json();
    const models = data.models || [];
    const hasModel = models.some(m => m.name.includes("llama3"));
    return { online: true, hasModel, models: models.map(m => m.name) };
  } catch {
    return { online: false, hasModel: false, models: [] };
  }
}

export { OLLAMA_MODEL as MODEL };
