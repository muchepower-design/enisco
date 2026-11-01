import { Link } from 'react-router-dom';
import {
  FaCar,
  FaShieldAlt,
  FaReceipt,
  FaFileInvoice,
  FaHistory,
  FaUserCircle,
  FaPassport,
  FaList,
  FaPlus,
  FaComments,
  FaFileAlt,
  FaPlane,
  FaTaxi,
  FaMap, // <-- added for Tour Packages
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../services/api';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const [travelRes, insuranceRes] = await Promise.all([
          api.get('/api/travel/requests?limit=5'),
          api.get('/api/insurance/requests?limit=5'),
        ]);
        const combined = [...travelRes.data, ...insuranceRes.data]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentRequests(combined);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="glass-card p-8 mb-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-brand-red to-brand-red-dark rounded-full flex items-center justify-center">
            <FaUserCircle className="text-white text-5xl" />
          </div>
          <div>
            <h1 className="text-4xl font-black">Welcome, {user?.full_name}!</h1>
            <p className="text-gray-600">
              Manage your travel, insurance, and visa requests, view quotes, and make payments.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Flight Ticketing */}
        <div className="glass-card p-6 text-center">
          <FaPlane className="text-brand-red text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold">Flights</h3>
          <div className="flex justify-center gap-3 mt-4">
            <Link to="/flight-request" className="btn-primary text-sm">
              <FaPlus /> New
            </Link>
            <Link to="/my-flights" className="btn-outline text-sm">
              <FaList /> View
            </Link>
          </div>
        </div>

        {/* Car Hire */}
        <div className="glass-card p-6 text-center">
          <FaCar className="text-brand-red text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold">Car Hire</h3>
          <div className="flex justify-center gap-3 mt-4">
            <Link to="/carhire-request" className="btn-primary text-sm">
              <FaPlus /> New
            </Link>
            <Link to="/my-carhires" className="btn-outline text-sm">
              <FaList /> View
            </Link>
          </div>
        </div>

        {/* Airport Transfer */}
        <div className="glass-card p-6 text-center">
          <FaTaxi className="text-brand-red text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold">Airport Transport</h3>
          <div className="flex justify-center gap-3 mt-4">
            <Link to="/airport-transfer-request" className="btn-primary text-sm">
              <FaPlus /> New
            </Link>
            <Link to="/my-airport-transfers" className="btn-outline text-sm">
              <FaList /> View
            </Link>
          </div>
        </div>

        {/* Insurance */}
        <div className="glass-card p-6 text-center">
          <FaShieldAlt className="text-brand-red text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold">Insurance</h3>
          <div className="flex justify-center gap-3 mt-4">
            <Link to="/insurance-request" className="btn-primary text-sm">
              <FaPlus /> New
            </Link>
            <Link to="/my-insurance-requests" className="btn-outline text-sm">
              <FaList /> View
            </Link>
          </div>
        </div>

        {/* Visa */}
        <div className="glass-card p-6 text-center">
          <FaPassport className="text-brand-red text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold">Visa</h3>
          <div className="flex justify-center gap-3 mt-4">
            <Link to="/visa-request" className="btn-primary text-sm">
              <FaPlus /> New
            </Link>
            <Link to="/my-visa-requests" className="btn-outline text-sm">
              <FaList /> View
            </Link>
          </div>
        </div>

        {/* Tour Packages – new card */}
        <div className="glass-card p-6 text-center">
          <FaMap className="text-brand-red text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold">Tour Packages</h3>
          <Link to="/tour-packages" className="btn-outline text-sm mt-4 inline-block">
            View Packages
          </Link>
        </div>

        {/* Quotations */}
        <div className="glass-card p-6 text-center">
          <FaReceipt className="text-brand-red text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold">Quotations</h3>
          <Link to="/quotations" className="btn-outline text-sm mt-4 inline-block">
            View All
          </Link>
        </div>

        {/* Invoices */}
        <div className="glass-card p-6 text-center">
          <FaFileInvoice className="text-brand-red text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold">Invoices</h3>
          <Link to="/invoices" className="btn-outline text-sm mt-4 inline-block">
            View All
          </Link>
        </div>

        {/* Chats */}
        <div className="glass-card p-6 text-center">
          <FaComments className="text-brand-red text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold">Chats</h3>
          <Link to="/my-chats" className="btn-outline text-sm mt-4 inline-block">
            Open
          </Link>
        </div>

        {/* Documents */}
        <div className="glass-card p-6 text-center">
          <FaFileAlt className="text-brand-red text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold">Documents</h3>
          <Link to="/my-documents" className="btn-outline text-sm mt-4 inline-block">
            View
          </Link>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaHistory className="text-brand-red text-xl" />
          <h2 className="text-2xl font-bold">Recent Requests</h2>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : recentRequests.length === 0 ? (
          <p>No requests yet.</p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-semibold">{req.request_reference}</p>
                  <p className="text-sm text-gray-500">
                    {req.service_type || req.insurance_type} • {req.request_status}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-brand-red">ZMW {req.total_amount}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      req.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {req.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;