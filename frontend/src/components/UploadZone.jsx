import { useState, useRef } from 'react';
import { uploadDocument } from '../api';

export default function UploadZone({ onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    setError(null);
    setProgress(0);
    try {
      const result = await uploadDocument(file, setProgress);
      onUploaded(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        className="hidden"
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
      />

      {progress !== null ? (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-500">Uploading… {progress}%</p>
        </div>
      ) : (
        <p className="text-gray-500">
          Drag a document here, or <span className="text-blue-600">click to browse</span>
          <br />
          <span className="text-xs">PDF, DOCX, TXT — max 100MB</span>
        </p>
      )}

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}