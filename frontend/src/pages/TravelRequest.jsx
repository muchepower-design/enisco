import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import PriceCalculator from '../components/PriceCalculator';

const TravelRequest = () => {
  const [searchParams] = useSearchParams();
  const preSelectedService = searchParams.get('service');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    action_type: 'quote',
    service_type: preSelectedService || 'flight_ticketing',
    full_name: '',
    phone: '',
    email: '',
    pickup_location: '',
    destination: '',
    travel_date: '',
    passengers: 1,
    preferred_vehicle: '',
    base_amount: 0,
    notes: '',
    // Flight‑specific fields (only for flight ticketing)
    airline_id: '',
    origin: '',
    travel_class: 'economy'
  });

  const [priceAvailable, setPriceAvailable] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  const isFlight = formData.service_type === 'flight_ticketing';
  const isQuoteOnly = formData.action_type === 'quote';

  const handlePriceFetched = (amount, message) => {
    setCalculatedPrice(amount);
    setPriceAvailable(amount !== null);
    if (amount !== null) {
      setFormData(prev => ({ ...prev, base_amount: amount }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If flight ticketing and price is available, we directly proceed to payment
    // But we still submit the request first; the backend will create a payment intent if base_amount > 0
    // Alternatively, we could redirect to payment after creation.
    const payload = {
      action_type: formData.action_type,
      service_type: formData.service_type,
      full_name: formData.full_name,
      phone: formData.phone,
      email: formData.email || null,
      pickup_location: formData.pickup_location || null,
      destination: formData.destination || null,
      travel_date: formData.travel_date ? new Date(formData.travel_date).toISOString() : null,
      passengers: formData.passengers ? parseInt(formData.passengers, 10) : null,
      preferred_vehicle: formData.preferred_vehicle || null,
      base_amount: calculatedPrice || parseFloat(formData.base_amount) || 0,
      notes: formData.notes || null,
      // Include flight details if needed (backend may not use, but we can pass)
      airline_id: formData.airline_id,
      origin: formData.origin,
      travel_class: formData.travel_class
    };

    try {
      const response = await api.post('/api/travel/request', payload);
      const requestId = response.data.id;
      toast.success('Request submitted successfully!');

      // If price is available and action is not quote, redirect to payment
      if (priceAvailable && formData.action_type !== 'quote') {
        navigate(`/payment/travel/${requestId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        toast.error(detail.map(e => e.msg).join(', '));
      } else if (typeof detail === 'string') {
        toast.error(detail);
      } else {
        toast.error('Failed to submit request. Please check your inputs.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-black mb-6">New Travel Request</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type & Action Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold mb-2">Service Type *</label>
              <select
                value={formData.service_type}
                onChange={e => setFormData({...formData, service_type: e.target.value})}
                className="w-full p-3 rounded-xl border"
                required
              >
                <option value="airport_transfer">Airport Transfer</option>
                <option value="vehicle_rental">Vehicle Rental</option>
                <option value="flight_ticketing">Flight Ticketing</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-2">Action Type *</label>
              <select
                value={formData.action_type}
                onChange={e => setFormData({...formData, action_type: e.target.value})}
                className="w-full p-3 rounded-xl border"
                required
              >
                <option value="quote">Request Quote</option>
                <option value="reservation">Make Reservation</option>
                <option value="booking">Confirm Booking</option>
              </select>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div><label className="block font-bold mb-2">Full Name *</label><input type="text" required className="w-full p-3 rounded-xl border" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} /></div>
            <div><label className="block font-bold mb-2">Phone *</label><input type="tel" required className="w-full p-3 rounded-xl border" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
          </div>
          <div><label className="block font-bold mb-2">Email</label><input type="email" className="w-full p-3 rounded-xl border" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>

          {/* Journey / Flight Details */}
          {!isFlight && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label className="block font-bold mb-2">Pickup Location</label><input type="text" className="w-full p-3 rounded-xl border" value={formData.pickup_location} onChange={e => setFormData({...formData, pickup_location: e.target.value})} /></div>
                <div><label className="block font-bold mb-2">Destination</label><input type="text" className="w-full p-3 rounded-xl border" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label className="block font-bold mb-2">Travel Date</label><input type="date" className="w-full p-3 rounded-xl border" value={formData.travel_date} onChange={e => setFormData({...formData, travel_date: e.target.value})} /></div>
                <div><label className="block font-bold mb-2">Passengers</label><input type="number" min="1" className="w-full p-3 rounded-xl border" value={formData.passengers} onChange={e => setFormData({...formData, passengers: e.target.value})} /></div>
              </div>
              <div><label className="block font-bold mb-2">Preferred Vehicle</label><input type="text" className="w-full p-3 rounded-xl border" value={formData.preferred_vehicle} onChange={e => setFormData({...formData, preferred_vehicle: e.target.value})} /></div>
            </>
          )}

          {isFlight && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label className="block font-bold mb-2">Airline *</label>
                  <select className="w-full p-3 rounded-xl border" value={formData.airline_id} onChange={e => setFormData({...formData, airline_id: e.target.value})}>
                    <option value="">Select Airline</option>
                    {/* Populate airlines from backend – you can fetch on component mount */}
                    <option value="some-uuid">Emirates</option>
                    <option value="some-uuid2">Ethiopian Airlines</option>
                  </select>
                </div>
                <div><label className="block font-bold mb-2">Travel Class *</label>
                  <select className="w-full p-3 rounded-xl border" value={formData.travel_class} onChange={e => setFormData({...formData, travel_class: e.target.value})}>
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label className="block font-bold mb-2">Origin (Airport/City) *</label><input type="text" required className="w-full p-3 rounded-xl border" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} /></div>
                <div><label className="block font-bold mb-2">Destination (Airport/City) *</label><input type="text" required className="w-full p-3 rounded-xl border" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} /></div>
              </div>

              <PriceCalculator
                serviceType="flight"
                params={{
                  airline_id: formData.airline_id,
                  origin: formData.origin,
                  destination: formData.destination,
                  travel_class: formData.travel_class
                }}
                onPriceFetched={handlePriceFetched}
              />
            </>
          )}

          <div><label className="block font-bold mb-2">Notes</label><textarea className="w-full p-3 rounded-xl border" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>

          <button type="submit" className="btn-primary w-full justify-center">
            {priceAvailable && isFlight && formData.action_type !== 'quote' ? 'Proceed to Payment' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TravelRequest;