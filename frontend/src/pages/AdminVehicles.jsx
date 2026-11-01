import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaSpinner, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    number_plate: '',
    model: '',
    type: '',
    hourly_rate: '',
    daily_rate: '',
    is_available: true,
    can_hire_external: false
  });

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/api/admin/vehicles');
      setVehicles(res.data);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/admin/vehicles/${editing}`, form);
        toast.success('Vehicle updated');
      } else {
        await api.post('/api/admin/vehicles', form);
        toast.success('Vehicle added');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ number_plate: '', model: '', type: '', hourly_rate: '', daily_rate: '', is_available: true, can_hire_external: false });
      fetchVehicles();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/api/admin/vehicles/${id}`);
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">Vehicle Inventory</h1>
        <button onClick={() => { setEditing(null); setForm({ number_plate: '', model: '', type: '', hourly_rate: '', daily_rate: '', is_available: true, can_hire_external: false }); setShowModal(true); }} className="btn-primary">
          <FaPlus /> Add Vehicle
        </button>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr><th className="p-3">Plate</th><th>Model</th><th>Type</th><th>Hourly</th><th>Daily</th><th>Available</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{v.number_plate}</td>
                <td className="p-3">{v.model}</td>
                <td className="p-3">{v.type}</td>
                <td className="p-3">ZMW {v.hourly_rate}</td>
                <td className="p-3">ZMW {v.daily_rate}</td>
                <td className="p-3">{v.is_available ? 'Yes' : 'No'}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => { setEditing(v.id); setForm(v); setShowModal(true); }} className="text-blue-600"><FaEdit /></button>
                  <button onClick={() => handleDelete(v.id)} className="text-red-600"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editing ? 'Edit Vehicle' : 'New Vehicle'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Number Plate" required className="w-full p-2 border rounded" value={form.number_plate} onChange={e => setForm({...form, number_plate: e.target.value})} />
              <input type="text" placeholder="Model" required className="w-full p-2 border rounded" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
              <input type="text" placeholder="Type (SUV/Sedan/Van)" className="w-full p-2 border rounded" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
              <input type="number" step="0.01" placeholder="Hourly Rate" className="w-full p-2 border rounded" value={form.hourly_rate} onChange={e => setForm({...form, hourly_rate: e.target.value})} />
              <input type="number" step="0.01" placeholder="Daily Rate" className="w-full p-2 border rounded" value={form.daily_rate} onChange={e => setForm({...form, daily_rate: e.target.value})} />
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} /> Available</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.can_hire_external} onChange={e => setForm({...form, can_hire_external: e.target.checked})} /> Can hire external</label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline py-2 px-4">Cancel</button>
                <button type="submit" className="btn-primary py-2 px-4">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;