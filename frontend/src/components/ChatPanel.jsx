import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

export default function ChatPanel({ selectedIds }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');
    // Actual streaming call wired in commit 20 — for now just echo, to verify rendering.
  };

  return (
    <div className="flex flex-col h-[500px] border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">Ask a question about your documents.</p>
        )}
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}