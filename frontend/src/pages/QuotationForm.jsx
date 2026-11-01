import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const QuotationForm = () => {
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request_id');
  const type = searchParams.get('type'); // travel, insurance, visa
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    request_type: type,
    request_id: requestId,
    quote_title: '',
    quote_details: '',
    base_amount: '',
    service_fee: '',
    total_amount: '',
    validity_date: ''
  });

  useEffect(() => {
    if (type && requestId) {
      let endpoint = '';
      if (type === 'travel') endpoint = `/api/travel/request/${requestId}`;
      else if (type === 'insurance') endpoint = `/api/insurance/request/${requestId}`;
      else if (type === 'visa') endpoint = `/api/visa/request/${requestId}`;
      else if (type === 'flight') endpoint = `/api/flight/request/${requestId}`;
      else if (type === 'carhire') endpoint = `/api/carhire/request/${requestId}`;
      else if (type === 'airporttransfer') endpoint = `/api/airporttransfer/request/${requestId}`;
      else return;

      api.get(endpoint)
        .then(res => {
          const req = res.data;
          const customerName = req.full_name || req.buyer_name || req.applicant_name;
          const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Request - ${req.request_reference}`;
          const details = `Service: ${type}\nCustomer: ${customerName}\nRequest Reference: ${req.request_reference}`;
          const base = req.total_amount || req.base_amount || req.base_premium || req.base_fee || 0;
          const fee = req.service_fee || 0;
          setFormData({
            ...formData,
            quote_title: title,
            quote_details: details,
            base_amount: base,
            service_fee: fee,
            total_amount: (parseFloat(base) + parseFloat(fee)).toFixed(2)
          });
        })
        .catch(err => {
          toast.error('Failed to load request details');
          console.error(err);
        });
    }
  }, [type, requestId]);

  const updateTotal = () => {
    const base = parseFloat(formData.base_amount) || 0;
    const fee = parseFloat(formData.service_fee) || 0;
    setFormData(prev => ({ ...prev, total_amount: (base + fee).toFixed(2) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/quotations/', formData);
      toast.success('Quotation created');
      navigate('/quotations');
    } catch (err) {
      toast.error('Failed to create quotation');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-black mb-6">Create Quotation</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="block font-bold mb-2">Title *</label><input type="text" required className="w-full p-3 border rounded" value={formData.quote_title} onChange={e => setFormData({...formData, quote_title: e.target.value})} /></div>
          <div><label className="block font-bold mb-2">Details</label><textarea rows="4" className="w-full p-3 border rounded" value={formData.quote_details} onChange={e => setFormData({...formData, quote_details: e.target.value})} /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block font-bold mb-2">Base Amount (ZMW)</label><input type="number" step="0.01" className="w-full p-3 border rounded" value={formData.base_amount} onChange={e => setFormData({...formData, base_amount: e.target.value, total_amount: ''})} onBlur={updateTotal} /></div>
            <div><label className="block font-bold mb-2">Service Fee (ZMW)</label><input type="number" step="0.01" className="w-full p-3 border rounded" value={formData.service_fee} onChange={e => setFormData({...formData, service_fee: e.target.value, total_amount: ''})} onBlur={updateTotal} /></div>
          </div>
          <div><label className="block font-bold mb-2">Total Amount (ZMW)</label><input type="text" readOnly className="w-full p-3 border rounded bg-gray-100" value={formData.total_amount} /></div>
          <div><label className="block font-bold mb-2">Validity Date</label><input type="date" className="w-full p-3 border rounded" value={formData.validity_date} onChange={e => setFormData({...formData, validity_date: e.target.value})} /></div>
          <button type="submit" className="btn-primary w-full">Create Quotation</button>
        </form>
      </div>
    </div>
  );
};

export default QuotationForm;