import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaFilePdf, FaDownload, FaSpinner } from 'react-icons/fa';

const MyDocuments = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/documents/my')
      .then(res => setDocs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-6">My Documents</h1>
      {docs.length === 0 && <p className="text-gray-500">No documents uploaded yet.</p>}
      <div className="space-y-4">
        {docs.map(doc => (
          <div key={doc.id} className="glass-card p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaFilePdf className="text-red-500 text-2xl" />
              <div>
                <p className="font-semibold">{doc.title}</p>
                <p className="text-sm text-gray-500">{doc.file_name}</p>
              </div>
            </div>
            <a href={doc.url} download className="btn-outline py-2 px-4 flex items-center gap-2">
              <FaDownload /> Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyDocuments;