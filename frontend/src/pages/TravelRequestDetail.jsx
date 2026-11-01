import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaArrowLeft, FaPrint, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const TravelRequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfContentRef = useRef();

  useEffect(() => {
    api.get(`/api/travel/request/${id}`)
      .then(res => setRequest(res.data))
      .catch(err => toast.error('Failed to load request details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handlePDF = async () => {
    if (!pdfContentRef.current) return;
    const element = pdfContentRef.current;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `TravelRequest_${request.request_reference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(element).save();
    toast.success('PDF downloaded successfully!');
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  if (!request) return <div className="text-center py-12">Request not found</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Action Buttons - hidden when printing */}
      <div className="flex justify-between items-center mb-6 no-print">
        <Link to="/my-travel-requests" className="btn-outline py-2 px-4 flex items-center gap-2">
          <FaArrowLeft /> Back to My Requests
        </Link>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-outline py-2 px-4 flex items-center gap-2">
            <FaPrint /> Print
          </button>
          <button onClick={handlePDF} className="btn-outline py-2 px-4 flex items-center gap-2">
            <FaDownload /> Download PDF
          </button>
        </div>
      </div>

      {/* PDF/Print Container */}
      <div ref={pdfContentRef} className="print-container">
        <div className="glass-card p-8">
          {/* Company Header */}
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-black text-brand-red">Enisco Transport Car Hire & Travels Ltd</h1>
            <p>Plot 6318 Elm Road, Woodlands, Lusaka | +260 975 074 272 | eniscogroup@gmail.com</p>
            <p className="text-sm mt-2">Travel Request Details</p>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Travel Request</h2>
              <p className="text-gray-500">Reference: {request.request_reference}</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs ${request.request_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{request.request_status}</span></p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Customer Information</h3>
              <p><strong>Name:</strong> {request.full_name}</p>
              <p><strong>Phone:</strong> {request.phone}</p>
              <p><strong>Email:</strong> {request.email || 'N/A'}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Service Details</h3>
              <p><strong>Service Type:</strong> <span className="capitalize">{request.service_type?.replace('_', ' ')}</span></p>
              <p><strong>Action Type:</strong> <span className="capitalize">{request.action_type}</span></p>
              <p><strong>Passengers:</strong> {request.passengers || 1}</p>
              <p><strong>Preferred Vehicle:</strong> {request.preferred_vehicle || 'N/A'}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Journey Details</h3>
            <p><strong>Pickup Location:</strong> {request.pickup_location || 'N/A'}</p>
            <p><strong>Destination:</strong> {request.destination || 'N/A'}</p>
            <p><strong>Travel Date:</strong> {request.travel_date ? new Date(request.travel_date).toLocaleDateString() : 'N/A'}</p>
          </div>

          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Payment Summary</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b"><td className="py-2">Base Amount:</td><td className="text-right">ZMW {request.base_amount}</td></tr>
                <tr className="border-b"><td className="py-2">Service Fee ({request.service_type === 'flight_ticketing' ? '10%' : '0%'}):</td><td className="text-right">ZMW {request.service_fee}</td></tr>
                <tr><td className="py-2 font-bold">Total Amount:</td><td className="text-right font-bold">ZMW {request.total_amount}</td></tr>
              </tbody>
            </table>
            <p className="mt-2"><strong>Payment Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs ${request.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{request.payment_status}</span></p>
          </div>

          {request.notes && (
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-bold mb-2">Notes</h3>
              <p>{request.notes}</p>
            </div>
          )}

          <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
            <p>This is a system-generated document. For any queries, please contact Enisco support.</p>
          </div>
        </div>
      </div>

      {/* Payment Button - visible only if not paid */}
      {request.payment_status !== 'paid' && request.total_amount > 0 && (
        <div className="mt-8 text-center no-print">
          <Link to={`/payment/travel/${request.id}`} className="btn-primary">Pay Now</Link>
        </div>
      )}
    </div>
  );
};

export default TravelRequestDetail;