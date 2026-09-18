import OpenAI from 'openai';
import { config } from '../config.js';

export const openrouter = new OpenAI({
  apiKey: config.openrouterApiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'DocQA RAG Tool',
  },
});

export const CHAT_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';