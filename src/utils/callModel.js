import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function callModel(prompt, model) {
  if (model === 'gpt-4') {
    const res = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });
    return res.choices[0].message.content;
  }

  if (model === 'claude-3-opus') {
    return `Claude response for: ${prompt}`;
  }

  if (model === 'gemini-pro') {
    return `Gemini response for: ${prompt}`;
  }

  if (model === 'mistral-7b') {
    return `Mistral response for: ${prompt}`;
  }

  return '❌ Unknown model';
}
