import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FaSpinner, FaEye, FaCheckCircle, FaMoneyBillWave, FaEnvelope } from 'react-icons/fa';

const Quotations = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, paid

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/quotations/');
      //console.log('Fetched quotations:', res.data);
      setQuotations(res.data);
    } catch (err) {
      toast.error('Failed to load quotations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleAccept = async (id) => {
    try {
      await api.patch(`/api/quotations/${id}/accept`);
      toast.success('Quotation accepted');
      fetchQuotations();
    } catch (err) {
      toast.error('Failed to accept');
    }
  };

  const handleSend = async (id) => {
    try {
      await api.post(`/api/quotations/${id}/send`);
      toast.success('Quotation sent to client');
      fetchQuotations();
    } catch (err) {
      toast.error('Failed to send');
    }
  };

  const isStaff = ['admin', 'manager', 'sales_officer'].includes(user?.role);
  const isClient = user?.role === 'client';

  const filteredQuotations = quotations.filter(q => {
    if (filter === 'all') return true;
    if (filter === 'pending') return q.status === 'draft' || q.status === 'sent';
    if (filter === 'accepted') return q.status === 'accepted';
    if (filter === 'paid') return q.payment_status === 'paid';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-brand-red text-4xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-wrap justify-between items-center mb-8">
        <h1 className="text-4xl font-black">
          {isStaff ? 'All Quotations' : 'My Quotations'}
        </h1>
        {isStaff && (
          <Link to="/quotations/create" className="btn-primary">
            + New Quotation
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'accepted', 'paid'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === f
                ? 'bg-brand-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredQuotations.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-500">No quotations found.</p>
          {isStaff && (
            <Link to="/quotations/create" className="btn-primary mt-4 inline-block">
              Create your first quotation
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotations.map(q => (
            <div key={q.id} className="glass-card p-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="font-mono text-sm text-gray-500">{q.quotation_reference}</p>
                  <h3 className="text-xl font-bold mt-1">{q.quote_title}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{q.quote_details}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      q.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      q.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      q.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {q.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      q.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      q.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Payment: {q.payment_status || 'pending'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-brand-red">ZMW {q.total_amount}</p>
                  <p className="text-sm text-gray-500">Valid until {new Date(q.validity_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 mt-4 pt-4 border-t">
                <Link to={`/quotations/${q.id}`} className="btn-outline text-sm py-1 px-3 flex items-center gap-1">
                  <FaEye /> View
                </Link>

                {/* Staff actions */}
                {isStaff && q.status === 'draft' && (
                  <button onClick={() => handleSend(q.id)} className="btn-primary text-sm py-1 px-3 flex items-center gap-1">
                    <FaEnvelope /> Send to Client
                  </button>
                )}

                {/* Client actions */}
                {isClient && q.status === 'sent' && q.payment_status !== 'paid' && (
                  <>
                    <button onClick={() => handleAccept(q.id)} className="btn-outline text-sm py-1 px-3 flex items-center gap-1">
                      <FaCheckCircle /> Accept
                    </button>
                    <Link to={`/payment/quotation/${q.id}`} className="btn-primary text-sm py-1 px-3 flex items-center gap-1">
                      <FaMoneyBillWave /> Pay Now
                    </Link>
                  </>
                )}

                {isClient && q.status === 'accepted' && q.payment_status !== 'paid' && (
                  <Link to={`/payment/quotation/${q.id}`} className="btn-primary text-sm py-1 px-3 flex items-center gap-1">
                    <FaMoneyBillWave /> Pay Now
                  </Link>
                )}

                {q.payment_status === 'paid' && (
                  <span className="text-green-600 text-sm font-semibold">✓ Paid</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quotations;