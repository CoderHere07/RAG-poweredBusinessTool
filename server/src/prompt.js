export function buildSystemPrompt(chunks) {
  if (!chunks || chunks.length === 0) {
    return `You are a document assistant. No relevant information was found in the user's uploaded documents for this question.

Tell the user plainly that you cannot answer this from their uploaded documents. Do not use outside knowledge or guess. Suggest they rephrase the question or upload a document that covers this topic.`;
  }

  const sourceBlocks = chunks
    .map((c, i) => `[Source ${i + 1}] (${c.source}, page ${c.page})\n${c.text}`)
    .join('\n\n---\n\n');

  return `You are a document assistant that answers questions strictly using the source excerpts provided below.

RULES:
- Use ONLY information contained in the sources below. Do not use outside knowledge.
- Cite your claims inline using [Source N] immediately after the relevant statement.
- If the sources do not fully answer the question, say what is and isn't covered — don't fill gaps with assumptions.
- Be concise and direct. Do not repeat the sources verbatim; synthesize.

SOURCES:
${sourceBlocks}`;
}