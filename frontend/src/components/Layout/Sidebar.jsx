import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome, FaCar, FaShieldAlt, FaPassport, FaReceipt, FaFileInvoice,
  FaComments, FaFileAlt, FaUsers, FaTachometerAlt, FaSignOutAlt,
  FaPlane, FaTaxi, FaUserCircle
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isAdmin = user?.role === 'admin' || user?.user_type === 'admin';
  const isStaff = ['sales_officer', 'finance_officer', 'operations_manager'].includes(user?.role);
  const isClient = user?.role === 'client';

  // ----- Client Menu -----
  const clientMenus = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    // Travel services split into three
    { name: 'Flights', path: '/my-flights', icon: <FaPlane /> },
    { name: 'Car Hire', path: '/my-carhires', icon: <FaCar /> },
    { name: 'Airport Transfer', path: '/my-airport-transfers', icon: <FaTaxi /> },
    { name: 'Insurance Requests', path: '/my-insurance-requests', icon: <FaShieldAlt /> },
    { name: 'Visa Requests', path: '/my-visa-requests', icon: <FaPassport /> },
    { name: 'Quotations', path: '/quotations', icon: <FaReceipt /> },
    { name: 'Invoices', path: '/invoices', icon: <FaFileInvoice /> },
    { name: 'Chats', path: '/my-chats', icon: <FaComments /> },
    { name: 'Documents', path: '/my-documents', icon: <FaFileAlt /> },
  ];

  // ----- Staff Menu -----
  const staffMenus = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Pending Travel', path: '/admin/travel-requests', icon: <FaPlane /> },
    { name: 'Create Quotation', path: '/quotations/create', icon: <FaReceipt /> },
    { name: 'Customer Chats', path: '/staff/chats', icon: <FaComments /> },
  ];

  // ----- Admin Menu -----
  const adminMenus = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'User Management', path: '/admin/users', icon: <FaUsers /> },
    { name: 'Vehicle Inventory', path: '/admin/vehicles', icon: <FaCar /> },
    { name: 'Upload Documents', path: '/admin/documents', icon: <FaFileAlt /> },
    { name: 'All Requests', path: '/admin/travel-requests', icon: <FaPlane /> },
    { name: 'Quotations', path: '/quotations', icon: <FaReceipt /> },
    { name: 'Invoices', path: '/invoices', icon: <FaFileInvoice /> },
  ];

  let menus = clientMenus;
  if (isAdmin) menus = adminMenus;
  else if (isStaff) menus = staffMenus;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-md shadow-xl z-40 overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-white font-bold">E</div>
          <div>
            <h2 className="font-bold">{user?.full_name}</h2>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
      <nav className="p-2">
        {menus.map(menu => (
          <Link
            key={menu.name}
            to={menu.path}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition mb-1"
          >
            <span className="text-brand-red">{menu.icon}</span>
            <span>{menu.name}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 w-full mt-4"
        >
          <FaSignOutAlt /> Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;