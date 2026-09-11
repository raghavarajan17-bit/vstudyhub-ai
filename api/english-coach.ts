import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  const { mode, userMessage } = req.body || {};

  const systemInstruction = `You are an elite English Communication and Interview Coach on VStudyHub.
Your goal is to help users speak clear, professional, and impactful English for global career opportunities.

Current Coaching Mode: ${mode || 'interview'}

Instructions:
1. Evaluate the user's latest response for vocabulary, grammar, and tone.
2. High-impact rule: If they used weak or passive verbs (e.g., "did", "worked on", "helped with"), suggest stronger action verbs (e.g., "spearheaded", "engineered", "orchestrated").
3. Keep feedback encouraging, concise, and structured:
   - Brief Feedback / Grammar Check
   - Vocabulary Enhancement (1-2 strong verb suggestions)
   - One direct follow-up question to keep the interview session moving forward.`;

  try {
    const formattedPrompt = `${systemInstruction}\n\nUser Input: ${userMessage || ''}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: formattedPrompt }] }],
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