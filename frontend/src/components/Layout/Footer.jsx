import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-600">
        <p>© {new Date().getFullYear()} <strong className="text-brand-red">Enisco Transport Car Hire and Travels Ltd</strong>. Beyond Boundaries.</p>
        <p className="mt-2">Made with <FaHeart className="inline text-red-500"/> Kanch Innovative Technologies Limited</p>
        <div className="mt-4">
          <Link to="/terms" className="text-sm hover:text-brand-red transition mx-2">Terms of Service</Link>
          <Link to="/privacy" className="text-sm hover:text-brand-red transition mx-2">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;