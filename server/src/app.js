import express from 'express';
import cors from 'cors';
import { config } from './config.js';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ragServiceUrl: config.ragServiceUrl });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});