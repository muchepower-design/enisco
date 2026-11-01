import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const services = [
    { name: 'Flight Ticketing', path: '/travel-request?service=flight_ticketing' },
    { name: 'Airport Transfer', path: '/travel-request?service=airport_transfer' },
    { name: 'Car Hire', path: '/travel-request?service=vehicle_rental' },
    { name: 'Insurance', path: '/insurance-request' },
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

          {/* Desktop Navigation with Dropdowns */}
          <div className="hidden md:flex items-center gap-8">
            {/* Services Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setOpenDropdown('services')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="font-bold hover:text-brand-red transition flex items-center gap-1">
                Services <FaChevronDown size={12} />
              </button>
              {openDropdown === 'services' && (
                <div className="absolute left-0 mt-2 w-56 glass-card rounded-lg shadow-lg py-2 z-20">
                  {services.map(service => (
                    <Link
                      key={service.name}
                      to={service.path}
                      className="block px-4 py-2 hover:bg-red-50 transition"
                      onClick={closeMobileMenu}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/about" className="font-bold hover:text-brand-red transition">About</Link>
            <Link to="/contact" className="font-bold hover:text-brand-red transition">Contact</Link>            
            <Link to="/news" className="font-bold hover:text-brand-red transition">News</Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex gap-4">
            <Link to="/login" className="btn-outline py-2">Login</Link>
            <Link to="/register" className="btn-primary py-2">Register</Link>
          </div>

          {/* Mobile Toggle */}
          <button onClick={toggleMobileMenu} className="md:hidden text-2xl">
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-card mt-2 p-4 space-y-3">
            <div className="space-y-2">
              <div className="font-bold text-gray-700">Services</div>
              {services.map(service => (
                <Link key={service.name} to={service.path} className="block pl-4 py-1 hover:text-brand-red" onClick={closeMobileMenu}>
                  {service.name}
                </Link>
              ))}
            </div>
            <Link to="/about" className="block py-1 hover:text-brand-red" onClick={closeMobileMenu}>About</Link>
            <Link to="/news" className="block py-1 hover:text-brand-red" onClick={closeMobileMenu}>News</Link>
            <Link to="/contact" className="block py-1 hover:text-brand-red" onClick={closeMobileMenu}>Contact</Link>
            <hr />
            <Link to="/login" className="block py-1 text-brand-red font-bold" onClick={closeMobileMenu}>Login</Link>
            <Link to="/register" className="block py-1 text-brand-red font-bold" onClick={closeMobileMenu}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;