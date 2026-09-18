import { useEffect, useRef } from 'react';

export default function SourcesPanel({ sources, activeSource }) {
  const refs = useRef({});

  useEffect(() => {
    if (activeSource && refs.current[activeSource]) {
      refs.current[activeSource].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeSource]);

  if (!sources || sources.length === 0) {
    return <p className="text-sm text-gray-400">No sources yet — ask a question to see citations here.</p>;
  }

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto">
      {sources.map((source, i) => {
        const num = i + 1;
        const isActive = activeSource === num;
        return (
          <div
            key={num}
            ref={(el) => (refs.current[num] = el)}
            className={`p-3 rounded border text-sm transition-colors
              ${isActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded">
                {num}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {source.source} · page {source.page}
              </span>
            </div>
            <p className="text-gray-600 text-xs line-clamp-4">{source.text}</p>
          </div>
        );
      })}
    </div>
  );
}