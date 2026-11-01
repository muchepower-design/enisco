// Invoices.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  
  useEffect(() => {
    api.get('/api/invoices/').then(res => setInvoices(res.data));
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-8">My Invoices</h1>
      <div className="space-y-4">
        {invoices.map(i => (
          <div key={i.id} className="glass-card p-6 flex justify-between items-center">
            <div><p className="font-bold">{i.invoice_reference}</p><p>{i.invoice_title}</p><p>Amount: ZMW {i.total_amount}</p></div>
            <span className={`px-3 py-1 rounded-full text-sm ${i.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>{i.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Invoices;