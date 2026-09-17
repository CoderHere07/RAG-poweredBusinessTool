import dotenv from 'dotenv';
dotenv.config();

function required(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const config = {
  port: process.env.PORT || 3001,
  openaiApiKey: required('OPENAI_API_KEY'),
  ragServiceUrl: process.env.RAG_SERVICE_URL || 'http://localhost:8000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};