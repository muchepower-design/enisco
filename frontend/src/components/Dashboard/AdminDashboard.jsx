import { Link } from 'react-router-dom';
import {
  FaUsers, FaPlane, FaShieldAlt, FaChartLine, FaFileInvoice, FaReceipt,
  FaSpinner, FaSync, FaCar, FaComments, FaFileAlt, FaNewspaper,
  FaSuitcase  // <-- added icon for tour packages
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    travel_requests: 0,
    insurance_requests: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/stats');
      setStats({
        total_users: res.data.total_users || 0,
        travel_requests: res.data.travel_requests || 0,
        insurance_requests: res.data.insurance_requests || 0,
        revenue: res.data.revenue || 0,
      });
    } catch (err) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-96"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black">Admin Dashboard</h1>
        <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full"><FaSync /> Refresh</button>
      </div>
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 text-center"><FaUsers className="text-brand-red text-4xl mx-auto mb-3"/><h3>Total Users</h3><p className="text-3xl font-black">{stats.total_users}</p></div>
        <div className="glass-card p-6 text-center"><FaPlane className="text-brand-red text-4xl mx-auto mb-3"/><h3>Travel Requests</h3><p className="text-3xl font-black">{stats.travel_requests}</p></div>
        <div className="glass-card p-6 text-center"><FaShieldAlt className="text-brand-red text-4xl mx-auto mb-3"/><h3>Insurance Requests</h3><p className="text-3xl font-black">{stats.insurance_requests}</p></div>
        <div className="glass-card p-6 text-center"><FaChartLine className="text-brand-red text-4xl mx-auto mb-3"/><h3>Revenue</h3><p className="text-3xl font-black">ZMW {stats.revenue.toLocaleString()}</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6"><div className="flex items-center gap-4"><FaReceipt className="text-brand-red text-4xl"/><h3 className="text-xl font-bold">Quotations</h3></div><div className="flex flex-wrap gap-4 mt-4"><Link to="/quotations" className="btn-outline">View All</Link><Link to="/quotations/create" className="btn-primary">Create New</Link></div></div>
        <div className="glass-card p-6"><div className="flex items-center gap-4"><FaFileInvoice className="text-brand-red text-4xl"/><h3 className="text-xl font-bold">Invoices</h3></div><div className="flex flex-wrap gap-4 mt-4"><Link to="/invoices" className="btn-outline">View All</Link><Link to="/invoices/create" className="btn-primary">Create New</Link></div></div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">   {/* changed to 4 columns to accommodate new card */}
        <Link to="/admin/vehicles" className="glass-card p-6 flex items-center gap-4"><FaCar className="text-brand-red text-3xl"/><div><h3 className="font-bold">Manage Vehicles</h3><p className="text-sm">Inventory & bookings</p></div></Link>
        <Link to="/admin/documents" className="glass-card p-6 flex items-center gap-4"><FaFileAlt className="text-brand-red text-3xl"/><div><h3 className="font-bold">Upload Documents</h3><p className="text-sm">Tickets, certificates</p></div></Link>
        <Link to="/admin/chats" className="glass-card p-6 flex items-center gap-4"><FaComments className="text-brand-red text-3xl"/><div><h3 className="font-bold">All Chats</h3><p className="text-sm">Customer conversations</p></div></Link>
        <Link to="/admin/news" className="glass-card p-6 flex items-center gap-4"><FaNewspaper className="text-brand-red text-3xl"/><div><h3 className="font-bold">Manage News</h3><p className="text-sm">Create, edit, and publish news</p></div></Link>

        {/* NEW: Tour Packages link */}
        <Link to="/admin/tour-packages" className="glass-card p-6 flex items-center gap-4">
          <FaSuitcase className="text-brand-red text-3xl" />
          <div>
            <h3 className="font-bold">Manage Tour Packages</h3>
            <p className="text-sm">Create, edit, and manage tours</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;