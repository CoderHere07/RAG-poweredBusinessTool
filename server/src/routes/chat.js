import { Router } from 'express';
import { queryChunks } from '../services/ragClient.js';
import { buildSystemPrompt } from '../prompt.js';
import { openrouter, CHAT_MODEL } from '../services/openrouterClient.js';
import { logUsage } from '../services/usageLogger.js';
import { compactHistory } from '../services/historyCompactor.js';

const router = Router();

router.post('/', async (req, res) => {
  const { question, docIds, history = [] } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'empty_question', message: 'Question is required.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (event, data) => {
    if (res.writableEnded) return;   // client already gone — don't write to a closed stream
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const controller = new AbortController();
  let clientDisconnected = false;

  req.on('close', () => {
    if (!res.writableEnded) {
      clientDisconnected = true;
      controller.abort();
    }
  });

  try {
    const { chunks } = await queryChunks(question, { docIds });
    if (clientDisconnected) return;
    send('sources', chunks);

    const systemPrompt = buildSystemPrompt(chunks);
    const compactedHistory = await compactHistory(history);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...compactedHistory.map((turn) => ({ role: turn.role, content: turn.content })),
      { role: 'user', content: question },
    ];

    const stream = await openrouter.chat.completions.create(
      {
        model: CHAT_MODEL,
        max_tokens: 1024,
        stream: true,
        stream_options: { include_usage: true },
        messages,
      },
      { signal: controller.signal }
    );

    let usage = null;

    for await (const part of stream) {
      if (clientDisconnected) break;
      const delta = part.choices?.[0]?.delta?.content;
      if (delta) send('token', { text: delta });
      if (part.usage) usage = part.usage;
    }

    if (!clientDisconnected) {
      const loggedUsage = logUsage(question, usage);
      send('done', { usage: loggedUsage });
      res.end();
    }
  } catch (err) {
    if (err.name === 'AbortError' || clientDisconnected) {
      console.log(`[chat] Request aborted (client disconnected): "${question.slice(0, 50)}"`);
      return;
    }
    send('error', { message: err.message });
    res.end();
  }
});

export default router;