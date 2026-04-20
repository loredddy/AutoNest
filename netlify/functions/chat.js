// netlify/functions/chat.js
// Serverless function — runs on Netlify's servers, not the browser
// Keeps GROQ_API_KEY secret

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama3-8b-8192"; // Free, fast, same family as your local model

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // CORS headers — allow your Netlify frontend to call this
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const { system, user, maxTokens = 500 } = JSON.parse(event.body);

    if (!user) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing user prompt" }) };
    }

    const messages = [];
    if (system) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: user });

    const response = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, // Set in Netlify dashboard
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: 0.85,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { statusCode: response.status, headers, body: JSON.stringify({ error: err }) };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
