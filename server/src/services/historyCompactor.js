import { openrouter, CHAT_MODEL } from './openrouterClient.js';

const MAX_HISTORY_CHARS = 6000;   // rough proxy for tokens without a tokenizer dependency
const KEEP_RECENT_TURNS = 4;      // always keep the last N turns verbatim

function estimateChars(history) {
  return history.reduce((sum, turn) => sum + turn.content.length, 0);
}

export async function compactHistory(history) {
  if (estimateChars(history) < MAX_HISTORY_CHARS || history.length <= KEEP_RECENT_TURNS) {
    return history;
  }

  const older = history.slice(0, -KEEP_RECENT_TURNS);
  const recent = history.slice(-KEEP_RECENT_TURNS);

  const olderText = older.map((t) => `${t.role}: ${t.content}`).join('\n');

  const summaryResponse = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Summarize this conversation in under 150 words, preserving key facts, decisions, and questions asked:\n\n${olderText}`,
      },
    ],
  });

  const summary = summaryResponse.choices[0].message.content;

  return [
    { role: 'user', content: `[Earlier conversation summary: ${summary}]` },
    { role: 'assistant', content: 'Understood, continuing from there.' },
    ...recent,
  ];
}