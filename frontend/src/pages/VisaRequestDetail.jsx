import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaArrowLeft, FaPrint, FaDownload, FaFileAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const VisaRequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfContentRef = useRef();

  useEffect(() => {
    api.get(`/api/visa/request/${id}`)
      .then(res => setRequest(res.data))
      .catch(err => toast.error('Failed to load request details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  const handlePDF = async () => {
    if (!pdfContentRef.current) return;
    const element = pdfContentRef.current;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `VisaRequest_${request.request_reference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(element).save();
    toast.success('PDF downloaded successfully!');
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  if (!request) return <div className="text-center py-12">Request not found</div>;

  // Helper to get full file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    // If path already starts with http, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    // Prepend backend base URL
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${base}/${filePath}`;
  };

  const hasDocuments = request.passport_photo_file || request.invitation_letter_file || request.proof_of_accommodation_file;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-between items-center mb-6 no-print">
        <Link to="/my-visa-requests" className="btn-outline py-2 px-4 flex items-center gap-2">
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

      <div ref={pdfContentRef} className="print-container">
        <div className="glass-card p-8">
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-black text-brand-red">Enisco Transport Car Hire & Travels Ltd</h1>
            <p>Plot 6318 Elm Road, Woodlands, Lusaka | +260 975 074 272 | eniscogroup@gmail.com</p>
            <p className="text-sm mt-2">Visa Assistance Request Details</p>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Visa Assistance Request</h2>
              <p className="text-gray-500">Reference: {request.request_reference}</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">{request.request_status}</span></p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Applicant Information</h3>
              <p><strong>Name:</strong> {request.applicant_name}</p>
              <p><strong>Date of Birth:</strong> {request.date_of_birth ? new Date(request.date_of_birth).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Place of Birth:</strong> {request.place_of_birth || 'N/A'}</p>
              <p><strong>Gender:</strong> {request.gender}</p>
              <p><strong>Nationality:</strong> {request.nationality}</p>
              <p><strong>Country of Residence:</strong> {request.country_of_residence}</p>
              <p><strong>Marital Status:</strong> {request.marital_status || 'N/A'}</p>
              <p><strong>Phone:</strong> {request.phone}</p>
              <p><strong>Email:</strong> {request.email}</p>
              <p><strong>Address:</strong> {request.address || 'N/A'}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Passport Details</h3>
              <p><strong>Passport Number:</strong> {request.passport_number}</p>
              <p><strong>Issue Date:</strong> {request.passport_issue_date ? new Date(request.passport_issue_date).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Expiry Date:</strong> {request.passport_expiry_date ? new Date(request.passport_expiry_date).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Issuing Authority:</strong> {request.passport_issuing_authority || 'N/A'}</p>
            </div>
          </div>

          {/* Travel Details */}
          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Travel Details</h3>
            <p><strong>Destination:</strong> {request.destination_country}</p>
            <p><strong>Visa Type:</strong> <span className="capitalize">{request.visa_type}</span></p>
            <p><strong>Purpose:</strong> {request.purpose_of_visit || 'N/A'}</p>
            <p><strong>Intended Arrival:</strong> {request.intended_arrival_date ? new Date(request.intended_arrival_date).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Intended Departure:</strong> {request.intended_departure_date ? new Date(request.intended_departure_date).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Duration (days):</strong> {request.duration_of_stay_days || 'N/A'}</p>
            <p><strong>Previous visits:</strong> {request.previous_visits_to_country ? 'Yes' : 'No'}</p>
            {request.previous_visits_to_country && <p><strong>Previous Visit Details:</strong> {request.previous_visit_details || 'N/A'}</p>}
          </div>

          {/* Employment / Education */}
          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Employment / Education</h3>
            <p><strong>Occupation:</strong> {request.occupation || 'N/A'}</p>
            <p><strong>Employer/School:</strong> {request.employer_name || 'N/A'}</p>
            <p><strong>Employer Address:</strong> {request.employer_address || 'N/A'}</p>
            <p><strong>Employer Phone:</strong> {request.employer_phone || 'N/A'}</p>
            <p><strong>Monthly Income:</strong> {request.monthly_income ? `ZMW ${request.monthly_income}` : 'N/A'}</p>
            <p><strong>Education Level:</strong> {request.education_level || 'N/A'}</p>
          </div>

          {/* Additional Information */}
          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Additional Information</h3>
            <p><strong>Accommodation:</strong> {request.accommodation_in_destination || 'N/A'}</p>
            <p><strong>Contact Person:</strong> {request.contact_person_in_destination || 'N/A'}</p>
            <p><strong>Contact Phone:</strong> {request.contact_phone_in_destination || 'N/A'}</p>
            <p><strong>Health Insurance:</strong> {request.health_insurance_policy || 'N/A'}</p>
            <p><strong>Criminal Record:</strong> {request.criminal_record_disclosure || 'N/A'}</p>
            <p><strong>Special Requests:</strong> {request.special_requests || 'N/A'}</p>
          </div>

          {/* Documents */}
          {hasDocuments && (
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-bold mb-2">Uploaded Documents</h3>
              <div className="space-y-2">
                {request.passport_photo_file && (
                  <div><FaFileAlt className="inline mr-2" /> <a href={getFileUrl(request.passport_photo_file)} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">Passport Photo</a></div>
                )}
                {request.invitation_letter_file && (
                  <div><FaFileAlt className="inline mr-2" /> <a href={getFileUrl(request.invitation_letter_file)} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">Invitation Letter</a></div>
                )}
                {request.proof_of_accommodation_file && (
                  <div><FaFileAlt className="inline mr-2" /> <a href={getFileUrl(request.proof_of_accommodation_file)} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">Proof of Accommodation</a></div>
                )}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Payment Summary</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b"><td className="py-2">Visa Fee (Embassy):</td><td className="text-right">ZMW {request.base_fee}</td></tr>
                <tr className="border-b"><td className="py-2">Service Fee (10%):</td><td className="text-right">ZMW {request.service_fee}</td></tr>
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

      {request.payment_status !== 'paid' && request.total_amount > 0 && (
        <div className="mt-8 text-center no-print">
          <Link to={`/payment/visa/${request.id}`} className="btn-primary">Pay Now</Link>
        </div>
      )}
    </div>
  );
};

export default VisaRequestDetail;