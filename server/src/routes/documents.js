import { Router } from 'express';
import multer from 'multer';
import { ingestDocument, listDocuments, deleteDocument } from '../services/ragClient.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'no_file', message: 'No file was uploaded.' });
  }
  try {
    const result = await ingestDocument(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json(result);
  } catch (err) {
    const status = err.response?.status || 500;
    const detail = err.response?.data?.detail || { error: 'ingest_failed', message: err.message };
    res.status(status).json(detail);
  }
});

router.get('/', async (req, res) => {
  try {
    res.json(await listDocuments());
  } catch (err) {
    res.status(500).json({ error: 'list_failed', message: err.message });
  }
});

router.delete('/:docId', async (req, res) => {
  try {
    res.json(await deleteDocument(req.params.docId));
  } catch (err) {
    const status = err.response?.status || 500;
    const detail = err.response?.data?.detail || { error: 'delete_failed', message: err.message };
    res.status(status).json(detail);
  }
});

export default router;