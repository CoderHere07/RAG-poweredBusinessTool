export default function CitedText({ text, onCiteClick }) {
  const parts = text.split(/(\[Source \d+\])/g);

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[Source (\d+)\]$/);
        if (!match) return <span key={i}>{part}</span>;

        const sourceNum = parseInt(match[1], 10);
        return (
          <button
            key={i}
            onClick={() => onCiteClick(sourceNum)}
            className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded mx-0.5 hover:bg-blue-200 transition-colors align-baseline"
          >
            {sourceNum}
          </button>
        );
      })}
    </>
  );
}