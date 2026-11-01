import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaCalendarAlt, FaUser, FaArrowLeft, FaNewspaper, FaPlay } from 'react-icons/fa';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/news/${id}`);
        setNews(res.data);
        // Fetch other news (for related section)
        //const relatedRes = await api.get('/api/news?limit=3');
        const relatedRes = await api.get('/api/news');
        setRelatedNews(relatedRes.data.filter(item => item.id !== id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  }

  if (!news) {
    return <div className="text-center py-12">News not found</div>;
  }

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || ''}/${path}`;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link to="/" className="btn-outline py-2 px-4 inline-flex items-center gap-2 mb-6">
        <FaArrowLeft /> Back to Home
      </Link>

      <div className="glass-card p-8">
        {/* Category badge */}
        <div className="flex items-center gap-3 mb-4">
          {/*
          <span className="px-3 py-1 bg-brand-red/10 text-brand-red rounded-full text-sm font-semibold capitalize">
            {news.category}
          </span>
          */}
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <FaCalendarAlt /> {new Date(news.created_at).toLocaleDateString()}
          </span>
          {/*
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <FaUser /> {news.created_by || 'Admin'}
          </span>
          */}
        </div>

        <h1 className="text-4xl font-black mb-4">{news.title}</h1>

        {/* Media */}
        {news.image_url && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <img src={getFileUrl(news.image_url)} alt={news.title} className="w-full max-h-[500px] object-cover" />
          </div>
        )}
        {news.video_url && (
          <div className="mb-6 rounded-xl overflow-hidden">
            <video controls className="w-full max-h-[500px]">
              <source src={getFileUrl(news.video_url)} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <div className="prose max-w-none">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{news.content}</p>
        </div>
      </div>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">More News</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedNews.map(item => (
              <Link key={item.id} to={`/news/${item.id}`} className="glass-card p-4 hover:scale-105 transition">
                {item.image_url && <img src={getFileUrl(item.image_url)} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-2" />}
                <h3 className="font-bold line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
                <span className="text-xs text-brand-red mt-2 inline-block">Read more →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;