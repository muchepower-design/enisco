import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import { FaNewspaper } from "react-icons/fa";

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, image, video, text
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/news/')
      .then(res => setNews(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredNews = news
    .filter(item => filter === 'all' || item.category === filter)
    .filter(item => item.title.toLowerCase().includes(search.toLowerCase()) || item.content.toLowerCase().includes(search.toLowerCase()));

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || ''}/${path}`;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-6">News & Announcements</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search news..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:border-brand-red"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {['all', 'image', 'video', 'text'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${filter === cat ? 'bg-brand-red text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map(item => (
          <Link key={item.id} to={`/news/${item.id}`} className="glass-card overflow-hidden hover:scale-105 transition">
            {item.image_url && <img src={getFileUrl(item.image_url)} alt={item.title} className="w-full h-48 object-cover" />}
            {item.video_url && !item.image_url && (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">▶️ Video</div>
            )}
            {!item.image_url && !item.video_url && (
              <div className="w-full h-48 bg-brand-red/10 flex items-center justify-center text-brand-red text-4xl">
                <FaNewspaper />
              </div>
            )}
            <div className="p-4">
              <span className="text-xs px-2 py-0.5 bg-brand-red/10 text-brand-red rounded-full capitalize">{item.category}</span>
              <h3 className="font-bold text-lg mt-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
              <span className="text-xs text-gray-400 mt-2 block">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12 text-gray-500">No news found</div>
      )}
    </div>
  );
};

export default NewsList;