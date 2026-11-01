import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaArrowLeft, FaPrint, FaDownload, FaMoneyBillWave, FaCheckCircle, FaFileAlt, FaUsers, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const CarHireRequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfContentRef = useRef();

  useEffect(() => {
    api.get(`/api/carhire/request/${id}`)
      .then(res => setRequest(res.data))
      .catch(err => toast.error('Failed to load car hire details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();
  const handlePDF = async () => {
    if (!pdfContentRef.current) return;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `CarHire_${request.request_reference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(pdfContentRef.current).save();
    toast.success('PDF downloaded!');
  };

  // Helper to get full file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${base}/${filePath}`;
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  if (!request) return <div className="text-center py-12">Car hire request not found</div>;

  // Safe document check
  const hasDocuments = !!request.driver_license_file || !!request.id_document_file || !!request.nrc_copy_file;

  const isPaid = request.payment_status === 'paid';

  // Parse emergency contacts (ensure it's an array)
  const emergencyContacts = Array.isArray(request.emergency_contacts)
    ? request.emergency_contacts
    : (request.emergency_contacts ? JSON.parse(request.emergency_contacts) : []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-between items-center mb-6 no-print">
        <Link to="/my-carhires" className="btn-outline py-2 px-4 flex items-center gap-2">
          <FaArrowLeft /> Back to My Car Hire Requests
        </Link>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-outline py-2 px-4"><FaPrint /> Print</button>
          <button onClick={handlePDF} className="btn-outline py-2 px-4"><FaDownload /> PDF</button>
        </div>
      </div>

      <div ref={pdfContentRef} className="print-container">
        <div className="glass-card p-8">
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-black text-brand-red">Car Hire Request</h1>
            <p>Reference: {request.request_reference}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Personal Details</h3>
              <p><strong>Name:</strong> {request.full_name}</p>
              <p><strong>Phone:</strong> {request.phone}</p>
              <p><strong>Email:</strong> {request.email}</p>
              <p><strong>Physical Address:</strong> {request.physical_address || 'N/A'}</p>
              <p><strong>ID Type:</strong> {request.id_type}</p>
              <p><strong>ID Number:</strong> {request.id_number}</p>
              <p><strong>Nationality:</strong> {request.nationality || 'N/A'}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Driver License</h3>
              <p><strong>Number:</strong> {request.driver_license_number}</p>
              <p><strong>Expiry:</strong> {new Date(request.driver_license_expiry).toLocaleDateString()}</p>
              <hr className="my-2" />
              <h3 className="font-bold mb-2">Employment</h3>
              <p><strong>Status:</strong> {request.employment_status === 'employed' ? 'Employed' : 'Unemployed / Self-employed'}</p>
              {request.employment_status === 'employed' && (
                <p><strong>Employer:</strong> {request.employer_name || 'N/A'}</p>
              )}
              {request.employment_status === 'unemployed' && (
                <p><strong>Business/Occupation:</strong> {request.business_occupation || 'N/A'}</p>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4 mt-4">
            <h3 className="font-bold mb-2">Rental Details</h3>
            <p><strong>Pickup:</strong> {request.pickup_location}</p>
            <p><strong>Drop-off:</strong> {request.dropoff_location || 'Same as pickup'}</p>
            <p><strong>Pickup Date:</strong> {new Date(request.pickup_date).toLocaleDateString()} at {request.pickup_time || 'N/A'}</p>
            <p><strong>Drop-off Date:</strong> {request.dropoff_date ? new Date(request.dropoff_date).toLocaleDateString() : 'N/A'} at {request.dropoff_time || 'N/A'}</p>
            <p><strong>Duration:</strong> {request.rental_duration_days ? `${request.rental_duration_days} days` : 'N/A'}</p>
          </div>

          {/* Travel Area */}
          <div className="border rounded-lg p-4 mt-4">
            <h3 className="font-bold mb-2"><FaMapMarkerAlt className="inline mr-2" /> Travel Area</h3>
            <p><strong>Area:</strong> {request.travel_area === 'within_lusaka' ? 'Within Lusaka' : 'Outside Lusaka'}</p>
            {request.travel_area === 'outside_lusaka' && (
              <p><strong>Town/Destination:</strong> {request.travel_town || 'N/A'}</p>
            )}
          </div>

          {/* Emergency Contacts */}
          {emergencyContacts.length > 0 && (
            <div className="border rounded-lg p-4 mt-4">
              <h3 className="font-bold mb-2"><FaUsers className="inline mr-2" /> Emergency Contacts</h3>
              {emergencyContacts.map((contact, idx) => (
                <div key={idx} className="border-b last:border-0 py-2">
                  <p><strong>Name:</strong> {contact.full_name}</p>
                  <p><strong>Tel:</strong> {contact.tel || 'N/A'}</p>
                  <p><strong>Cell:</strong> {contact.cell}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border rounded-lg p-4 mt-4">
            <h3 className="font-bold mb-2">Vehicle Preferences</h3>
            <p><strong>Type:</strong> {request.vehicle_type || 'Any'}</p>
            <p><strong>Model:</strong> {request.preferred_model || 'Any'}</p>
            <p><strong>Transmission:</strong> {request.transmission || 'Any'}</p>
            <p><strong>Fuel Policy:</strong> {request.fuel_policy || 'N/A'}</p>
            <p><strong>Additional Drivers:</strong> {request.additional_drivers || 0}</p>
            <p><strong>Child Seat:</strong> {request.child_seat ? 'Yes' : 'No'}</p>
            <p><strong>GPS Navigation:</strong> {request.gps_navigation ? 'Yes' : 'No'}</p>
          </div>

          {/* Documents Section */}
          {hasDocuments && (
            <div className="border rounded-lg p-4 mt-4">
              <h3 className="font-bold mb-2">Uploaded Documents</h3>
              <div className="space-y-2">
                {request.driver_license_file && (
                  <div><FaFileAlt className="inline mr-2" /> <a href={getFileUrl(request.driver_license_file)} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">Driver License Copy</a></div>
                )}
                {request.id_document_file && (
                  <div><FaFileAlt className="inline mr-2" /> <a href={getFileUrl(request.id_document_file)} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">ID Document (NRC/Passport)</a></div>
                )}
                {!request.id_document_file && request.nrc_copy_file && (
                  <div><FaFileAlt className="inline mr-2" /> <a href={getFileUrl(request.nrc_copy_file)} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">NRC/Passport Copy</a></div>
                )}
              </div>
            </div>
          )}

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
          <Link to={`/payment/carhire/${request.id}`} className="btn-primary">
            <FaMoneyBillWave className="inline mr-2" /> Pay Now
          </Link>
        </div>
      )}
      {isPaid && <div className="mt-6 text-center text-green-600 font-bold"><FaCheckCircle className="inline mr-2" /> Payment completed</div>}
    </div>
  );
};

export default CarHireRequestDetail;