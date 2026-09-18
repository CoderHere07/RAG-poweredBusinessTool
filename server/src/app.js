import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import documentsRouter from './routes/documents.js';
import chatRouter from './routes/chat.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ragServiceUrl: config.ragServiceUrl });
});

app.use('/api/documents', documentsRouter);
app.use('/api/chat', chatRouter);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});