import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    try {
      await api.post('/api/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 py-12 px-4">
      <div className="glass-card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-black">E</span>
          </div>
          <h2 className="text-3xl font-black">Create Account</h2>
          <p className="text-gray-600 mt-2">Join Enisco for seamless travel and insurance services</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Full Name *</label>
            <input type="text" required className="w-full px-4 py-3 rounded-xl border" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}/>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Email *</label>
            <input type="email" required className="w-full px-4 py-3 rounded-xl border" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Phone *</label>
            <input type="tel" required className="w-full px-4 py-3 rounded-xl border" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Password *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required className="w-full px-4 py-3 rounded-xl border pr-12" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}/>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><FaEye size={20}/></button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Confirm Password *</label>
            <input type="password" required className="w-full px-4 py-3 rounded-xl border" value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})}/>
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button type="submit" className="btn-primary w-full justify-center">Register</button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Already have an account? <Link to="/login" className="text-brand-red font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;