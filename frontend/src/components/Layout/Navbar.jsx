import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Flight Ticketing', path: '/travel-request' },
    { name: 'Airport Transfer', path: '/travel-request?service=airport_transfer' },
    { name: 'Insurance', path: '/insurance-request' },
    { name: 'Car Hire', path: '/travel-request?service=vehicle_rental' },
    { name: 'Visa Assistance', path: '/visa-request' },
    { name: 'Tour Packages', path: '/tour-packages' },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 glass shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
            <div className="w-12 h-12 border-4 border-brand-red border-l-transparent border-r-transparent rounded-full flex items-center justify-center font-black text-brand-red text-xl">E</div>
            <div>
              <h1 className="text-2xl font-black text-brand-red">Enisco</h1>
              <p className="text-xs text-gray-500">Beyond Boundaries</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="font-bold hover:text-brand-red transition"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side: Auth buttons or user menu + mobile toggle */}
          <div className="flex items-center gap-4">
            {/* Desktop auth buttons / user menu */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
                    <FaUserCircle size={24} />
                    <span className="font-semibold">{user.full_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 glass-card hidden group-hover:block">
                    <Link to="/dashboard" className="block px-4 py-2 hover:bg-red-50">Dashboard</Link>
                    <Link to="/quotations" className="block px-4 py-2 hover:bg-red-50">Quotations</Link>
                    <Link to="/invoices" className="block px-4 py-2 hover:bg-red-50">Invoices</Link>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600">Logout</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn-outline py-2">Login</Link>
                  <Link to="/register" className="btn-primary py-2">Register</Link>
                </div>
              )}
            </div>

            {/* Mobile menu toggle button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-2xl text-gray-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-card mt-2 p-4 space-y-3 animate-slideDown">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block font-bold py-2 hover:text-brand-red transition"
                onClick={closeMobileMenu}
              >
                {link.name}
              </Link>
            ))}
            {/* Mobile auth buttons / user menu */}
            {user ? (
              <>
                <hr className="my-2" />
                <Link to="/dashboard" className="block py-2 hover:text-brand-red" onClick={closeMobileMenu}>Dashboard</Link>
                <Link to="/quotations" className="block py-2 hover:text-brand-red" onClick={closeMobileMenu}>Quotations</Link>
                <Link to="/invoices" className="block py-2 hover:text-brand-red" onClick={closeMobileMenu}>Invoices</Link>
                <button
                  onClick={() => { logout(); closeMobileMenu(); }}
                  className="block w-full text-left py-2 text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" className="btn-outline py-2 text-center" onClick={closeMobileMenu}>Login</Link>
                <Link to="/register" className="btn-primary py-2 text-center" onClick={closeMobileMenu}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;