import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaArrowLeft, FaPrint, FaDownload, FaMoneyBillWave, FaCheckCircle, FaFileAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const InsuranceRequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfContentRef = useRef();

  useEffect(() => {
    api.get(`/api/insurance/request/${id}`)
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
      filename: `InsuranceRequest_${request.request_reference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(element).save();
    toast.success('PDF downloaded successfully!');
  };

  // Helper to get full file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${base}/${filePath}`;
  };

  // Helper for insurance type display name
  const getInsuranceTypeLabel = (type) => {
    const map = {
      'motor_vehicle': 'Motor Vehicle',
      'motorcycle': 'Motorcycle',
      'property': 'Property',
      'life': 'Life',
      'health': 'Health / Medical',
      'travel': 'Travel',
      'public_liability': 'Public Liability',
      'other': 'Other'
    };
    return map[type] || type;
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  if (!request) return <div className="text-center py-12">Request not found</div>;

  const hasDocuments = !!request.white_book_file || !!request.road_tax_disc_file;
  const isMotorType = ['motor_vehicle', 'motorcycle'].includes(request.insurance_type);
  const isPropertyType = request.insurance_type === 'property';
  const isLifeHealthType = ['life', 'health'].includes(request.insurance_type);
  const isTravelType = request.insurance_type === 'travel';
  const isPublicLiabilityType = request.insurance_type === 'public_liability';
  const isOtherType = request.insurance_type === 'other';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-between items-center mb-6 no-print">
        <Link to="/my-insurance-requests" className="btn-outline py-2 px-4 flex items-center gap-2">
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
            <p className="text-sm mt-2">Insurance Request Details</p>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Insurance Request</h2>
              <p className="text-gray-500">Reference: {request.request_reference}</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs ${request.request_status === 'active_cover' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{request.request_status}</span></p>
            </div>
          </div>

          {/* Client Information - removed date_of_birth */}
          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Client Information</h3>
            <div className="grid md:grid-cols-2 gap-2">
              <p><strong>Name:</strong> {request.buyer_name}</p>
              <p><strong>Phone:</strong> {request.phone}</p>
              <p><strong>Email:</strong> {request.email || 'N/A'}</p>
              <p><strong>Address:</strong> {request.address || 'N/A'}</p>
              <p><strong>NRC/Passport:</strong> {request.nrc_passport || 'N/A'}</p>
              {/* Date of Birth removed */}
            </div>
          </div>

          {/* Insurance Type */}
          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Insurance Type</h3>
            <p><strong>Type:</strong> {getInsuranceTypeLabel(request.insurance_type)}</p>
            {request.other_insurance_type && <p><strong>Other Type:</strong> {request.other_insurance_type}</p>}
          </div>

          {/* Motor Details */}
          {isMotorType && (
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-bold mb-2">{request.insurance_type === 'motorcycle' ? 'Motorcycle' : 'Vehicle'} Details</h3>
              <div className="grid md:grid-cols-2 gap-2">
                <p><strong>Type:</strong> {request.vehicle_type || 'N/A'}</p>
                <p><strong>Make & Model:</strong> {request.vehicle_make_model || 'N/A'}</p>
                <p><strong>Registration:</strong> {request.number_plate || 'N/A'}</p>
                <p><strong>Chasis:</strong> {request.chasis_number || 'N/A'}</p>
                <p><strong>Engine:</strong> {request.engine_number || 'N/A'}</p>
                <p><strong>Color:</strong> {request.vehicle_color || 'N/A'}</p>
                <p><strong>Value:</strong> ZMW {request.vehicle_value || 0}</p>
                <p><strong>Year:</strong> {request.year_of_manufacture || 'N/A'}</p>
                {request.motorcycle_type && <p><strong>Motorcycle Type:</strong> {request.motorcycle_type}</p>}
                {/* White Book Name */}
                {request.white_name && <p><strong>Name on White Book:</strong> {request.white_name}</p>}
              </div>
            </div>
          )}

          {/* Property Details */}
          {isPropertyType && (
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-bold mb-2">Property Details</h3>
              <div className="grid md:grid-cols-2 gap-2">
                <p><strong>Address:</strong> {request.property_address || 'N/A'}</p>
                <p><strong>Type:</strong> {request.property_type || 'N/A'}</p>
                <p><strong>Value:</strong> ZMW {request.property_value || 0}</p>
                <p><strong>Size:</strong> {request.property_size || 'N/A'} sqm</p>
              </div>
            </div>
          )}

          {/* Life / Health Details */}
          {isLifeHealthType && (
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-bold mb-2">{request.insurance_type === 'life' ? 'Life' : 'Health'} Insurance Details</h3>
              <div className="grid md:grid-cols-2 gap-2">
                <p><strong>Occupation:</strong> {request.occupation || 'N/A'}</p>
                <p><strong>Employer:</strong> {request.employer || 'N/A'}</p>
                <p><strong>Monthly Income:</strong> ZMW {request.monthly_income || 0}</p>
                <p><strong>Existing Conditions:</strong> {request.existing_conditions || 'None'}</p>
                <p><strong>Smoker:</strong> {request.smoker ? 'Yes' : 'No'}</p>
                <p><strong>Alcohol Consumption:</strong> {request.alcohol_consumption ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}

          {/* Travel Details */}
          {isTravelType && (
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-bold mb-2">Travel Insurance Details</h3>
              <div className="grid md:grid-cols-2 gap-2">
                <p><strong>Destination:</strong> {request.destination_country || 'N/A'}</p>
                <p><strong>Purpose:</strong> {request.purpose_of_travel || 'N/A'}</p>
                <p><strong>Start Date:</strong> {request.travel_start_date ? new Date(request.travel_start_date).toLocaleDateString() : 'N/A'}</p>
                <p><strong>End Date:</strong> {request.travel_end_date ? new Date(request.travel_end_date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Public Liability Details - NEW */}
          {isPublicLiabilityType && (
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-bold mb-2">Public Liability Insurance Details</h3>
              <div className="grid md:grid-cols-2 gap-2">
                <p><strong>Business Name:</strong> {request.business_name || 'N/A'}</p>
                <p><strong>Business Type:</strong> {request.business_type || 'N/A'}</p>
                <p><strong>Premises Address:</strong> {request.premises_address || 'N/A'}</p>
                <p><strong>Estimated Annual Turnover:</strong> ZMW {request.estimated_turnover || 0}</p>
                <p><strong>Coverage Amount Required:</strong> ZMW {request.coverage_amount || 0}</p>
                {request.public_liability_notes && (
                  <div className="md:col-span-2">
                    <strong>Additional Notes:</strong> {request.public_liability_notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Type – show notes */}
          {isOtherType && (
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-bold mb-2">Other Insurance</h3>
              <p><strong>Details:</strong> {request.notes || 'No additional details provided.'}</p>
            </div>
          )}

          {/* Cover Details */}
          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Cover Details</h3>
            <div className="grid md:grid-cols-2 gap-2">
              <p><strong>Insurance Type:</strong> <span className="capitalize">{getInsuranceTypeLabel(request.insurance_type)}</span></p>
              <p><strong>Insurance Company:</strong> {request.insurance_company_name || request.insurance_company_id || 'N/A'}</p>
              <p><strong>Start Date:</strong> {new Date(request.start_date).toLocaleDateString()}</p>
              <p><strong>Quarters:</strong> {request.quarters} ({request.cover_days} days)</p>
              <p><strong>Expiry Date:</strong> {new Date(request.expiry_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Documents */}
          {hasDocuments && (
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-bold mb-2">Uploaded Documents</h3>
              <div className="space-y-2">
                {request.white_book_file && (
                  <div><FaFileAlt className="inline mr-2" /> <a href={getFileUrl(request.white_book_file)} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">White Book (Logbook)</a></div>
                )}
                {request.road_tax_disc_file && (
                  <div><FaFileAlt className="inline mr-2" /> <a href={getFileUrl(request.road_tax_disc_file)} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">Road Tax Disc</a></div>
                )}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Payment Summary</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b"><td className="py-2">Base Premium:</td><td className="text-right">ZMW {request.base_premium}</td></tr>
                <tr className="border-b"><td className="py-2">Service Fee (5%):</td><td className="text-right">ZMW {request.service_fee}</td></tr>
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
          <Link to={`/payment/insurance/${request.id}`} className="btn-primary">Pay Now</Link>
        </div>
      )}
    </div>
  );
};

export default InsuranceRequestDetail;