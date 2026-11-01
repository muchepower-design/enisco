import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaSpinner, FaPlus, FaEdit, FaTrash, FaTimes, FaImage, FaVideo, FaNewspaper } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'text',
    is_published: true,
    is_featured: false,
  });
  const [files, setFiles] = useState({ image: null, video: null });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/news/');
      setNews(res.data);
    } catch (err) {
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'text',
      is_published: true,
      is_featured: false,
    });
    setFiles({ image: null, video: null });
    setEditingItem(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        content: item.content,
        category: item.category,
        is_published: item.is_published,
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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('content', formData.content);
    formDataObj.append('category', formData.category);
    formDataObj.append('is_published', formData.is_published);
    formDataObj.append('is_featured', formData.is_featured);
    if (files.image) formDataObj.append('image', files.image);
    if (files.video) formDataObj.append('video', files.video);

    try {
      if (editingItem) {
        await api.put(`/api/news/${editingItem.id}`, formDataObj);
        toast.success('News updated');
      } else {
        await api.post('/api/news/', formDataObj);
        toast.success('News created');
      }
      fetchNews();
      handleCloseModal();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await api.delete(`/api/news/${item.id}`);
      toast.success('Deleted');
      fetchNews();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">Manage News</h1>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <FaPlus className="mr-2" /> Add News
        </button>
      </div>

      <div className="grid gap-4">
        {news.map(item => (
          <div key={item.id} className="glass-card p-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  item.category === 'image' ? 'bg-blue-100 text-blue-800' :
                  item.category === 'video' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.category}
                </span>
                <h3 className="font-bold truncate">{item.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.is_published ? 'Published' : 'Draft'}
                </span>
                {item.is_featured && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Featured</span>}
              </div>
              <p className="text-sm text-gray-600 truncate">{item.content}</p>
              <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
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
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{editingItem ? 'Edit News' : 'Add News'}</h2>
              <button onClick={handleCloseModal}><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Title *</label>
                <input type="text" required className="w-full p-2 border rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-1">Content *</label>
                <textarea rows="5" required className="w-full p-2 border rounded" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-1">Category</label>
                <select className="w-full p-2 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="text">Text Only</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} /> Published</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} /> Featured</label>
              </div>
              <div>
                <label className="block font-bold mb-1">Image Upload</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block font-bold mb-1">Video Upload</label>
                <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="w-full p-2 border rounded" />
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

export default AdminNews;