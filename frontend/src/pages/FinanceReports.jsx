import { Link } from 'react-router-dom';

const FinanceReports = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="glass-card p-8 text-center">
        <h1 className="text-3xl font-black mb-4">Financial Reports</h1>
        <p className="text-gray-600 mb-6">This feature is coming soon. You will be able to generate and download financial reports here.</p>
        <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default FinanceReports;