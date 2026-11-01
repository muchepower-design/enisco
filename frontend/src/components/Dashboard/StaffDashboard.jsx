import { Link } from 'react-router-dom';
import {
  FaClipboardList, FaFileAlt, FaMoneyBillWave, FaSpinner,
  FaClock, FaList, FaPlus, FaComments, FaFileInvoice, FaChartLine,
  FaPlane, FaCar
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    pendingRequests: [],
    stats: {
      pending_count: 0,
      awaiting_payment: 0,
      today_transfers: 0,
      overdue_invoices: 0,
      active_chats: 0,
      revenue_mtd: 0,
      active_bookings: 0,
      pending_assignments: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let requestsRes = { data: [] };
        let statsRes = { data: {} };

        if (user?.role === 'sales_officer') {
          // Use combined pending requests endpoint (we'll create it)
          try {
            requestsRes = await api.get('/api/requests/pending');
          } catch {
            // Fallback to travel admin requests (if permission allows)
            requestsRes = await api.get('/api/travel/admin/requests?limit=20');
          }
          try {
            statsRes = await api.get('/api/dashboard/stats/sales');
          } catch {
            // fallback to general stats
            statsRes = await api.get('/api/dashboard/stats');
          }
        } 
        else if (user?.role === 'finance_officer') {
          try {
            requestsRes = await api.get('/api/invoices/unpaid');
          } catch {
            requestsRes = await api.get('/api/invoices?status=unpaid');
          }
          try {
            statsRes = await api.get('/api/dashboard/stats/finance');
          } catch {
            statsRes = await api.get('/api/dashboard/stats');
          }
        } 
        else if (user?.role === 'operations_manager') {
          try {
            requestsRes = await api.get('/api/operations/today-tasks');
          } catch {
            // fallback: get today's airport transfers
            const today = new Date().toISOString().split('T')[0];
            requestsRes = await api.get(`/api/travel/requests?service_type=airport_transfer&travel_date=${today}`);
          }
          try {
            statsRes = await api.get('/api/dashboard/stats/operations');
          } catch {
            statsRes = await api.get('/api/dashboard/stats');
          }
        } 
        else {
          // general staff fallback
          requestsRes = await api.get('/api/travel/admin/requests?limit=10');
          statsRes = await api.get('/api/dashboard/stats');
        }

        setData({
          pendingRequests: requestsRes.data,
          stats: {
            pending_count: statsRes.data.pending_requests || 0,
            awaiting_payment: statsRes.data.awaiting_payment || 0,
            today_transfers: statsRes.data.today_transfers || 0,
            overdue_invoices: statsRes.data.overdue_invoices || 0,
            active_chats: statsRes.data.active_chats || 0,
            revenue_mtd: statsRes.data.revenue_mtd || 0,
            active_bookings: statsRes.data.active_bookings || 0,
            pending_assignments: statsRes.data.pending_assignments || 0
          }
        });
      } catch (err) {
        toast.error('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-96"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  }

  // ==================== SALES OFFICER ====================
  if (user?.role === 'sales_officer') {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-2">Sales Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage customer requests and generate quotations</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 text-center">
            <FaClipboardList className="text-brand-red text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-gray-600">Pending Requests</h3>
            <p className="text-3xl font-black">{data.stats.pending_count}</p>
            <p className="text-sm text-gray-500">Awaiting quotation</p>
          </div>
          <div className="glass-card p-6 text-center">
            <FaMoneyBillWave className="text-brand-red text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-gray-600">Awaiting Payment</h3>
            <p className="text-3xl font-black">{data.stats.awaiting_payment}</p>
            <p className="text-sm text-gray-500">Unpaid quotations</p>
          </div>
          <div className="glass-card p-6 text-center">
            <FaComments className="text-brand-red text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-gray-600">Active Chats</h3>
            <p className="text-3xl font-black">{data.stats.active_chats}</p>
            <p className="text-sm text-gray-500">Customer conversations</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <FaFileAlt className="text-brand-red text-3xl mb-3" />
            <h3 className="font-bold text-lg">Quotations</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link to="/quotations" className="btn-outline text-sm py-1 px-3 flex items-center gap-1"><FaList /> View All</Link>
              <Link to="/quotations/create" className="btn-primary text-sm py-1 px-3 flex items-center gap-1"><FaPlus /> Create New</Link>
            </div>
          </div>
          <div className="glass-card p-6">
            <FaComments className="text-brand-red text-3xl mb-3" />
            <h3 className="font-bold text-lg">Customer Chats</h3>
            <Link to="/staff/chats" className="btn-outline text-sm py-1 px-3 inline-flex items-center gap-1 mt-2"><FaComments /> Go to Chats</Link>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FaClock className="text-brand-red" /> Pending Requests</h2>
          {data.pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending requests.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr><th className="text-left py-3">Reference</th><th>Customer</th><th>Service</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {data.pendingRequests.map(req => (
                    <tr key={req.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-mono text-sm">{req.request_reference}</td>
                      <td className="py-3">{req.full_name || req.buyer_name}</td>
                      <td className="py-3 capitalize">{req.service_type || req.insurance_type || req.visa_type}</td>
                      <td className="py-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">{req.request_status}</span></td>
                      <td className="py-3"><Link to={`/quotations/create?request_id=${req.id}&type=${req.request_type || 'travel'}`} className="text-brand-red text-sm">Create Quote</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== FINANCE OFFICER ====================
  if (user?.role === 'finance_officer') {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-2">Finance Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage invoices, payments, and revenue</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 text-center">
            <FaFileInvoice className="text-brand-red text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-gray-600">Unpaid Invoices</h3>
            <p className="text-3xl font-black">{data.stats.awaiting_payment}</p>
          </div>
          <div className="glass-card p-6 text-center">
            <FaMoneyBillWave className="text-brand-red text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-gray-600">Overdue Invoices</h3>
            <p className="text-3xl font-black">{data.stats.overdue_invoices}</p>
          </div>
          <div className="glass-card p-6 text-center">
            <FaChartLine className="text-brand-red text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-gray-600">Revenue (MTD)</h3>
            <p className="text-3xl font-black">ZMW {data.stats.revenue_mtd}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <FaFileAlt className="text-brand-red text-3xl mb-3" />
            <h3 className="font-bold text-lg">Invoices</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link to="/invoices" className="btn-outline text-sm py-1 px-3 flex items-center gap-1"><FaList /> View All</Link>
              <Link to="/invoices/create" className="btn-primary text-sm py-1 px-3 flex items-center gap-1"><FaPlus /> Create New</Link>
            </div>
          </div>
          <div className="glass-card p-6">
            <FaClipboardList className="text-brand-red text-3xl mb-3" />
            <h3 className="font-bold text-lg">Payment Reports</h3>
            <Link to="/finance/reports" className="btn-outline text-sm py-1 px-3 inline-flex items-center gap-1 mt-2">View Reports</Link>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">Unpaid / Overdue Invoices</h2>
          {data.pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No unpaid invoices.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr><th>Invoice Ref</th><th>Customer</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {data.pendingRequests.map(inv => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{inv.invoice_reference}</td>
                      <td className="py-2">{inv.customer_name}</td>
                      <td className="py-2">ZMW {inv.total_amount}</td>
                      <td className="py-2">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                      <td className="py-2"><span className={`px-2 py-1 rounded-full text-xs ${inv.invoice_status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{inv.invoice_status}</span></td>
                      <td className="py-2"><Link to={`/payments/record?invoice=${inv.id}`} className="text-brand-red text-sm">Record Payment</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== OPERATIONS MANAGER ====================
  if (user?.role === 'operations_manager') {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-2">Operations Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage transfers, vehicle bookings, and daily tasks</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 text-center">
            <FaClock className="text-brand-red text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-gray-600">Today's Transfers</h3>
            <p className="text-3xl font-black">{data.stats.today_transfers}</p>
          </div>
          <div className="glass-card p-6 text-center">
            <FaCar className="text-brand-red text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-gray-600">Active Bookings</h3>
            <p className="text-3xl font-black">{data.stats.active_bookings}</p>
          </div>
          <div className="glass-card p-6 text-center">
            <FaClipboardList className="text-brand-red text-4xl mx-auto mb-3" />
            <h3 className="font-bold text-gray-600">Pending Assignments</h3>
            <p className="text-3xl font-black">{data.stats.pending_assignments}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <FaCar className="text-brand-red text-3xl mb-3" />
            <h3 className="font-bold text-lg">Vehicle Fleet</h3>
            <Link to="/admin/vehicles" className="btn-outline text-sm py-1 px-3 inline-flex items-center gap-1 mt-2">Manage Inventory</Link>
          </div>
          <div className="glass-card p-6">
            <FaClipboardList className="text-brand-red text-3xl mb-3" />
            <h3 className="font-bold text-lg">Daily Schedule</h3>
            <Link to="/operations/schedule" className="btn-outline text-sm py-1 px-3 inline-flex items-center gap-1 mt-2">View Transfers</Link>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">Today's Airport Transfers</h2>
          {data.pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transfers scheduled for today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr><th>Time</th><th>Customer</th><th>Pickup</th><th>Destination</th><th>Vehicle</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {data.pendingRequests.map(task => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{task.travel_time || 'TBD'}</td>
                      <td className="py-2">{task.full_name}</td>
                      <td className="py-2">{task.pickup_location}</td>
                      <td className="py-2">{task.destination}</td>
                      <td className="py-2">{task.assigned_vehicle || 'Not assigned'}</td>
                      <td className="py-2"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">{task.request_status}</span></td>
                      <td className="py-2"><Link to={`/operations/assign/${task.id}`} className="text-brand-red text-sm">Assign Vehicle</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div className="text-center py-12">Unknown role. Please contact administrator.</div>;
};

export default StaffDashboard;