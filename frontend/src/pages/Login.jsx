import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // new loading state
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // show spinner and disable button

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Extract a readable error message
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        // FastAPI validation error array
        setError(detail.map(e => e.msg).join(', '));
      } else if (detail && typeof detail === 'object') {
        setError(JSON.stringify(detail));
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false); // hide spinner and re-enable button
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 py-12 px-4">
      <div className="glass-card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-black">E</span>
          </div>
          <h2 className="text-3xl font-black">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-red transition"
              required
              disabled={isLoading} // disable input while loading
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-red transition pr-12"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-red"
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>
          
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          
          <button 
            type="submit" 
            className="btn-primary w-full justify-center flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                {/* Spinner (Tailwind CSS animated border) */}
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <p className="text-center mt-6 text-gray-600">
          Don't have an account? <Link to="/register" className="text-brand-red font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;