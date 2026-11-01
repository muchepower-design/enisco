import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaMapMarkerAlt, FaClock, FaUsers, FaStar, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TourPackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    number_of_people: 1,
    special_requests: ''
  });
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    api.get(`/api/tour-packages/${id}`)
      .then(res => setPkg(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || ''}/${path}`;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      const payload = {
        package_id: pkg.id,
        ...bookingForm,
        number_of_people: parseInt(bookingForm.number_of_people)
      };
      const res = await api.post('/api/tour-packages/book', payload);
      toast.success('Booking created! Redirecting to payment...');
      // Redirect to payment page (you can integrate with existing payment flow)
      navigate(`/payment/tourbooking/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  if (!pkg) return <div className="text-center py-12">Package not found</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link to="/tour-packages" className="btn-outline py-2 px-4 inline-flex items-center gap-2 mb-6">
        <FaArrowLeft /> Back to Tours
      </Link>

      <div className="glass-card p-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-brand-red/10 text-brand-red rounded-full text-sm font-semibold">{pkg.destination}</span>
          {pkg.is_featured && <span className="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-semibold">⭐ Featured</span>}
        </div>

        <h1 className="text-4xl font-black mb-4">{pkg.title}</h1>

        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-6">
          <span><FaClock className="inline mr-1" /> {pkg.duration_days} days / {pkg.duration_nights} nights</span>
          <span><FaUsers className="inline mr-1" /> Max {pkg.max_people} people</span>
          {pkg.start_date && <span><FaCalendarAlt className="inline mr-1" /> {new Date(pkg.start_date).toLocaleDateString()}</span>}
        </div>

        {/* Images Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {pkg.images && pkg.images.length > 0 ? (
            pkg.images.slice(0, 4).map((img, idx) => (
              <img key={idx} src={getFileUrl(img)} alt={pkg.title} className="w-full h-32 object-cover rounded-lg" />
            ))
          ) : (
            <div className="col-span-4 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">No images</div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-3">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{pkg.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {pkg.inclusions && (
            <div>
              <h3 className="font-bold text-lg mb-2">✅ Inclusions</h3>
              <p className="text-gray-600 whitespace-pre-line">{pkg.inclusions}</p>
            </div>
          )}
          {pkg.exclusions && (
            <div>
              <h3 className="font-bold text-lg mb-2">❌ Exclusions</h3>
              <p className="text-gray-600 whitespace-pre-line">{pkg.exclusions}</p>
            </div>
          )}
        </div>

        {pkg.highlights && (
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-2">✨ Highlights</h3>
            <p className="text-gray-600 whitespace-pre-line">{pkg.highlights}</p>
          </div>
        )}

        <div className="border-t pt-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Book This Package</h2>
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-sm text-gray-500">Price per person</span>
              <p className="text-3xl font-black text-brand-red">ZMW {pkg.total_price}</p>
            </div>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">Full Name *</label>
                <input type="text" required className="w-full p-2 border rounded" value={bookingForm.full_name} onChange={e => setBookingForm({...bookingForm, full_name: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-1">Email *</label>
                <input type="email" required className="w-full p-2 border rounded" value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">Phone *</label>
                <input type="tel" required className="w-full p-2 border rounded" value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-1">Number of People *</label>
                <input type="number" min="1" max={pkg.max_people} required className="w-full p-2 border rounded" value={bookingForm.number_of_people} onChange={e => setBookingForm({...bookingForm, number_of_people: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block font-bold mb-1">Special Requests</label>
              <textarea rows="3" className="w-full p-2 border rounded" value={bookingForm.special_requests} onChange={e => setBookingForm({...bookingForm, special_requests: e.target.value})} />
            </div>
            <button type="submit" disabled={isBooking} className="btn-primary w-full justify-center">
              {isBooking ? 'Processing...' : `Book Now - ZMW ${pkg.total_price * parseInt(bookingForm.number_of_people || 1)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TourPackageDetail;