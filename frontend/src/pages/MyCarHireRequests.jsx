import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { FaSpinner, FaEye, FaCar } from 'react-icons/fa';

const MyCarHireRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/carhire/requests')
      .then(res => setRequests(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-6 flex items-center gap-3"><FaCar className="text-brand-red" /> My Car Hire Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-500">No car hire requests yet. <Link to="/carhire-request" className="text-brand-red">Create one</Link></p>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="glass-card p-6 flex justify-between items-center">
              <div>
                <p className="font-bold">{req.request_reference}</p>
                <p>{req.pickup_location} → {req.dropoff_location || 'N/A'} • {req.request_status}</p>
                <p>Amount: ZMW {req.total_amount}</p>
              </div>
              <Link to={`/carhire-request/${req.id}`} className="btn-outline py-2 px-4 flex items-center gap-2"><FaEye /> View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyCarHireRequests;