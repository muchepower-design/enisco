import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requestDetails, setRequestDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        let endpoint;
        // Map the type to the correct API endpoint
        switch (type) {
          case 'travel':
            endpoint = `/api/travel/request/${id}`;
            break;
          case 'insurance':
            endpoint = `/api/insurance/request/${id}`;
            break;
          case 'quotation':
            endpoint = `/api/quotations/${id}`;
            break;
          case 'flight':
            endpoint = `/api/flight/request/${id}`;
            break;
          case 'carhire':
            endpoint = `/api/carhire/request/${id}`;
            break;
          case 'airporttransfer':
            endpoint = `/api/airporttransfer/request/${id}`;
            break;
          default:
            toast.error('Invalid payment type');
            return;
        }
        const res = await api.get(endpoint);
        setRequestDetails(res.data);
      } catch (err) {
        toast.error('Failed to load details');
      }
    };
    fetchDetails();
  }, [type, id]);

  const handlePayment = async (method) => {
    setLoading(true);
    try {
      // Determine customer name and phone based on type
      let customerName = requestDetails.customer_name || requestDetails.full_name || requestDetails.buyer_name;
      let customerPhone = requestDetails.phone || requestDetails.customer_phone;
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
      // Mock payment: simulate success
      await api.post('/api/payments/webhook/mock', { payment_reference: response.data.payment_reference, transaction_id: 'mock_txn' });
      toast.success('Payment successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!requestDetails) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-black mb-6">Complete Payment</h1>
        <div className="space-y-4 mb-8">
          <div className="flex justify-between p-4 bg-gray-50 rounded-xl"><span>Total Amount:</span><span className="font-bold text-xl">ZMW {requestDetails.total_amount}</span></div>
          <div className="flex justify-between p-4 bg-gray-50 rounded-xl"><span>Base Amount:</span><span>ZMW {requestDetails.base_amount || requestDetails.base_premium}</span></div>
          <div className="flex justify-between p-4 bg-gray-50 rounded-xl"><span>Service Fee:</span><span>ZMW {requestDetails.service_fee}</span></div>
        </div>
        <div className="space-y-4">
          <button onClick={() => handlePayment('visa')} disabled={loading} className="w-full btn-primary">Pay with Visa/Mastercard</button>
          <button onClick={() => handlePayment('airtel_money')} disabled={loading} className="w-full btn-outline">Airtel Money</button>
          <button onClick={() => handlePayment('mtn_money')} disabled={loading} className="w-full btn-outline">MTN Money</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;