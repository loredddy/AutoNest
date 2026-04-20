// ═══════════════════════════════════════════════
// AUTONEST — AUTO AGENT (News, Trending, Discussions)
// Powered by Ollama local LLM
// ═══════════════════════════════════════════════

import { callOllama, callOllamaJSON } from "./ollamaAgent";

export { callOllama };

export { callOllama as callAgent, callOllamaJSON as callAgentJSON };

export async function fetchAutoNews(topic = "general") {
  return callOllamaJSON({
    system: `You are AutoNest's News Agent. Generate realistic automobile industry news.
Output a JSON array of exactly 6 objects with these exact fields:
[
  {
    "id": 1,
    "headline": "short punchy headline",
    "summary": "two sentence summary",
    "category": "EV",
    "timestamp": "2025-04-15T10:00:00Z",
    "readTime": "3 min read",
    "heat": 4
  }
]
category must be one of: EV, Racing, Industry, Classic, Tech, Policy
heat is an integer 1-5`,
    user: `Generate 6 automobile news items. Topic: ${topic}. Use real brands like Ferrari, BMW, Tesla, Porsche.`,
    maxTokens: 1000,
  });
}

export async function fetchTrending() {
  return callOllamaJSON({
    system: `You are AutoNest's Trend Agent. Output trending car community topics as JSON.
Output a JSON array of exactly 8 objects:
[
  {
    "id": 1,
    "topic": "topic name",
    "mentions": 45000,
    "change": "+12%",
    "category": "EV",
    "hot": true
  }
]
mentions is an integer between 5000 and 250000
hot is true or false`,
    user: `List 8 trending automobile topics right now. Mix EVs, supercars, racing, and classics.`,
    maxTokens: 700,
  });
}

export async function fetchDiscussions() {
  return callOllamaJSON({
    system: `You are AutoNest's Community Agent. Simulate a car enthusiast forum.
Output a JSON array of exactly 5 objects:
[
  {
    "id": 1,
    "title": "debate title",
    "author": "username",
    "avatar": "🏎️",
    "replies": 42,
    "upvotes": 128,
    "category": "Debate",
    "preview": "one sentence preview",
    "timeAgo": "2 hours ago",
    "pinned": false
  }
]
category must be one of: Hot Take, Question, Debate, Build Log, Review
Only ONE item may have pinned: true`,
    user: `Generate 5 spicy car forum threads. Make the titles controversial and debate-worthy.`,
    maxTokens: 700,
  });
}
