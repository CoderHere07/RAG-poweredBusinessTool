import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import documentsRouter from './routes/documents.js';
import chatRouter from './routes/chat.js';
import { chatLimiter, apiLimiter } from './middleware/rateLimiter.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));   // JSON body cap — file uploads bypass this via multer
app.use(apiLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ragServiceUrl: config.ragServiceUrl });
});

app.use('/api/documents', documentsRouter);
app.use('/api/chat', chatLimiter, chatRouter);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});