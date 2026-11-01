import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaSpinner, FaUpload } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDocuments = () => {
  const [paidRequests, setPaidRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    // Fetch all paid requests without documents (or all paid)
    api.get('/api/admin/paid-requests')
      .then(res => setPaidRequests(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!selected || !file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    try {
      await api.post(`/api/documents/upload/${selected.type}/${selected.id}?title=${encodeURIComponent(title)}`, formData);
      toast.success('Document uploaded');
      setSelected(null);
      setFile(null);
      setTitle('');
      // Refresh list
      const res = await api.get('/api/admin/paid-requests');
      setPaidRequests(res.data);
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-6">Upload Service Documents</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Paid Requests</h2>
          {paidRequests.length === 0 && <p>No pending paid requests.</p>}
          <div className="space-y-2">
            {paidRequests.map(req => (
              <div key={req.id} className={`p-3 border rounded cursor-pointer ${selected?.id === req.id ? 'bg-brand-red/10 border-brand-red' : 'hover:bg-gray-50'}`} onClick={() => setSelected(req)}>
                <p className="font-semibold">{req.request_reference}</p>
                <p className="text-sm">{req.request_type} - {req.full_name || req.buyer_name}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Upload Document</h2>
          {selected ? (
            <div className="space-y-4">
              <p>Request: <strong>{selected.request_reference}</strong></p>
              <input type="text" placeholder="Document Title (e.g., Flight Ticket)" className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
              <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full" />
              <button onClick={handleUpload} className="btn-primary w-full" disabled={!file || !title}>
                <FaUpload /> Upload
              </button>
            </div>
          ) : <p className="text-gray-500">Select a request from the left</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDocuments;