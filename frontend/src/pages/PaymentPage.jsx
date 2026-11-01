import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

// Import mobile money logos
import airtelLogo from './assets/momo/logos/momo_airtel.png';
import mtnLogo from './assets/momo/logos/momo_mtn.png';
import zamtelLogo from './assets/momo/logos/momo_zamtel.jpg';

const providerLogos = {
  'AIRTEL_OAPI_ZMB': airtelLogo,
  'MTN_MOMO_ZMB': mtnLogo,
  'ZAMTEL_ZMB': zamtelLogo,
};

const providerNames = {
  'AIRTEL_OAPI_ZMB': 'Airtel Money',
  'MTN_MOMO_ZMB': 'MTN Mobile Money',
  'ZAMTEL_ZMB': 'Zamtel Money',
};

const PaymentPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const pollingRef = useRef(null);

  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Mobile money state
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [depositId, setDepositId] = useState(null);
  const [pollStatus, setPollStatus] = useState(null);

  const isValidPhone = /^0\d{9}$/.test(phoneNumber);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint;
        switch (type) {
          case 'travel': endpoint = `/api/travel/request/${id}`; break;
          case 'insurance': endpoint = `/api/insurance/request/${id}`; break;
          case 'quotation': endpoint = `/api/quotations/${id}`; break;
          case 'flight': endpoint = `/api/flight/request/${id}`; break;
          case 'carhire': endpoint = `/api/carhire/request/${id}`; break;
          case 'airporttransfer': endpoint = `/api/airporttransfer/request/${id}`; break;
          default: toast.error('Invalid payment type'); navigate('/dashboard'); return;
        }
        const res = await api.get(endpoint);
        setRequestDetails(res.data);

        const provRes = await api.get('/api/payments/providers');
        setProviders(provRes.data);
      } catch (err) {
        toast.error('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [type, id]);

  const startPolling = (depId) => {
    setDepositId(depId);
    setPollStatus('WAITING');
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/api/payments/deposit/${depId}/check`);
        const data = res.data;
        if (data.status === 'COMPLETED') {
          clearInterval(pollingRef.current);
          setPollStatus('COMPLETED');
          toast.success('Payment successful! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else if (data.status === 'FAILED' || data.status === 'NOT_FOUND') {
          clearInterval(pollingRef.current);
          setPollStatus('FAILED');
          setError(data.failure_reason || 'Payment failed. Please try again.');
          toast.error('Payment failed');
        } else if (attempts > 20) {
          clearInterval(pollingRef.current);
          setPollStatus('FAILED');
          setError('Payment timed out. Please try again.');
          toast.error('Payment timed out');
        }
      } catch (err) {
        clearInterval(pollingRef.current);
        setPollStatus('FAILED');
        setError('Error checking payment status');
        toast.error('Error checking payment status');
      }
    }, 5000);
  };

  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 10) input = input.slice(0, 10);
    if (input.length > 0 && input[0] !== '0') return;
    setPhoneNumber(input);
  };

  const handleMobileMoneySubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedProvider) {
      setError('Please select a mobile money provider');
      return;
    }
    if (!isValidPhone) {
      setError('Please enter a valid 10-digit phone number starting with 0');
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        request_type: type,
        request_id: id,
        provider: selectedProvider,
        phone_number: phoneNumber,
        amount: requestDetails.total_amount,
      };
      const res = await api.post('/api/payments/deposit', payload);
      if (res.data.success) {
        toast.success('Payment request sent. Check your phone to approve.');
        startPolling(res.data.deposit_id);
      } else {
        setError(res.data.failure_reason || 'Payment initiation failed');
        toast.error('Payment initiation failed');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to initiate payment');
      toast.error('Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleCardPayment = async (method) => {
    setProcessing(true);
    try {
      const customerName = requestDetails.customer_name || requestDetails.full_name || requestDetails.buyer_name;
      const customerPhone = requestDetails.phone || requestDetails.customer_phone;
      const amount = requestDetails.total_amount || requestDetails.amount;

      const paymentData = {
        request_type: type,
        request_id: id,
        customer_name: customerName,
        customer_phone: customerPhone,
        amount: amount,
        payment_method: method
      };
      const response = await api.post('/api/payments/initiate', paymentData);
      await api.post('/api/payments/webhook/mock', { payment_reference: response.data.payment_reference, transaction_id: 'mock_txn' });
      toast.success('Payment successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Card payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-brand-red text-4xl" />
      </div>
    );
  }

  if (!requestDetails) {
    return <div className="text-center py-12">Request not found</div>;
  }

  const amount = requestDetails.total_amount || requestDetails.amount;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-black mb-6">Complete Payment</h1>

        {/* Order Summary */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
            <span>Total Amount:</span>
            <span className="font-bold text-xl">ZMW {amount}</span>
          </div>
          <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
            <span>Base Amount:</span>
            <span>ZMW {requestDetails.base_amount || requestDetails.base_premium}</span>
          </div>
          <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
            <span>Service Fee:</span>
            <span>ZMW {requestDetails.service_fee}</span>
          </div>
        </div>

        {/* Mobile Money Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Pay with Mobile Money</h2>

          {pollStatus === 'WAITING' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center mb-4">
              <FaSpinner className="animate-spin text-brand-red text-4xl mx-auto mb-3" />
              <h3 className="text-lg font-bold text-blue-800">Waiting for Payment</h3>
              <p className="text-blue-600 mt-1">
                Please check your phone and enter your Mobile Money PIN to approve the payment.
              </p>
            </div>
          )}

          {pollStatus === 'COMPLETED' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-4">
              <span className="text-4xl">✅</span>
              <h3 className="text-lg font-bold text-green-800 mt-2">Payment Complete!</h3>
              <p className="text-green-600">Redirecting to dashboard...</p>
            </div>
          )}

          {pollStatus === 'FAILED' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-4">
              <span className="text-4xl">❌</span>
              <h3 className="text-lg font-bold text-red-800 mt-2">Payment Failed</h3>
              <p className="text-red-600">{error || 'Transaction could not be completed.'}</p>
              <button
                onClick={() => { setPollStatus(null); setDepositId(null); setError(''); }}
                className="mt-4 btn-outline py-2 px-4"
              >
                Try Again
              </button>
            </div>
          )}

          {!pollStatus && (
            <form onSubmit={handleMobileMoneySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Select Provider</label>
                <div className="grid grid-cols-3 gap-3">
                  {providers.map(prov => (
                    <button
                      key={prov.provider}
                      type="button"
                      disabled={!prov.deposit_operational}
                      onClick={() => setSelectedProvider(prov.provider)}
                      className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ${
                        !prov.deposit_operational
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                          : selectedProvider === prov.provider
                            ? 'border-brand-red bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {providerLogos[prov.provider] ? (
                        <img
                          src={providerLogos[prov.provider]}
                          alt={providerNames[prov.provider] || prov.provider}
                          className="w-20 h-12 object-contain"
                        />
                      ) : (
                        <span className="text-4xl">📱</span>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {providerNames[prov.provider] || prov.provider}
                      </span>
                      {!prov.deposit_operational && (
                        <span className="text-xs text-red-500">Unavailable</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Mobile Money Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="0xxxxxxxxx (10 digits)"
                  maxLength={10}
                  className="w-full p-3 border rounded-xl focus:outline-none focus:border-brand-red"
                  required
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={processing || !isValidPhone || !selectedProvider}
                className="btn-primary w-full justify-center"
              >
                {processing ? 'Sending...' : `Pay ZMW ${amount} via Mobile Money`}
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or pay with card</span>
          </div>
        </div>

        {/* Card Payment Section */}
        <div className="space-y-4">
          <button
            onClick={() => handleCardPayment('visa')}
            disabled={processing}
            className="w-full btn-primary"
          >
            Pay with Visa/Mastercard
          </button>
         
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;