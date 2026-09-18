import { Router } from 'express';
import { queryChunks } from '../services/ragClient.js';
import { buildSystemPrompt } from '../prompt.js';
import { openrouter, CHAT_MODEL } from '../services/openrouterClient.js';
import { logUsage } from '../services/usageLogger.js';

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
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Fresh retrieval per question — history informs the conversation,
    // not what gets searched for.
    const { chunks } = await queryChunks(question, { docIds });
    send('sources', chunks);

    const systemPrompt = buildSystemPrompt(chunks);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((turn) => ({ role: turn.role, content: turn.content })),
      { role: 'user', content: question },
    ];

    const stream = await openrouter.chat.completions.create({
      model: CHAT_MODEL,
      max_tokens: 1024,
      stream: true,
      stream_options: { include_usage: true },
      messages,
    });

    let usage = null;
    for await (const part of stream) {
      const delta = part.choices?.[0]?.delta?.content;
      if (delta) send('token', { text: delta });
      if (part.usage) usage = part.usage;
    }

    const loggedUsage = logUsage(question, usage);
    send('done', { usage: loggedUsage });
    res.end();
  } catch (err) {
    send('error', { message: err.message });
    res.end();
  }
});

export default router;