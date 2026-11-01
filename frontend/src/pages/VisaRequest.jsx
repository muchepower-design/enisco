import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const VisaRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({
    passport_photo: null,
    invitation_letter: null,
    proof_accommodation: null
  });

  const [formData, setFormData] = useState({
    applicant_name: '',
    date_of_birth: '',
    place_of_birth: '',
    gender: 'male',
    nationality: '',
    country_of_residence: '',
    marital_status: 'single',
    phone: '',
    email: '',
    address: '',
    passport_number: '',
    passport_issue_date: '',
    passport_expiry_date: '',
    passport_issuing_authority: '',
    destination_country: '',
    visa_type: 'tourist',
    purpose_of_visit: '',
    intended_arrival_date: '',
    intended_departure_date: '',
    duration_of_stay_days: '',
    previous_visits_to_country: false,
    previous_visit_details: '',
    occupation: '',
    employer_name: '',
    employer_address: '',
    employer_phone: '',
    monthly_income: '',
    education_level: '',
    accommodation_in_destination: '',
    contact_person_in_destination: '',
    contact_phone_in_destination: '',
    health_insurance_policy: '',
    criminal_record_disclosure: '',
    special_requests: '',
    base_fee: 0,
    notes: ''
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      email: formData.email || null,
      date_of_birth: new Date(formData.date_of_birth).toISOString(),
      passport_issue_date: new Date(formData.passport_issue_date).toISOString(),
      passport_expiry_date: new Date(formData.passport_expiry_date).toISOString(),
      intended_arrival_date: formData.intended_arrival_date ? new Date(formData.intended_arrival_date).toISOString() : null,
      intended_departure_date: formData.intended_departure_date ? new Date(formData.intended_departure_date).toISOString() : null,
      base_fee: parseFloat(formData.base_fee) || 0,
      notes: formData.notes || null,
    };

    try {
      const formDataObj = new FormData();
      formDataObj.append('data', JSON.stringify(payload));
      if (files.passport_photo) formDataObj.append('passport_photo', files.passport_photo);
      if (files.invitation_letter) formDataObj.append('invitation_letter', files.invitation_letter);
      if (files.proof_accommodation) formDataObj.append('proof_of_accommodation', files.proof_accommodation);

      const res = await api.post('/api/visa/request', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Visa assistance request submitted!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-black mb-6">Visa Assistance Request</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Details */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Personal Details</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Full Name *</label><input type="text" required className="w-full p-2 border rounded" value={formData.applicant_name} onChange={e => setFormData({...formData, applicant_name: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Date of Birth *</label><input type="date" required className="w-full p-2 border rounded" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Place of Birth</label><input type="text" className="w-full p-2 border rounded" value={formData.place_of_birth} onChange={e => setFormData({...formData, place_of_birth: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Gender *</label>
                <select className="w-full p-2 border rounded" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <div><label className="block font-bold mb-1">Nationality *</label><input type="text" required className="w-full p-2 border rounded" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Country of Residence *</label><input type="text" required className="w-full p-2 border rounded" value={formData.country_of_residence} onChange={e => setFormData({...formData, country_of_residence: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Marital Status</label>
                <select className="w-full p-2 border rounded" value={formData.marital_status} onChange={e => setFormData({...formData, marital_status: e.target.value})}>
                  <option value="single">Single</option><option value="married">Married</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Contact Details */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Contact Information</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Phone *</label><input type="tel" required className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Email *</label><input type="email" required className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block font-bold mb-1">Residential Address</label><input type="text" className="w-full p-2 border rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            </div>
          </fieldset>

          {/* Passport Details */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Passport Details</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Passport Number *</label><input type="text" required className="w-full p-2 border rounded" value={formData.passport_number} onChange={e => setFormData({...formData, passport_number: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Issue Date *</label><input type="date" required className="w-full p-2 border rounded" value={formData.passport_issue_date} onChange={e => setFormData({...formData, passport_issue_date: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Expiry Date *</label><input type="date" required className="w-full p-2 border rounded" value={formData.passport_expiry_date} onChange={e => setFormData({...formData, passport_expiry_date: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Issuing Authority</label><input type="text" className="w-full p-2 border rounded" value={formData.passport_issuing_authority} onChange={e => setFormData({...formData, passport_issuing_authority: e.target.value})} /></div>
            </div>
          </fieldset>

          {/* Travel Details */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Travel Details</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Destination Country *</label><input type="text" required className="w-full p-2 border rounded" value={formData.destination_country} onChange={e => setFormData({...formData, destination_country: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Visa Type *</label>
                <select className="w-full p-2 border rounded" value={formData.visa_type} onChange={e => setFormData({...formData, visa_type: e.target.value})}>
                  <option value="tourist">Tourist</option>
                  <option value="business">Business</option>
                  <option value="student">Student</option>
                  <option value="transit">Transit</option>
                  <option value="work">Work</option>
                </select>
              </div>
              <div className="md:col-span-2"><label className="block font-bold mb-1">Purpose of Visit</label><textarea rows="2" className="w-full p-2 border rounded" value={formData.purpose_of_visit} onChange={e => setFormData({...formData, purpose_of_visit: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Intended Arrival Date</label><input type="date" className="w-full p-2 border rounded" value={formData.intended_arrival_date} onChange={e => setFormData({...formData, intended_arrival_date: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Intended Departure Date</label><input type="date" className="w-full p-2 border rounded" value={formData.intended_departure_date} onChange={e => setFormData({...formData, intended_departure_date: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Duration of Stay (days)</label><input type="number" min="1" className="w-full p-2 border rounded" value={formData.duration_of_stay_days} onChange={e => setFormData({...formData, duration_of_stay_days: e.target.value})} /></div>
              <div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.previous_visits_to_country} onChange={e => setFormData({...formData, previous_visits_to_country: e.target.checked})} /> Previous visits to this country?</label></div>
              {formData.previous_visits_to_country && <div className="md:col-span-2"><label className="block font-bold mb-1">Previous Visit Details</label><textarea rows="2" className="w-full p-2 border rounded" value={formData.previous_visit_details} onChange={e => setFormData({...formData, previous_visit_details: e.target.value})} /></div>}
            </div>
          </fieldset>

          {/* Employment / Education */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Employment / Education</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Occupation</label><input type="text" className="w-full p-2 border rounded" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Employer / School Name</label><input type="text" className="w-full p-2 border rounded" value={formData.employer_name} onChange={e => setFormData({...formData, employer_name: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block font-bold mb-1">Employer Address</label><input type="text" className="w-full p-2 border rounded" value={formData.employer_address} onChange={e => setFormData({...formData, employer_address: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Employer Phone</label><input type="tel" className="w-full p-2 border rounded" value={formData.employer_phone} onChange={e => setFormData({...formData, employer_phone: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Monthly Income (ZMW)</label><input type="number" step="0.01" className="w-full p-2 border rounded" value={formData.monthly_income} onChange={e => setFormData({...formData, monthly_income: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Education Level</label><input type="text" className="w-full p-2 border rounded" value={formData.education_level} onChange={e => setFormData({...formData, education_level: e.target.value})} /></div>
            </div>
          </fieldset>

          {/* Additional Information */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Additional Information</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div className="md:col-span-2"><label className="block font-bold mb-1">Accommodation in Destination</label><input type="text" className="w-full p-2 border rounded" value={formData.accommodation_in_destination} onChange={e => setFormData({...formData, accommodation_in_destination: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Contact Person in Destination</label><input type="text" className="w-full p-2 border rounded" value={formData.contact_person_in_destination} onChange={e => setFormData({...formData, contact_person_in_destination: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Contact Phone in Destination</label><input type="tel" className="w-full p-2 border rounded" value={formData.contact_phone_in_destination} onChange={e => setFormData({...formData, contact_phone_in_destination: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block font-bold mb-1">Health Insurance Policy</label><input type="text" className="w-full p-2 border rounded" value={formData.health_insurance_policy} onChange={e => setFormData({...formData, health_insurance_policy: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block font-bold mb-1">Criminal Record Disclosure</label><textarea rows="2" className="w-full p-2 border rounded" value={formData.criminal_record_disclosure} onChange={e => setFormData({...formData, criminal_record_disclosure: e.target.value})} placeholder="If any, provide details. Otherwise, state 'None'" /></div>
              <div className="md:col-span-2"><label className="block font-bold mb-1">Special Requests</label><input type="text" className="w-full p-2 border rounded" value={formData.special_requests} onChange={e => setFormData({...formData, special_requests: e.target.value})} /></div>
            </div>
          </fieldset>

          {/* Document Uploads */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Document Upload</legend>
            <div className="grid md:grid-cols-3 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Passport Photo (JPEG/PNG) *</label><input type="file" accept="image/*" required className="w-full p-2 border rounded" onChange={(e) => handleFileChange(e, 'passport_photo')} /></div>
              <div><label className="block font-bold mb-1">Invitation Letter</label><input type="file" accept="image/*,application/pdf" className="w-full p-2 border rounded" onChange={(e) => handleFileChange(e, 'invitation_letter')} /></div>
              <div><label className="block font-bold mb-1">Proof of Accommodation</label><input type="file" accept="image/*,application/pdf" className="w-full p-2 border rounded" onChange={(e) => handleFileChange(e, 'proof_accommodation')} /></div>
            </div>
          </fieldset>

          <div><label className="block font-bold mb-1">Visa Fee (Embassy/Consulate) - ZMW</label><input type="number" min="0" step="0.01" className="w-full p-2 border rounded" value={formData.base_fee} onChange={e => setFormData({...formData, base_fee: e.target.value})} /></div>
          <div><label className="block font-bold mb-1">Notes</label><textarea className="w-full p-2 border rounded" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>

          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Request Quotation'}</button>
        </form>
      </div>
    </div>
  );
};

export default VisaRequest;