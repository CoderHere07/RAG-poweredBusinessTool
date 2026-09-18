import { useState } from 'react';
import UploadZone from './components/UploadZone';

function App() {
  const [lastUploaded, setLastUploaded] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">DocQA</h1>
      <div className="max-w-xl mx-auto">
        <UploadZone onUploaded={setLastUploaded} />
        {lastUploaded && (
          <p className="text-sm text-green-600 mt-3">
            Uploaded {lastUploaded.filename} — {lastUploaded.chunks} chunks indexed
          </p>
        )}
      </div>
    </div>
  );
}

export default App;