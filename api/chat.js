export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { apiKey, system, messages } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "API key required" });
  }

  try {
    const payload = JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: system,
      messages: messages
    });

    const encoder = new TextEncoder();
    const bodyBytes = encoder.encode(payload);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(bodyBytes.length),
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: bodyBytes
    });

    const text = await response.text();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(response.status).send(text);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
