import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaMapMarkerAlt, FaClock, FaUsers, FaStar } from 'react-icons/fa';

const TourPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/tour-packages/')
      .then(res => setPackages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getFileUrl = (path) => {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || ''}/${path}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-6">Tour Packages</h1>
      <p className="text-gray-600 mb-8">Explore our curated travel experiences for local and international tourists.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="glass-card overflow-hidden hover:scale-105 transition">
            <div className="relative h-48 overflow-hidden">
              {pkg.images && pkg.images.length > 0 ? (
                <img src={getFileUrl(pkg.images[0])} alt={pkg.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-red/20 to-brand-red/10 flex items-center justify-center text-brand-red text-6xl">🌍</div>
              )}
              {pkg.is_featured && (
                <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">Featured</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg">{pkg.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <FaMapMarkerAlt className="text-brand-red" />
                <span>{pkg.destination}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1"><FaClock /> {pkg.duration_days}d / {pkg.duration_nights}n</span>
                <span className="flex items-center gap-1"><FaUsers /> {pkg.max_people} people</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pkg.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-bold text-brand-red">ZMW {pkg.total_price}</span>
                <Link to={`/tour-packages/${pkg.id}`} className="btn-primary text-sm py-1 px-3">View Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12 text-gray-500">No tour packages available at the moment.</div>
      )}
    </div>
  );
};

export default TourPackages;