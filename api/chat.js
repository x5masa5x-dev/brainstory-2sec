import https from "https";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { apiKey, system, messages } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "API key required" });
  }

  // Clean the API key - remove any non-ASCII characters
  const cleanKey = apiKey.replace(/[^\x20-\x7E]/g, "").trim();

  const payload = JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: system,
    messages: messages
  });

  const data = Buffer.from(payload, "utf-8");

  return new Promise((resolve) => {
    const options = {
      hostname: "api.anthropic.com",
      port: 443,
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
        "x-api-key": cleanKey,
        "anthropic-version": "2023-06-01"
      }
    };

    const request = https.request(options, (response) => {
      let body = "";
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.status(response.statusCode).send(body);
        resolve();
      });
    });

    request.on("error", (err) => {
      res.status(500).json({ error: err.message });
      resolve();
    });

    request.write(data);
    request.end();
  });
}
