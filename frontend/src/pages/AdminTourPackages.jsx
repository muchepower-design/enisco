import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaSpinner, FaPlus, FaEdit, FaTrash, FaTimes, FaImage, FaVideo } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminTourPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    destination: '',
    duration_days: 3,
    duration_nights: 2,
    base_price: 0,
    service_fee: 0,
    total_price: 0,
    inclusions: '',
    exclusions: '',
    highlights: '',
    max_people: 10,
    start_date: '',
    end_date: '',
    is_active: true,
    is_featured: false,
  });
  const [files, setFiles] = useState([]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/tour-packages/');
      setPackages(res.data);
    } catch (err) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      destination: '',
      duration_days: 3,
      duration_nights: 2,
      base_price: 0,
      service_fee: 0,
      total_price: 0,
      inclusions: '',
      exclusions: '',
      highlights: '',
      max_people: 10,
      start_date: '',
      end_date: '',
      is_active: true,
      is_featured: false,
    });
    setFiles([]);
    setEditingItem(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        slug: item.slug,
        description: item.description,
        destination: item.destination,
        duration_days: item.duration_days,
        duration_nights: item.duration_nights,
        base_price: item.base_price,
        service_fee: item.service_fee,
        total_price: item.total_price,
        inclusions: item.inclusions || '',
        exclusions: item.exclusions || '',
        highlights: item.highlights || '',
        max_people: item.max_people,
        start_date: item.start_date ? item.start_date.split('T')[0] : '',
        end_date: item.end_date ? item.end_date.split('T')[0] : '',
        is_active: item.is_active,
        is_featured: item.is_featured,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    setFiles(prev => [...prev, ...fileList]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    for (const key in formData) {
      formDataObj.append(key, formData[key]);
    }
    // Append images
    files.forEach(file => {
      formDataObj.append('image_files', file);
    });

    try {
      if (editingItem) {
        await api.put(`/api/tour-packages/${editingItem.id}`, formDataObj);
        toast.success('Package updated');
      } else {
        await api.post('/api/tour-packages/', formDataObj);
        toast.success('Package created');
      }
      fetchPackages();
      handleCloseModal();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await api.delete(`/api/tour-packages/${item.id}`);
      toast.success('Deleted');
      fetchPackages();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || ''}/${path}`;
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">Manage Tour Packages</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <FaPlus className="mr-2" /> Add Package
        </button>
      </div>

      <div className="grid gap-4">
        {packages.map(item => (
          <div key={item.id} className="glass-card p-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-bold truncate">{item.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
                {item.is_featured && <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full">Featured</span>}
              </div>
              <p className="text-sm text-gray-600">{item.destination} · {item.duration_days}d/{item.duration_nights}n</p>
              <p className="text-sm font-bold text-brand-red">ZMW {item.total_price}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
              <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingItem ? 'Edit Package' : 'Add Package'}</h2>
              <button onClick={handleCloseModal}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Title *</label>
                  <input type="text" required className="w-full p-2 border rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block font-bold mb-1">Slug *</label>
                  <input type="text" required className="w-full p-2 border rounded" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Description *</label>
                <textarea rows="4" required className="w-full p-2 border rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Destination *</label>
                  <input type="text" required className="w-full p-2 border rounded" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold mb-1">Days</label>
                    <input type="number" className="w-full p-2 border rounded" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Nights</label>
                    <input type="number" className="w-full p-2 border rounded" value={formData.duration_nights} onChange={e => setFormData({...formData, duration_nights: parseInt(e.target.value)})} />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold mb-1">Base Price</label>
                  <input type="number" step="0.01" className="w-full p-2 border rounded" value={formData.base_price} onChange={e => setFormData({...formData, base_price: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block font-bold mb-1">Service Fee</label>
                  <input type="number" step="0.01" className="w-full p-2 border rounded" value={formData.service_fee} onChange={e => setFormData({...formData, service_fee: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block font-bold mb-1">Total Price</label>
                  <input type="number" step="0.01" className="w-full p-2 border rounded" value={formData.total_price} onChange={e => setFormData({...formData, total_price: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Max People</label>
                <input type="number" className="w-full p-2 border rounded" value={formData.max_people} onChange={e => setFormData({...formData, max_people: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block font-bold mb-1">Inclusions</label>
                <textarea rows="2" className="w-full p-2 border rounded" value={formData.inclusions} onChange={e => setFormData({...formData, inclusions: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-1">Exclusions</label>
                <textarea rows="2" className="w-full p-2 border rounded" value={formData.exclusions} onChange={e => setFormData({...formData, exclusions: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-1">Highlights</label>
                <textarea rows="2" className="w-full p-2 border rounded" value={formData.highlights} onChange={e => setFormData({...formData, highlights: e.target.value})} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Start Date</label>
                  <input type="date" className="w-full p-2 border rounded" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="block font-bold mb-1">End Date</label>
                  <input type="date" className="w-full p-2 border rounded" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} /> Active</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} /> Featured</label>
              </div>
              <div>
                <label className="block font-bold mb-1">Images</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full p-2 border rounded" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-gray-100 p-1 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button type="button" onClick={() => removeFile(idx)} className="text-red-500"><FaTimes size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-outline py-2 px-4">Cancel</button>
                <button type="submit" className="btn-primary py-2 px-4">{editingItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTourPackages;