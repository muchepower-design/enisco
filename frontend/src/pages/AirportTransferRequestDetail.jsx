import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaArrowLeft, FaPrint, FaDownload, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const AirportTransferRequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfContentRef = useRef();

  useEffect(() => {
    api.get(`/api/airporttransfer/request/${id}`)
      .then(res => setRequest(res.data))
      .catch(err => toast.error('Failed to load transfer details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();
  const handlePDF = async () => {
    if (!pdfContentRef.current) return;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Transfer_${request.request_reference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(pdfContentRef.current).save();
    toast.success('PDF downloaded!');
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  if (!request) return <div className="text-center py-12">Transfer request not found</div>;

  const isPaid = request.payment_status === 'paid';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-between items-center mb-6 no-print">
        <Link to="/my-airport-transfers" className="btn-outline py-2 px-4 flex items-center gap-2">
          <FaArrowLeft /> Back to My Transfers
        </Link>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-outline py-2 px-4"><FaPrint /> Print</button>
          <button onClick={handlePDF} className="btn-outline py-2 px-4"><FaDownload /> PDF</button>
        </div>
      </div>

      <div ref={pdfContentRef} className="print-container">
        <div className="glass-card p-8">
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-black text-brand-red">Airport Transfer Request</h1>
            <p>Reference: {request.request_reference}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Personal Details</h3>
              <p><strong>Name:</strong> {request.full_name}</p>
              <p><strong>Phone:</strong> {request.phone}</p>
              <p><strong>Email:</strong> {request.email}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Flight Details</h3>
              <p><strong>Flight:</strong> {request.flight_number}</p>
              <p><strong>Airline:</strong> {request.airline || 'N/A'}</p>
              <p><strong>Arrival:</strong> {request.arrival_time ? new Date(request.arrival_time).toLocaleString() : 'N/A'}</p>
              <p><strong>Departure:</strong> {request.departure_time ? new Date(request.departure_time).toLocaleString() : 'N/A'}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 mt-4">
            <h3 className="font-bold mb-2">Transfer Details</h3>
            <p><strong>Type:</strong> {request.transfer_type === 'pickup' ? 'From Airport to Destination' : 'From Pickup to Airport'}</p>
            <p><strong>Pickup:</strong> {request.pickup_location}</p>
            <p><strong>Drop-off:</strong> {request.dropoff_location}</p>
            <p><strong>Pickup Date:</strong> {new Date(request.pickup_date).toLocaleDateString()} at {request.pickup_time || 'N/A'}</p>
            <p><strong>Passengers:</strong> {request.passengers}</p>
            <p><strong>Luggage:</strong> {request.luggage_count} pieces</p>
          </div>

          <div className="border rounded-lg p-4 mt-4">
            <h3 className="font-bold mb-2">Vehicle Preference</h3>
            <p><strong>Vehicle Type:</strong> {request.vehicle_type || 'Any'}</p>
            <p><strong>Special Requests:</strong> {request.special_requests || 'None'}</p>
          </div>

          <div className="border rounded-lg p-4 mt-4">
            <h3 className="font-bold mb-2">Payment Summary</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b"><td className="py-2">Base Amount:</td><td className="text-right">ZMW {request.base_amount}</td></tr>
                <tr className="border-b"><td className="py-2">Service Fee:</td><td className="text-right">ZMW {request.service_fee}</td></tr>
                <tr><td className="py-2 font-bold">Total:</td><td className="text-right font-bold">ZMW {request.total_amount}</td></tr>
              </tbody>
            </table>
            <p className="mt-2"><strong>Payment Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{request.payment_status || 'pending'}</span></p>
          </div>

          {request.notes && (
            <div className="border rounded-lg p-4 mt-4">
              <h3 className="font-bold mb-2">Notes</h3>
              <p>{request.notes}</p>
            </div>
          )}
        </div>
      </div>

      {!isPaid && (
        <div className="mt-6 text-center no-print">
          <Link to={`/payment/airporttransfer/${request.id}`} className="btn-primary">
            <FaMoneyBillWave className="inline mr-2" /> Pay Now
          </Link>
        </div>
      )}
      {isPaid && <div className="mt-6 text-center text-green-600 font-bold"><FaCheckCircle className="inline mr-2" /> Payment completed</div>}
    </div>
  );
};

export default AirportTransferRequestDetail;