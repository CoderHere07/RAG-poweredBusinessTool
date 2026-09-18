import { useState } from 'react';
import UploadZone from './components/UploadZone';
import DocumentList from './components/DocumentList';
import ChatPanel from './components/ChatPanel';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">DocQA</h1>

      <div className="max-w-xl mx-auto space-y-6">
        <UploadZone onUploaded={() => setRefreshKey((k) => k + 1)} />

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">Documents</h2>
          <DocumentList
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            refreshKey={refreshKey}
          />
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">Chat</h2>
          <ChatPanel selectedIds={selectedIds} />
        </div>
      </div>
    </div>
  );
}

export default App;