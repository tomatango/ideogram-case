export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || req.body.apiKey;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'API key not configured on server.' } });
  }

  const { parts, model } = req.body;
  if (!parts || !Array.isArray(parts)) {
    return res.status(400).json({ error: { message: 'Invalid request body.' } });
  }

  const imageModel = model || 'gemini-3.1-flash-image-preview';
  const generationConfig = { responseModalities: ['TEXT', 'IMAGE'] };

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig,
      }),
    }
  );

  const data = await upstream.json();
  return res.status(upstream.status).json(data);
}
