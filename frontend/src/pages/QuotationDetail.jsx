import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { FaSpinner, FaArrowLeft, FaPrint, FaDownload, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const QuotationDetail = () => {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfContentRef = useRef();

  useEffect(() => {
    api.get(`/api/quotations/${id}`)
      .then(res => setQuotation(res.data))
      .catch(err => {
        toast.error('Failed to load quotation');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();
  const handlePDF = async () => {
    if (!pdfContentRef.current) return;
    const element = pdfContentRef.current;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Quotation_${quotation.quotation_reference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    await html2pdf().set(opt).from(element).save();
    toast.success('PDF downloaded!');
  };

  if (loading) return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-brand-red text-4xl" /></div>;
  if (!quotation) return <div className="text-center py-12">Quotation not found</div>;

  const isPaid = quotation.payment_status === 'paid';
  const isAccepted = quotation.status === 'accepted';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Toolbar – hidden when printing */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 no-print">
        <Link to="/quotations" className="btn-outline py-2 px-4 flex items-center gap-2">
          <FaArrowLeft /> Back to Quotations
        </Link>
        <div className="flex flex-wrap gap-2">
         
          <button onClick={handlePDF} className="btn-outline py-2 px-4 flex items-center gap-2">
            <FaDownload /> PDF
          </button>
          {!isPaid && (
            <Link to={`/payment/quotation/${quotation.id}`} className="btn-primary py-2 px-4 flex items-center gap-2">
              <FaMoneyBillWave /> Pay Now
            </Link>
          )}
          {isPaid && (
            <span className="text-green-600 font-bold flex items-center gap-2 px-4 py-2">
              <FaCheckCircle /> Paid
            </span>
          )}
        </div>
      </div>

      {/* Printable content */}
      <div ref={pdfContentRef} className="print-container">
        <div className="glass-card p-8">
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-3xl font-black text-brand-red">Enisco Transport Car Hire & Travels Ltd</h1>
            <p>Plot 6318 Elm Road, Woodlands, Lusaka | +260 975 074 272 | eniscogroup@gmail.com</p>
            <p className="text-sm mt-2">Quotation Details</p>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Quotation</h2>
              <p className="text-gray-500">Reference: {quotation.quotation_reference}</p>
            </div>
            <div className="text-right">
              <p><strong>Date:</strong> {new Date(quotation.created_at).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs ${quotation.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{quotation.status}</span></p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Customer</h3>
              <p><strong>Name:</strong> {quotation.customer_name}</p>
              <p><strong>Phone:</strong> {quotation.customer_phone || 'N/A'}</p>
              <p><strong>Email:</strong> {quotation.customer_email || 'N/A'}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">Request Details</h3>
              <p><strong>Title:</strong> {quotation.quote_title}</p>
              <p><strong>Type:</strong> {quotation.request_type}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Details</h3>
            <p className="whitespace-pre-wrap">{quotation.quote_details}</p>
          </div>

          <div className="border rounded-lg p-4 mb-8">
            <h3 className="font-bold mb-2">Payment Summary</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-b"><td className="py-2">Base Amount:</td><td className="text-right">ZMW {quotation.base_amount}</td></tr>
                <tr className="border-b"><td className="py-2">Service Fee:</td><td className="text-right">ZMW {quotation.service_fee}</td></tr>
                <tr><td className="py-2 font-bold">Total Amount:</td><td className="text-right font-bold">ZMW {quotation.total_amount}</td></tr>
              </tbody>
            </table>
            <p className="mt-2"><strong>Payment Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-xs ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{quotation.payment_status || 'pending'}</span></p>
            <p className="mt-2"><strong>Validity:</strong> {quotation.validity_date ? new Date(quotation.validity_date).toLocaleDateString() : 'N/A'}</p>
          </div>

          <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
            <p>This is a system-generated document. For any queries, please contact Enisco support.</p>
          </div>
        </div>
      </div>

      {/* Payment / status – hidden when printing (duplicate at bottom) */}
      <div className="mt-8 text-center no-print">
        {!isPaid && (
          <Link to={`/payment/quotation/${quotation.id}`} className="btn-primary">
            <FaMoneyBillWave className="inline mr-2" /> Pay Now
          </Link>
        )}
        {isPaid && (
          <div className="text-green-600 font-bold text-xl">
            <FaCheckCircle className="inline mr-2" /> Payment completed
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationDetail;