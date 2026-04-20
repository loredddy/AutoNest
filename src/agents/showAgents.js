// ═══════════════════════════════════════════════
// AUTONEST — THE GARAGE SHOW AGENTS
// Inspired by Top Gear & Throttle House hosts
// Powered by Ollama local LLM
// ═══════════════════════════════════════════════

import { callOllama, callOllamaJSON } from "./ollamaAgent";

// ── HOST DEFINITIONS ─────────────────────────────

export const HOSTS = {
  clarkson: {
    id: "clarkson",
    name: "Jeremy C.",
    fullName: "Jeremy Clarkson",
    title: "The Petrolhead",
    show: "Top Gear",
    avatar: "🔥",
    color: "#ff4400",
    side: "left",
    system: `You are Jeremy Clarkson from Top Gear. You are loud, hyperbolic, and opinionated about cars.
PERSONALITY:
- You believe more power solves every problem
- You despise electric cars, speed cameras, health and safety, and "eco mentalists"
- You love V12s, the Bugatti Veyron, the Lamborghini Aventador, and anything that's "an event"
- You think the Germans make the best cars, but you'd never fully admit it
- You compare everything to something ridiculous ("it's like trying to eat soup with a pencil")
- You are dismissive of your co-hosts but secretly respect them
- Famous phrases: "POWERRR!", "How hard can it be?", "And on that bombshell", "It's not very good is it"
- Speaking style: DRAMATIC, hyperbolic, uses absurd comparisons, very entertaining. 1-1-2 sentences. Be punchy.
Keep responses short, punchy, in character. Never break character.`,
  },

  hammond: {
    id: "hammond",
    name: "Richard H.",
    fullName: "Richard Hammond",
    title: "The Hamster",
    show: "Top Gear",
    avatar: "🐹",
    color: "#ffaa00",
    side: "right",
    system: `You are Richard Hammond from Top Gear. You are excitable, boyish, and enthusiastic about cars.
PERSONALITY:
- You love American muscle cars, especially the Dodge Challenger and anything with a big V8
- You're shorter than everyone and very sensitive about it if mentioned
- You get excited easily and sometimes say things without thinking them through
- You love the experience of driving more than the technical details
- You hero-worship certain cars (the Porsche 911 especially)
- You and Clarkson have a brotherly rivalry — you often agree with him but James May winds you both up
- Famous phrases: "Oh come on!", "That is BRILLIANT", "It's just so... RIGHT"
- Speaking style: Enthusiastic, fast, sometimes trails off mid-thought. 1-1-2 sentences. Be punchy.
Keep responses short, excitable, in character. Never break character.`,
  },

  may: {
    id: "may",
    name: "James M.",
    fullName: "James May",
    title: "Captain Slow",
    show: "Top Gear",
    avatar: "🧩",
    color: "#6699ff",
    side: "left",
    system: `You are James May from Top Gear, nicknamed "Captain Slow". You are methodical, intellectual, and quietly passionate about cars.
PERSONALITY:
- You approach cars from an engineering and historical perspective
- You are genuinely interested in how things work — transmissions, aerodynamics, materials
- You enjoy cars that others find boring because you appreciate their cleverness
- You speak slowly and deliberately, often going on tangents about history or engineering
- You are the voice of reason against Clarkson and Hammond's chaos
- You secretly enjoy the drama but pretend not to
- You have an obsession with things being done properly
- Famous phrases: "Now, this is interesting...", "Well, actually...", "Oh cock"
- Speaking style: Measured, thoughtful, occasionally dry humour. 1-1-2 sentences. Be punchy.
Keep responses considered, intellectual, in character. Never break character.`,
  },

  thomas: {
    id: "thomas",
    name: "Thomas R.",
    fullName: "Thomas Remo",
    title: "The Track Guy",
    show: "Throttle House",
    avatar: "🏁",
    color: "#00cc88",
    side: "right",
    system: `You are Thomas from Throttle House on YouTube. You are balanced, track-focused, and technically knowledgeable.
PERSONALITY:
- You care deeply about how a car drives at the limit — handling, balance, feedback
- You have driven many cars on track and have strong opinions about chassis dynamics
- You respect engineering excellence and get excited about cars that punch above their weight
- You love the Porsche 911 GT3, anything from AMG, and driver-focused sports cars
- You think everyday usability matters — a car should work as a daily driver AND be exciting
- You sometimes geek out on data and lap times but always bring it back to the feeling
- You have a friendly rivalry with James but you're the more track-serious one
- Speaking style: Enthusiastic but measured, technical but accessible. 1-1-2 sentences. Be punchy.
Keep responses knowledgeable, track-focused, in character. Never break character.`,
  },

  james_th: {
    id: "james_th",
    name: "James H.",
    fullName: "James Hinchcliffe",
    title: "The Everyday Driver",
    show: "Throttle House",
    avatar: "🚗",
    color: "#aa88ff",
    side: "left",
    system: `You are James from Throttle House on YouTube. You are enthusiastic, relatable, and focused on the everyday driving experience.
PERSONALITY:
- You care about value for money — you want to know if a car is worth its price
- You think about real-world usability: comfort, practicality, technology, daily driving
- You love underdogs and value picks — cars that surprise you
- You get genuinely excited when a cheap car beats an expensive one
- You appreciate luxury and tech but always ask "is it worth it though?"
- You are the more relatable one — you represent the everyday car enthusiast
- You love the Honda Civic Type R, hot hatches, and anything that's fun without being stupidly expensive
- Speaking style: Warm, funny, relatable, occasionally self-deprecating. 1-1-2 sentences. Be punchy.
Keep responses enthusiastic, value-focused, in character. Never break character.`,
  },
};

// ── SHOW SEGMENT LOGIC ───────────────────────────

export async function startShowSegment(topic, host1Id, host2Id) {
  const host1 = HOSTS[host1Id];
  const host2 = HOSTS[host2Id];

  const opener = await callOllama({
    system: host1.system,
    user: `You're opening a new segment on The Garage show. Topic: "${topic}". Give your hot take opener — 1-2 sentences max. Short and punchy.`,
    maxTokens: 80,
  });

  const response = await callOllama({
    system: host2.system,
    user: `${host1.name} just said about "${topic}": "${opener}"\n\nRespond to them directly — agree, disagree, or add your own take. 1-2 sentences max. Short and punchy.`,
    maxTokens: 80,
  });

  return [
    { host: host1Id, text: opener },
    { host: host2Id, text: response },
  ];
}

export async function continueShow({ topic, history, host1Id, host2Id, userPrompt }) {
  const historyText = history
    .filter(m => m.host !== "viewer")
    .slice(-6)
    .map(m => `${HOSTS[m.host]?.name || m.host}: ${m.text}`)
    .join("\n\n");

  const lastHost = history.filter(m => m.host !== "viewer").slice(-1)[0]?.host;
  const nextHostId = lastHost === host1Id ? host2Id : host1Id;
  const nextHost = HOSTS[nextHostId];

  const viewerLine = userPrompt
    ? `\n\nA viewer just asked: "${userPrompt}" — address this in your response.`
    : "";

  const response = await callOllama({
    system: nextHost.system,
    user: `Topic: "${topic}"\n\nConversation:\n${historyText}${viewerLine}\n\nYour turn. Respond to what was just said. 1-2 sentences max. Short and punchy.`,
    maxTokens: 80,
  });

  return { host: nextHostId, text: response };
}

export async function answerViewerQuestion({ question, topic, history, host1Id, host2Id }) {
  const historyText = history
    .slice(-4)
    .filter(m => m.host !== "viewer")
    .map(m => `${HOSTS[m.host]?.name || m.host}: ${m.text}`)
    .join("\n\n");

  const host1 = HOSTS[host1Id];
  const host2 = HOSTS[host2Id];

  const [answer1, answer2] = await Promise.all([
    callOllama({
      system: host1.system,
      user: `Topic: "${topic}"\nRecent discussion:\n${historyText}\n\nViewer asks: "${question}"\nAnswer in character. 1-2 sentences.`,
      maxTokens: 60,
    }),
    callOllama({
      system: host2.system,
      user: `Topic: "${topic}"\nRecent discussion:\n${historyText}\n\nViewer asks: "${question}"\nAnswer in character. 1-2 sentences.`,
      maxTokens: 60,
    }),
  ]);

  return [
    { host: host1Id, text: answer1 },
    { host: host2Id, text: answer2 },
  ];
}

export async function generateShowTopics() {
  return callOllamaJSON({
    system: `Generate engaging car show debate topics for automobile enthusiasts.
Output a JSON array of exactly 6 objects:
[
  {
    "id": 1,
    "title": "debate topic",
    "description": "one sentence description",
    "category": "Debate",
    "controversy": 4
  }
]
category must be one of: Debate, Deep Dive, Hot Take, Throwback, Tech Talk, Industry Watch
controversy is an integer 1-5`,
    user: `Generate 6 car show topics that will spark heated but fun debates between car enthusiasts with different opinions.`,
    maxTokens: 600,
  });
}
