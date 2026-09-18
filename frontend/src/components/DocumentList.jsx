import { useEffect, useState, useCallback } from 'react';
import { fetchDocuments, deleteDocument } from '../api';

export default function DocumentList({ selectedIds, onToggleSelect, refreshKey }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { documents } = await fetchDocuments();
      setDocuments(documents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleDelete = async (docId) => {
    await deleteDocument(docId);
    load();
  };

  if (loading) return <p className="text-sm text-gray-400">Loading documents…</p>;
  if (documents.length === 0) return <p className="text-sm text-gray-400">No documents uploaded yet.</p>;

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li
          key={doc.doc_id}
          className="flex items-center justify-between p-2 rounded border border-gray-200 bg-white"
        >
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer flex-1 truncate">
            <input
              type="checkbox"
              checked={selectedIds.includes(doc.doc_id)}
              onChange={() => onToggleSelect(doc.doc_id)}
            />
            <span className="truncate">{doc.filename}</span>
            <span className="text-xs text-gray-400 ml-auto">{doc.chunks} chunks</span>
          </label>
          <button
            onClick={() => handleDelete(doc.doc_id)}
            className="text-red-400 hover:text-red-600 ml-2 text-sm"
            title="Delete document"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}