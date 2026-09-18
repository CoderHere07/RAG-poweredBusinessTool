import CitedText from './CitedText';

export default function ChatMessage({ role, content, isStreaming, onCiteClick }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap
          ${isUser ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
      >
        {isUser ? content : <CitedText text={content} onCiteClick={onCiteClick} />}
        {isStreaming && <span className="inline-block w-1.5 h-4 bg-gray-400 ml-1 animate-pulse" />}
      </div>
    </div>
  );
}