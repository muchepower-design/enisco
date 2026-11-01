import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AirportTransferRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [airlines, setAirlines] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  const [formData, setFormData] = useState({
    action_type: 'quote',
    full_name: '',
    phone: '',
    email: '',
    flight_number: '',
    airline: '',
    arrival_time: '',
    departure_time: '',
    transfer_type: 'pickup',
    pickup_location: '',
    dropoff_location: '',
    pickup_date: '',
    pickup_time: '',
    passengers: 1,
    luggage_count: 0,
    vehicle_type: '',
    special_requests: '',
    base_amount: 0,
    notes: ''
  });

  useEffect(() => {
    // Fetch airlines
    api.get('/api/pricing/airlines')
      .then(res => setAirlines(res.data))
      .catch(err => console.error('Failed to load airlines', err));
    // Fetch vehicle types
    api.get('/api/pricing/vehicle-types')
      .then(res => setVehicleTypes(res.data))
      .catch(err => console.error('Failed to load vehicle types', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      email: formData.email || null,
      arrival_time: formData.arrival_time ? new Date(formData.arrival_time).toISOString() : null,
      departure_time: formData.departure_time ? new Date(formData.departure_time).toISOString() : null,
      pickup_date: new Date(formData.pickup_date).toISOString(),
      base_amount: parseFloat(formData.base_amount) || 0,
      notes: formData.notes || null,
      passengers: parseInt(formData.passengers) || 1,
      luggage_count: parseInt(formData.luggage_count) || 0,
    };

    try {
      const formDataObj = new FormData();
      formDataObj.append('data', JSON.stringify(payload));
      await api.post('/api/airporttransfer/request', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Airport transfer request submitted!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-black mb-6">Airport Transfer Request</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Personal Details</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Full Name *</label><input type="text" required className="w-full p-2 border rounded" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Phone *</label><input type="tel" required className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Email *</label><input type="email" required className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            </div>
          </fieldset>

          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Flight Details</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Flight Number *</label><input type="text" required className="w-full p-2 border rounded" value={formData.flight_number} onChange={e => setFormData({...formData, flight_number: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Airline</label>
                <select className="w-full p-2 border rounded" value={formData.airline} onChange={e => setFormData({...formData, airline: e.target.value})}>
                  <option value="">Select Airline</option>
                  {airlines.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>
              </div>
              <div><label className="block font-bold mb-1">Arrival Time</label><input type="datetime-local" className="w-full p-2 border rounded" value={formData.arrival_time} onChange={e => setFormData({...formData, arrival_time: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Departure Time</label><input type="datetime-local" className="w-full p-2 border rounded" value={formData.departure_time} onChange={e => setFormData({...formData, departure_time: e.target.value})} /></div>
            </div>
          </fieldset>

          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Transfer Details</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Transfer Type *</label>
                <select className="w-full p-2 border rounded" value={formData.transfer_type} onChange={e => setFormData({...formData, transfer_type: e.target.value})}>
                  <option value="pickup">From Airport to Destination</option>
                  <option value="dropoff">From Pickup to Airport</option>
                </select>
              </div>
              <div><label className="block font-bold mb-1">Pickup Location *</label><input type="text" required className="w-full p-2 border rounded" value={formData.pickup_location} onChange={e => setFormData({...formData, pickup_location: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Drop-off Location *</label><input type="text" required className="w-full p-2 border rounded" value={formData.dropoff_location} onChange={e => setFormData({...formData, dropoff_location: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Pickup Date *</label><input type="date" required className="w-full p-2 border rounded" value={formData.pickup_date} onChange={e => setFormData({...formData, pickup_date: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Pickup Time</label><input type="time" className="w-full p-2 border rounded" value={formData.pickup_time} onChange={e => setFormData({...formData, pickup_time: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Passengers</label><input type="number" min="1" className="w-full p-2 border rounded" value={formData.passengers} onChange={e => setFormData({...formData, passengers: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Luggage Count</label><input type="number" min="0" className="w-full p-2 border rounded" value={formData.luggage_count} onChange={e => setFormData({...formData, luggage_count: e.target.value})} /></div>
            </div>
          </fieldset>

          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Vehicle Preference</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Vehicle Type</label>
                <select className="w-full p-2 border rounded" value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})}>
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div><label className="block font-bold mb-1">Special Requests</label><input type="text" className="w-full p-2 border rounded" value={formData.special_requests} onChange={e => setFormData({...formData, special_requests: e.target.value})} placeholder="e.g., wheelchair accessible" /></div>
            </div>
          </fieldset>

          <div><label className="block font-bold mb-1">Base Amount (ZMW)</label><input type="number" step="0.01" className="w-full p-2 border rounded" value={formData.base_amount} onChange={e => setFormData({...formData, base_amount: e.target.value})} /></div>
          <div><label className="block font-bold mb-1">Notes</label><textarea className="w-full p-2 border rounded" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>

          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Submit Request'}</button>
        </form>
      </div>
    </div>
  );
};

export default AirportTransferRequest;