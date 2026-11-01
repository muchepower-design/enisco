import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import StaffDashboard from '../components/Dashboard/StaffDashboard';
import ClientDashboard from '../components/Dashboard/ClientDashboard';
import { FaSpinner } from 'react-icons/fa';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-brand-red text-4xl" />
      </div>
    );
  }

  if (!user) return null;

  // Role-based dashboard rendering
  if (user.role === 'admin' || user.user_type === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'sales_officer' || user.role === 'finance_officer' || user.role === 'operations_manager') {
    return <StaffDashboard />;
  }

  return <ClientDashboard />;
};

export default Dashboard;