import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const RecordPayment = () => {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  const [invoice, setInvoice] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');

  useEffect(() => {
    if (invoiceId) {
      api.get(`/api/invoices/${invoiceId}`).then(res => setInvoice(res.data)).catch(console.error);
    }
  }, [invoiceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/payments/record', { invoice_id: invoiceId, amount, payment_method: method });
      toast.success('Payment recorded');
      // redirect
    } catch (err) {
      toast.error('Failed to record payment');
    }
  };

  if (!invoice) return <div className="text-center py-12">Loading invoice...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="glass-card p-8">
        <h1 className="text-2xl font-black mb-4">Record Payment</h1>
        <p>Invoice: {invoice.invoice_reference}</p>
        <p>Total: ZMW {invoice.total_amount}</p>
        <p>Balance: ZMW {invoice.balance}</p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input type="number" step="0.01" placeholder="Amount" className="w-full p-2 border rounded" value={amount} onChange={e => setAmount(e.target.value)} required />
          <select className="w-full p-2 border rounded" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="visa">Visa/Mastercard</option>
            <option value="airtel_money">Airtel Money</option>
          </select>
          <button type="submit" className="btn-primary w-full">Record Payment</button>
        </form>
      </div>
    </div>
  );
};

export default RecordPayment;