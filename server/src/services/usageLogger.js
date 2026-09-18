export function logUsage(question, usage) {
  if (!usage) {
    console.log(`[usage] "${question.slice(0, 50)}" — no usage data returned`);
    return { promptTokens: 0, completionTokens: 0, costUsd: 0 };
  }

  console.log(
    `[usage] "${question.slice(0, 50)}${question.length > 50 ? '...' : ''}" ` +
    `in=${usage.prompt_tokens} out=${usage.completion_tokens} cost=$0.00000 (free tier)`
  );

  return { promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens, costUsd: 0 };
}