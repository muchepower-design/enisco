import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicNavbar from './components/Layout/PublicNavbar';
import Sidebar from './components/Layout/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Legacy travel (keep for backward compatibility)
import TravelRequest from './pages/TravelRequest';
import MyTravelRequests from './pages/MyTravelRequests';
import TravelRequestDetail from './pages/TravelRequestDetail';

// New flight services
import FlightRequest from './pages/FlightRequest';
import MyFlightRequests from './pages/MyFlightRequests';
import FlightRequestDetail from './pages/FlightRequestDetail';

// New car hire services
import CarHireRequest from './pages/CarHireRequest';
import MyCarHireRequests from './pages/MyCarHireRequests';
import CarHireRequestDetail from './pages/CarHireRequestDetail';

// New airport transfer services
import AirportTransferRequest from './pages/AirportTransferRequest';
import MyAirportTransferRequests from './pages/MyAirportTransferRequests';
import AirportTransferRequestDetail from './pages/AirportTransferRequestDetail';

// Insurance
import InsuranceRequest from './pages/InsuranceRequest';
import MyInsuranceRequests from './pages/MyInsuranceRequests';
import InsuranceRequestDetail from './pages/InsuranceRequestDetail';

//Visa
import VisaRequest from './pages/VisaRequest';
import MyVisaRequests from './pages/MyVisaRequests';
import VisaRequestDetail from './pages/VisaRequestDetail';

//Tour Packages
import TourPackages from './pages/TourPackages';
import TourPackageDetail from './pages/TourPackageDetail';
import AdminTourPackages from './pages/AdminTourPackages';

// Quotations & Invoices
import Quotations from './pages/Quotations';
import QuotationForm from './pages/QuotationForm';
import QuotationDetail from './pages/QuotationDetail';
import Invoices from './pages/Invoices';

// Payments
import PaymentPage from './pages/PaymentPage';

// Admin pages
import AdminUsers from './pages/AdminUsers';
import AdminTravelRequests from './pages/AdminTravelRequests';
import AdminVehicles from './pages/AdminVehicles';
import AdminDocuments from './pages/AdminDocuments';

// Staff pages
import StaffChats from './pages/StaffChats';

// Chats & Documents
import MyChats from './pages/MyChats';
import MyDocuments from './pages/MyDocuments';

// Finance & Operations
import FinanceReports from './pages/FinanceReports';
import RecordPayment from './pages/RecordPayment';
import OperationsSchedule from './pages/OperationsSchedule';
import AssignVehicle from './pages/AssignVehicle';

// Public pages
import About from './pages/About';
import Contact from './pages/Contact';
import Footer from './components/Layout/Footer';

import NewsList from './pages/NewsList';
import NewsDetail from './pages/NewsDetail';
import AdminNews from './pages/AdminNews';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn ? (
        // Logged‑in layout with sidebar
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64">
            <Routes>
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Legacy Travel (keep for compatibility) */}
              <Route path="/travel-request" element={<TravelRequest />} />
              <Route path="/my-travel-requests" element={<MyTravelRequests />} />
              <Route path="/travel-request/:id" element={<TravelRequestDetail />} />

              {/* Flight Services */}
              <Route path="/flight-request" element={<FlightRequest />} />
              <Route path="/my-flights" element={<MyFlightRequests />} />
              <Route path="/flight-request/:id" element={<FlightRequestDetail />} />

              {/* Car Hire Services */}
              <Route path="/carhire-request" element={<CarHireRequest />} />
              <Route path="/my-carhires" element={<MyCarHireRequests />} />
              <Route path="/carhire-request/:id" element={<CarHireRequestDetail />} />

              {/* Airport Transfer Services */}
              <Route path="/airport-transfer-request" element={<AirportTransferRequest />} />
              <Route path="/my-airport-transfers" element={<MyAirportTransferRequests />} />
              <Route path="/airport-transfer-request/:id" element={<AirportTransferRequestDetail />} />

              {/* Insurance */}
              <Route path="/insurance-request" element={<InsuranceRequest />} />
              <Route path="/my-insurance-requests" element={<MyInsuranceRequests />} />
              <Route path="/insurance-request/:id" element={<InsuranceRequestDetail />} />

              {/* Visa */}
              <Route path="/visa-request" element={<VisaRequest />} />
              <Route path="/my-visa-requests" element={<MyVisaRequests />} />
              <Route path="/visa-request/:id" element={<VisaRequestDetail />} />

              {/* Tour Packages – list is public, detail is protected */}
              <Route path="/tour-packages" element={<TourPackages />} />
              <Route path="/tour-packages/:id" element={<ProtectedRoute><TourPackageDetail /></ProtectedRoute>} />

              {/* Quotations */}
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/quotations/create" element={<QuotationForm />} />
              <Route path="/quotations/:id" element={<QuotationDetail />} />

              {/* Invoices */}
              <Route path="/invoices" element={<Invoices />} />

              {/* Payments */}
              <Route path="/payment/:type/:id" element={<PaymentPage />} />

              {/* Chats & Documents */}
              <Route path="/my-chats" element={<MyChats />} />
              <Route path="/my-documents" element={<MyDocuments />} />
              <Route path="/staff/chats" element={<StaffChats />} />

              {/* Admin */}
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/travel-requests" element={<AdminTravelRequests />} />
              <Route path="/admin/vehicles" element={<AdminVehicles />} />
              <Route path="/admin/documents" element={<AdminDocuments />} />
              <Route path="/admin/news" element={<ProtectedRoute requiredRole="admin"><AdminNews /></ProtectedRoute>} />
              <Route path="/admin/tour-packages" element={<ProtectedRoute requiredRole="admin"><AdminTourPackages /></ProtectedRoute>} />

              {/* Finance & Operations */}
              <Route path="/finance/reports" element={<ProtectedRoute requiredRole="finance_officer"><FinanceReports /></ProtectedRoute>} />
              <Route path="/payments/record" element={<ProtectedRoute requiredRole="finance_officer"><RecordPayment /></ProtectedRoute>} />
              <Route path="/operations/schedule" element={<ProtectedRoute requiredRole="operations_manager"><OperationsSchedule /></ProtectedRoute>} />
              <Route path="/operations/assign/:taskId" element={<ProtectedRoute requiredRole="operations_manager"><AssignVehicle /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      ) : (
        // Public layout (no sidebar, top navbar only)
        <>
          <PublicNavbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              <Route path="/news" element={<NewsList />} />
              <Route path="/news/:id" element={<NewsDetail />} />

              {/* Tour Packages – list only (detail is removed from public) */}
              <Route path="/tour-packages" element={<TourPackages />} />

              {/* Protected routes – will redirect to login */}
              <Route path="/travel-request" element={<ProtectedRoute><TravelRequest /></ProtectedRoute>} />
              <Route path="/flight-request" element={<ProtectedRoute><FlightRequest /></ProtectedRoute>} />
              <Route path="/carhire-request" element={<ProtectedRoute><CarHireRequest /></ProtectedRoute>} />
              <Route path="/airport-transfer-request" element={<ProtectedRoute><AirportTransferRequest /></ProtectedRoute>} />
              <Route path="/insurance-request" element={<ProtectedRoute><InsuranceRequest /></ProtectedRoute>} />
              <Route path="/visa-request" element={<ProtectedRoute><VisaRequest /></ProtectedRoute>} />
              <Route path="/travel-request/:id" element={<ProtectedRoute><TravelRequestDetail /></ProtectedRoute>} />
              <Route path="/flight-request/:id" element={<ProtectedRoute><FlightRequestDetail /></ProtectedRoute>} />
              <Route path="/carhire-request/:id" element={<ProtectedRoute><CarHireRequestDetail /></ProtectedRoute>} />
              <Route path="/airport-transfer-request/:id" element={<ProtectedRoute><AirportTransferRequestDetail /></ProtectedRoute>} />
              <Route path="/insurance-request/:id" element={<ProtectedRoute><InsuranceRequestDetail /></ProtectedRoute>} />
              <Route path="/visa-request/:id" element={<ProtectedRoute><VisaRequestDetail /></ProtectedRoute>} />
              <Route path="/quotations" element={<ProtectedRoute><Quotations /></ProtectedRoute>} />
              <Route path="/quotations/:id" element={<ProtectedRoute><QuotationDetail /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/my-travel-requests" element={<ProtectedRoute><MyTravelRequests /></ProtectedRoute>} />
              <Route path="/my-flights" element={<ProtectedRoute><MyFlightRequests /></ProtectedRoute>} />
              <Route path="/my-carhires" element={<ProtectedRoute><MyCarHireRequests /></ProtectedRoute>} />
              <Route path="/my-airport-transfers" element={<ProtectedRoute><MyAirportTransferRequests /></ProtectedRoute>} />
              <Route path="/my-insurance-requests" element={<ProtectedRoute><MyInsuranceRequests /></ProtectedRoute>} />
              <Route path="/my-visa-requests" element={<ProtectedRoute><MyVisaRequests /></ProtectedRoute>} />
              <Route path="/my-chats" element={<ProtectedRoute><MyChats /></ProtectedRoute>} />
              <Route path="/my-documents" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
              <Route path="/payment/:type/:id" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/travel-requests" element={<ProtectedRoute requiredRole="admin"><AdminTravelRequests /></ProtectedRoute>} />
              <Route path="/admin/vehicles" element={<ProtectedRoute requiredRole="admin"><AdminVehicles /></ProtectedRoute>} />
              <Route path="/admin/documents" element={<ProtectedRoute requiredRole="admin"><AdminDocuments /></ProtectedRoute>} />
              <Route path="/staff/chats" element={<ProtectedRoute><StaffChats /></ProtectedRoute>} />
              <Route path="/quotations/create" element={<ProtectedRoute><QuotationForm /></ProtectedRoute>} />
              <Route path="/admin/tour-packages" element={<ProtectedRoute requiredRole="admin"><AdminTourPackages /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;