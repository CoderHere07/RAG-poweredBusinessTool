import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import SourcesPanel from './SourcesPanel';
import { useChatStream } from '../hooks/useChatStream';

export default function ChatPanel({ selectedIds }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentSources, setCurrentSources] = useState([]);
  const [activeSource, setActiveSource] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const bottomRef = useRef(null);
  const { ask, isStreaming } = useChatStream();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isStreaming) return;

    const history = messages
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));

    setInput('');
    setActiveSource(null);
    setConnectionError(null);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: '', isStreaming: true },
    ]);

    const appendToLastAssistant = (updater) => {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        next[next.length - 1] = { ...last, ...updater(last) };
        return next;
      });
    };

    await ask(question, selectedIds, history, {
      onSources: (sources) => setCurrentSources(sources),
      onToken: (text) => appendToLastAssistant((last) => ({ content: last.content + text })),
      onDone: () => appendToLastAssistant(() => ({ isStreaming: false })),
      onError: (message) => {
        appendToLastAssistant(() => ({ content: `⚠️ ${message}`, isStreaming: false }));
        if (message.includes('Failed to fetch') || message.includes('Request failed')) {
          setConnectionError('Cannot reach the server — is it running?');
        }
      },
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col h-[500px] border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-8">
              Ask a question about your documents.
            </p>
          )}
          {messages.map((m, i) => (
            <ChatMessage
              key={i}
              role={m.role}
              content={m.content}
              isStreaming={m.isStreaming}
              onCiteClick={setActiveSource}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {connectionError && (
          <p className="text-xs text-red-500 px-3 pb-1">{connectionError}</p>
        )}

        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            disabled={isStreaming}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isStreaming}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isStreaming ? '…' : 'Send'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Sources</h3>
        <SourcesPanel sources={currentSources} activeSource={activeSource} />
      </div>
    </div>
  );
}