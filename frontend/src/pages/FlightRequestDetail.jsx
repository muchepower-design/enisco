import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaArrowLeft, FaPrint, FaDownload, FaMoneyBillWave, FaCheckCircle, FaFileAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const FlightRequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfContentRef = useRef();

  useEffect(() => {
    api.get(`/api/flight/request/${id}`)
      .then(res => setRequest(res.data))
      .catch(err => toast.error('Failed to load flight details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();
  const handlePDF = async () => {
    if (!pdfContentRef.current) return;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `FlightRequest_${request.request_reference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(pdfContentRef.current).save();
    toast.success('PDF downloaded!');
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${base}/${filePath}`;
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  if (!request) return <div className="text-center py-12">Flight request not found</div>;

  const hasDocuments = !!request.passport_file || !!request.visa_file;
  const isPaid = request.payment_status === 'paid';

  // Helper to format date
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-between items-center mb-6 no-print">
        <Link to="/my-flights" className="btn-outline py-2 px-4 flex items-center gap-2">
          <FaArrowLeft /> Back to My Flights
        </Link>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-outline py-2 px-4"><FaPrint /> Print</button>
          <button onClick={handlePDF} className="btn-outline py-2 px-4"><FaDownload /> PDF</button>
        </div>
      </div>

      <div ref={pdfContentRef} className="print-container">
        <div className="glass-card p-8">
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-black text-brand-red">Flight Booking Request</h1>
            <p>Reference: {request.request_reference}</p>
          </div>

          {/* Trip Type & Flight Type */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold mb-2">Trip Details</h3>
            <div className="grid md:grid-cols-2 gap-2">
              <p><strong>Trip Type:</strong> {request.trip_type ? request.trip_type.replace('_', ' ').toUpperCase() : 'N/A'}</p>
              <p><strong>Flight Type:</strong> {request.flight_type ? request.flight_type.toUpperCase() : 'N/A'}</p>
            </div>
          </div>

          {/* Passenger Details - conditional */}
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold mb-2">Passenger Details</h3>
            <p><strong>Full Name:</strong> {request.full_name}</p>
            {/* Show passport fields only if they exist (typically for international) */}
            {request.passport_number && (
              <>
                <p><strong>Passport Number:</strong> {request.passport_number}</p>
                {request.passport_expiry && <p><strong>Passport Expiry:</strong> {formatDate(request.passport_expiry)}</p>}
              </>
            )}
            {request.nationality && <p><strong>Nationality:</strong> {request.nationality}</p>}
            {request.date_of_birth && <p><strong>Date of Birth:</strong> {formatDate(request.date_of_birth)}</p>}
            {request.gender && <p><strong>Gender:</strong> {request.gender}</p>}
          </div>

          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold mb-2">Contact</h3>
            <p><strong>Phone:</strong> {request.phone}</p>
            <p><strong>Email:</strong> {request.email}</p>
            <p><strong>Address:</strong> {request.address || 'N/A'}</p>
          </div>

          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold mb-2">Flight Details</h3>
            <p><strong>Airline:</strong> {request.airline_name || request.airline_id || 'N/A'}</p>
            <p><strong>Travel Class:</strong> {request.travel_class}</p>
            <p><strong>Passengers:</strong> {request.passengers}</p>

            {/* Main route */}
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p><strong>Origin:</strong> {request.origin}</p>
              <p><strong>Destination:</strong> {request.destination}</p>
              <p><strong>Outbound Date:</strong> {formatDate(request.travel_date)}</p>
              {request.return_date && <p><strong>Return Date:</strong> {formatDate(request.return_date)}</p>}
            </div>

            {/* Multi-city segments */}
            {request.trip_type === 'multi_city' && request.segments && request.segments.length > 0 && (
              <div className="mt-2">
                <p className="font-bold">Additional Segments:</p>
                {request.segments.map((seg, idx) => (
                  <div key={idx} className="ml-4 p-1 text-sm border-b">
                    {idx+1}. {seg.origin} → {seg.destination} ({formatDate(seg.travel_date)})
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold mb-2">Additional Options</h3>
            <p><strong>Meal:</strong> {request.meal_preference || 'Standard'}</p>
            <p><strong>Seat:</strong> {request.seat_preference || 'No preference'}</p>
            <p><strong>Assistance:</strong> {request.special_assistance || 'None'}</p>
          </div>

          {/* Documents Section */}
          {hasDocuments && (
            <div className="border rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">Uploaded Documents</h3>
              <div className="space-y-2">
                {request.passport_file && (
                  <div><FaFileAlt className="inline mr-2" /> <a href={getFileUrl(request.passport_file)} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">Passport Copy</a></div>
                )}
                {request.visa_file && (
                  <div><FaFileAlt className="inline mr-2" /> <a href={getFileUrl(request.visa_file)} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">Visa Copy</a></div>
                )}
              </div>
            </div>
          )}

          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold mb-2">Payment Summary</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b"><td className="py-2">Base Fare:</td><td className="text-right">ZMW {request.base_amount}</td></tr>
                <tr className="border-b"><td className="py-2">Service Fee:</td><td className="text-right">ZMW {request.service_fee}</td></tr>
                <tr><td className="py-2 font-bold">Total:</td><td className="text-right font-bold">ZMW {request.total_amount}</td></tr>
              </tbody>
            </table>
            <p className="mt-2"><strong>Payment Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{request.payment_status || 'pending'}</span></p>
          </div>

          {request.notes && (
            <div className="border rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">Notes</h3>
              <p>{request.notes}</p>
            </div>
          )}
        </div>
      </div>

      {!isPaid && (
        <div className="mt-6 text-center no-print">
          <Link to={`/payment/flight/${request.id}`} className="btn-primary">
            <FaMoneyBillWave className="inline mr-2" /> Pay Now
          </Link>
        </div>
      )}
      {isPaid && <div className="mt-6 text-center text-green-600 font-bold"><FaCheckCircle className="inline mr-2" /> Payment completed</div>}
    </div>
  );
};

export default FlightRequestDetail;