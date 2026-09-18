import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);

  const ask = useCallback(async (question, docIds, history, { onSources, onToken, onDone, onError }) => {
    setIsStreaming(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          docIds: docIds.length ? docIds : null,
          history,
        }),
      });

      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop();

        for (const raw of events) {
          const eventMatch = raw.match(/^event: (.+)$/m);
          const dataMatch = raw.match(/^data: (.+)$/m);
          if (!dataMatch) continue;

          const eventType = eventMatch?.[1] ?? 'message';
          const payload = JSON.parse(dataMatch[1]);

          if (eventType === 'sources') onSources?.(payload);
          if (eventType === 'token') onToken?.(payload.text);
          if (eventType === 'done') onDone?.(payload);
          if (eventType === 'error') onError?.(payload.message);
        }
      }
    } catch (err) {
      onError?.(err.message);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { ask, isStreaming };
}