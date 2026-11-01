import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const OperationsSchedule = () => {
  const [transfers, setTransfers] = useState([]);
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get(`/api/travel/requests?service_type=airport_transfer&travel_date=${today}`).then(res => setTransfers(res.data));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-6">Today's Airport Transfers</h1>
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full">
          <thead className="border-b"><tr><th>Time</th><th>Customer</th><th>Pickup</th><th>Destination</th><th>Status</th></tr></thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id} className="border-b"><td className="py-2">{t.travel_time || 'TBD'}</td><td>{t.full_name}</td><td>{t.pickup_location}</td><td>{t.destination}</td><td>{t.request_status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperationsSchedule;