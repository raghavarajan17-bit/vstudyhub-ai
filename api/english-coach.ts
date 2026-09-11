import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  const { mode, userMessage, history } = req.body || {};

  const systemInstruction = `You are an elite English Communication and Interview Coach on VStudyHub.
Your goal is to help users speak clear, professional, and impactful English for global career opportunities.

Current Coaching Mode: ${mode || 'interview'}

Instructions:
1. Evaluate the user's latest message for vocabulary, grammar, and tone.
2. If passive or weak verbs are used, suggest 1-2 strong action verbs.
3. Advance the practice session by asking a logical, dynamic follow-up question. DO NOT repeat past questions or generic responses.`;

  // Format past history into structured contents for Gemini
  const contents = [];

  if (Array.isArray(history) && history.length > 0) {
    history.forEach((msg: { role: string; text: string }) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });
  }

  // Append the current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage || '' }]
  });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: contents
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'Failed to generate response' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}