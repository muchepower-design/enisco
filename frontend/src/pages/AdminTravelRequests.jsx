import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { FaSpinner, FaEye } from 'react-icons/fa';

const AdminTravelRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/travel/admin/requests')
      .then(res => setRequests(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-6">All Travel Requests</h1>
      <div className="glass-card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr><th>Reference</th><th>Customer</th><th>Service</th><th>Status</th><th>Amount</th><th>Action</th></tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{req.request_reference}</td>
                <td className="p-3">{req.full_name}</td>
                <td className="p-3 capitalize">{req.service_type}</td>
                <td className="p-3">{req.request_status}</td>
                <td className="p-3">ZMW {req.total_amount}</td>
                <td className="p-3"><Link to={`/admin/travel-request/${req.id}`} className="text-brand-red"><FaEye /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminTravelRequests;