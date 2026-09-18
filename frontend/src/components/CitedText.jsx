export default function CitedText({ text, onCiteClick }) {
  const parts = text.split(/(\[Source \d+(?:,\s*Source \d+)*\])/g);

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[Source (\d+(?:,\s*Source \d+)*)\]$/);
        if (!match) return <span key={i}>{part}</span>;

        const sourceNums = match[1].match(/\d+/g).map(Number);

        return (
          <span key={i} className="inline-flex gap-0.5">
            {sourceNums.map((num) => (
              <button
                key={num}
                onClick={() => onCiteClick(num)}
                className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-blue-200 transition-colors align-baseline"
              >
                {num}
              </button>
            ))}
          </span>
        );
      })}
    </>
  );
}