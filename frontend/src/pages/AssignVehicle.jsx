import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AssignVehicle = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');

  useEffect(() => {
    api.get(`/api/travel/request/${taskId}`).then(res => setTask(res.data)).catch(console.error);
    api.get('/api/admin/vehicles').then(res => setVehicles(res.data)).catch(console.error);
  }, [taskId]);

  const handleAssign = async () => {
    try {
      await api.post(`/api/operations/assign/${taskId}`, { vehicle_id: selectedVehicle });
      toast.success('Vehicle assigned');
      navigate('/operations/schedule');
    } catch (err) {
      toast.error('Assignment failed');
    }
  };

  if (!task) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="glass-card p-8">
        <h1 className="text-2xl font-black mb-4">Assign Vehicle</h1>
        <p>Request: {task.request_reference}</p>
        <p>Customer: {task.full_name}</p>
        <p>Pickup: {task.pickup_location} → {task.destination}</p>
        <select className="w-full p-2 border rounded my-4" value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
          <option value="">Select Vehicle</option>
          {vehicles.filter(v => v.is_available).map(v => (
            <option key={v.id} value={v.id}>{v.number_plate} - {v.model}</option>
          ))}
        </select>
        <button onClick={handleAssign} className="btn-primary w-full">Assign</button>
      </div>
    </div>
  );
};

export default AssignVehicle;