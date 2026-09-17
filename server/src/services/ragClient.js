import axios from 'axios';
import FormData from 'form-data';
import { config } from '../config.js';

const ragApi = axios.create({ baseURL: config.ragServiceUrl, timeout: 30000 });

export async function ingestDocument(fileBuffer, filename, mimetype) {
  const form = new FormData();
  form.append('file', fileBuffer, { filename, contentType: mimetype });

  const { data } = await ragApi.post('/ingest', form, { headers: form.getHeaders() });
  return data;
}

export async function queryChunks(question, { topK = 5, docIds = null } = {}) {
  const { data } = await ragApi.post('/query', { question, top_k: topK, doc_ids: docIds });
  return data;
}

export async function listDocuments() {
  const { data } = await ragApi.get('/documents');
  return data;
}

export async function deleteDocument(docId) {
  const { data } = await ragApi.delete(`/documents/${docId}`);
  return data;
}