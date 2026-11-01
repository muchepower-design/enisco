import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import PriceCalculator from '../components/PriceCalculator';

const InsuranceRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [priceAvailable, setPriceAvailable] = useState(false);
  const [calculatedPremium, setCalculatedPremium] = useState(null);

  // Insurance Types (including Public Liability)
  const insuranceTypes = [
    { value: 'motor_vehicle', label: 'Motor Vehicle (Car, Truck, Bus)' },
    { value: 'motorcycle', label: 'Motorcycle / Scooter' },
    { value: 'property', label: 'Property (House, Office, Shop)' },
    { value: 'life', label: 'Life Insurance' },
    { value: 'health', label: 'Health / Medical Insurance' },
    { value: 'travel', label: 'Travel Insurance' },
    { value: 'public_liability', label: 'Public Liability Insurance' },
    { value: 'other', label: 'Other (Specify)' },
  ];

  const [formData, setFormData] = useState({
    // Client Details
    buyer_name: '',
    phone: '',
    email: '',
    address: '',
    nrc_passport: '',
    // date_of_birth removed

    // Insurance Type
    insurance_type: 'motor_vehicle',
    other_insurance_type: '',

    // Motor Details (for vehicle & motorcycle)
    vehicle_type: 'Private Car',
    vehicle_make_model: '',
    number_plate: '',
    chasis_number: '',
    engine_number: '',
    vehicle_color: '',
    vehicle_value: '',
    year_of_manufacture: '',

    // Motorcycle specific
    motorcycle_type: '', // Sport, Cruiser, Scooter, etc.

    // White Book name fields
    white_book_name_same: true, // true = same as buyer_name
    white_book_name: '', // will be auto-filled or manually entered

    // Property Details
    property_address: '',
    property_type: '', // House, Apartment, Office, Shop
    property_value: '',
    property_size: '', // Square meters

    // Life & Health Details
    occupation: '',
    employer: '',
    monthly_income: '',
    existing_conditions: '',
    smoker: false,
    alcohol_consumption: false,

    // Travel Details
    destination_country: '',
    travel_start_date: '',
    travel_end_date: '',
    purpose_of_travel: '',

    // Public Liability Details
    business_name: '',
    business_type: '',
    premises_address: '',
    estimated_turnover: '',
    coverage_amount: '',
    public_liability_notes: '',

    // Policy Details
    insurance_company_id: '',
    start_date: '',
    quarters: 1,
    base_premium: 0,
    notes: '',
  });

  // Document uploads
  const [files, setFiles] = useState({ white_book: null, road_tax_disc: null });
  const [showSummary, setShowSummary] = useState(false);

  // Fetch insurance companies
  useEffect(() => {
    api.get('/api/pricing/insurance-companies')
      .then(res => setCompanies(res.data))
      .catch(err => console.error('Failed to load insurance companies', err));
  }, []);

  const handlePriceFetched = (amount, message) => {
    setCalculatedPremium(amount);
    setPriceAvailable(amount !== null);
    if (amount !== null) {
      setFormData(prev => ({ ...prev, base_premium: amount }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [type]: file }));
  };

  // Check if motor details are required
  const isMotorType = ['motor_vehicle', 'motorcycle'].includes(formData.insurance_type);
  const isPropertyType = formData.insurance_type === 'property';
  const isLifeHealthType = ['life', 'health'].includes(formData.insurance_type);
  const isTravelType = formData.insurance_type === 'travel';
  const isPublicLiabilityType = formData.insurance_type === 'public_liability';
  const isOtherType = formData.insurance_type === 'other';

  // Auto-fill white_book_name if same as client name
  useEffect(() => {
    if (formData.white_book_name_same) {
      setFormData(prev => ({ ...prev, white_book_name: prev.buyer_name }));
    }
  }, [formData.white_book_name_same, formData.buyer_name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields based on type
    if (!formData.buyer_name || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (isMotorType && !formData.vehicle_make_model) {
      toast.error('Please provide vehicle make and model.');
      setLoading(false);
      return;
    }

    if (isMotorType && !formData.number_plate) {
      toast.error('Please provide vehicle registration number.');
      setLoading(false);
      return;
    }

    // Validate at least one motor document is uploaded (if motor type)
    if (isMotorType) {
      if (!files.white_book && !files.road_tax_disc) {
        toast.error('Please upload at least one of White Book or Road Tax Disc.');
        setLoading(false);
        return;
      }
    }

    // Build payload
    const payload = {
      buyer_name: formData.buyer_name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address || null,
      nrc_passport: formData.nrc_passport || null,
      // date_of_birth removed

      insurance_type: formData.insurance_type,
      other_insurance_type: isOtherType ? formData.other_insurance_type : null,

      // Motor details
      vehicle_type: isMotorType ? formData.vehicle_type : null,
      vehicle_make_model: isMotorType ? formData.vehicle_make_model : null,
      number_plate: isMotorType ? formData.number_plate : null,
      chasis_number: isMotorType ? formData.chasis_number || null : null,
      engine_number: isMotorType ? formData.engine_number || null : null,
      vehicle_color: isMotorType ? formData.vehicle_color || null : null,
      vehicle_value: isMotorType ? parseFloat(formData.vehicle_value) || 0 : 0,
      year_of_manufacture: isMotorType ? formData.year_of_manufacture || null : null,
      motorcycle_type: isMotorType && formData.insurance_type === 'motorcycle' ? formData.motorcycle_type || null : null,
      white_book_name: isMotorType ? formData.white_book_name || null : null,

      // Property details
      property_address: isPropertyType ? formData.property_address || null : null,
      property_type: isPropertyType ? formData.property_type || null : null,
      property_value: isPropertyType ? parseFloat(formData.property_value) || 0 : 0,
      property_size: isPropertyType ? formData.property_size || null : null,

      // Life & Health
      occupation: isLifeHealthType ? formData.occupation || null : null,
      employer: isLifeHealthType ? formData.employer || null : null,
      monthly_income: isLifeHealthType ? parseFloat(formData.monthly_income) || 0 : 0,
      existing_conditions: isLifeHealthType ? formData.existing_conditions || null : null,
      smoker: isLifeHealthType ? formData.smoker : false,
      alcohol_consumption: isLifeHealthType ? formData.alcohol_consumption : false,

      // Travel
      destination_country: isTravelType ? formData.destination_country || null : null,
      travel_start_date: isTravelType ? formData.travel_start_date || null : null,
      travel_end_date: isTravelType ? formData.travel_end_date || null : null,
      purpose_of_travel: isTravelType ? formData.purpose_of_travel || null : null,

      // Public Liability
      business_name: isPublicLiabilityType ? formData.business_name || null : null,
      business_type: isPublicLiabilityType ? formData.business_type || null : null,
      premises_address: isPublicLiabilityType ? formData.premises_address || null : null,
      estimated_turnover: isPublicLiabilityType ? parseFloat(formData.estimated_turnover) || 0 : 0,
      coverage_amount: isPublicLiabilityType ? parseFloat(formData.coverage_amount) || 0 : 0,
      public_liability_notes: isPublicLiabilityType ? formData.public_liability_notes || null : null,

      // Policy
      insurance_company_id: formData.insurance_company_id || null,
      start_date: formData.start_date || null,
      quarters: isMotorType ? parseInt(formData.quarters, 10) : 1, // only for motor types
      base_premium: calculatedPremium || parseFloat(formData.base_premium) || 0,
      notes: formData.notes || null,
    };

    try {
      const formDataObj = new FormData();
      formDataObj.append('data', JSON.stringify(payload));

      // Only append motor documents if motor type
      if (isMotorType) {
        if (files.white_book) formDataObj.append('white_book', files.white_book);
        if (files.road_tax_disc) formDataObj.append('road_tax_disc', files.road_tax_disc);
      }

      const response = await api.post('/api/insurance/request', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const requestId = response.data.id;
      toast.success('Insurance request submitted!');

      if (priceAvailable && formData.insurance_type !== 'other') {
        navigate(`/payment/insurance/${requestId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        toast.error(detail.map(e => e.msg).join(', '));
      } else if (typeof detail === 'string') {
        toast.error(detail);
      } else {
        toast.error('Failed to submit request. Please check all fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setShowSummary(!showSummary);
  };

  // Generate Summary (for preview)
  const generateSummary = () => {
    const typeLabel = insuranceTypes.find(t => t.value === formData.insurance_type)?.label || formData.insurance_type;
    const companyName = companies.find(c => c.id === formData.insurance_company_id)?.name || 'Not selected';

    let motorSummary = '';
    if (isMotorType) {
      motorSummary = `
        Vehicle: ${formData.vehicle_make_model || 'N/A'}
        Registration: ${formData.number_plate || 'N/A'}
        Chasis: ${formData.chasis_number || 'N/A'}
        Engine: ${formData.engine_number || 'N/A'}
        Color: ${formData.vehicle_color || 'N/A'}
        Value: ${formData.vehicle_value ? `ZMW ${formData.vehicle_value}` : 'N/A'}
        Name on White Book: ${formData.white_book_name || 'N/A'}
      `;
    }

    let propertySummary = '';
    if (isPropertyType) {
      propertySummary = `
        Address: ${formData.property_address || 'N/A'}
        Type: ${formData.property_type || 'N/A'}
        Value: ${formData.property_value ? `ZMW ${formData.property_value}` : 'N/A'}
      `;
    }

    let publicLiabilitySummary = '';
    if (isPublicLiabilityType) {
      publicLiabilitySummary = `
        Business Name: ${formData.business_name || 'N/A'}
        Business Type: ${formData.business_type || 'N/A'}
        Premises Address: ${formData.premises_address || 'N/A'}
        Estimated Turnover: ${formData.estimated_turnover ? `ZMW ${formData.estimated_turnover}` : 'N/A'}
        Coverage Amount: ${formData.coverage_amount ? `ZMW ${formData.coverage_amount}` : 'N/A'}
      `;
    }

    const summary = `
      === Insurance Summary ===
      Client: ${formData.buyer_name}
      Phone: ${formData.phone}
      Email: ${formData.email}
      Insurance Type: ${typeLabel}
      Company: ${companyName}
      ${isMotorType ? motorSummary : ''}
      ${isPropertyType ? propertySummary : ''}
      ${isPublicLiabilityType ? publicLiabilitySummary : ''}
      Start Date: ${formData.start_date || 'N/A'}
      ${isMotorType ? `Quarters: ${formData.quarters}` : ''}
      Estimated Premium: ${calculatedPremium ? `ZMW ${calculatedPremium}` : 'Pending calculation'}
    `;
    return summary;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-black mb-6">Insurance Request</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Details */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Client Details</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Full Name *</label><input type="text" required className="w-full p-2 border rounded" value={formData.buyer_name} onChange={e => setFormData({...formData, buyer_name: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Phone *</label><input type="tel" required className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Email *</label><input type="email" required className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">NRC / Passport Number</label><input type="text" className="w-full p-2 border rounded" value={formData.nrc_passport} onChange={e => setFormData({...formData, nrc_passport: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block font-bold mb-1">Residential Address</label><input type="text" className="w-full p-2 border rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
              {/* Date of Birth removed */}
            </div>
          </fieldset>

          {/* Insurance Type Selection */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">What do you want to insure?</legend>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block font-bold mb-1">Insurance Type *</label>
                <select className="w-full p-2 border rounded" value={formData.insurance_type} onChange={e => setFormData({...formData, insurance_type: e.target.value})}>
                  {insuranceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {isOtherType && (
                <div>
                  <label className="block font-bold mb-1">Specify Insurance Type *</label>
                  <input type="text" required className="w-full p-2 border rounded" value={formData.other_insurance_type} onChange={e => setFormData({...formData, other_insurance_type: e.target.value})} placeholder="e.g., Marine, Crop, Pet, etc." />
                </div>
              )}
            </div>
          </fieldset>

          {/* Motor Details (Vehicle / Motorcycle) */}
          {isMotorType && (
            <fieldset className="border rounded-lg p-4">
              <legend className="font-bold text-lg px-2">{formData.insurance_type === 'motorcycle' ? 'Motorcycle' : 'Vehicle'} Details</legend>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div><label className="block font-bold mb-1">Make & Model *</label><input type="text" required className="w-full p-2 border rounded" value={formData.vehicle_make_model} onChange={e => setFormData({...formData, vehicle_make_model: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Registration Number *</label><input type="text" required className="w-full p-2 border rounded" value={formData.number_plate} onChange={e => setFormData({...formData, number_plate: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Chasis Number</label><input type="text" className="w-full p-2 border rounded" value={formData.chasis_number} onChange={e => setFormData({...formData, chasis_number: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Engine Number</label><input type="text" className="w-full p-2 border rounded" value={formData.engine_number} onChange={e => setFormData({...formData, engine_number: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Color</label><input type="text" className="w-full p-2 border rounded" value={formData.vehicle_color} onChange={e => setFormData({...formData, vehicle_color: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Year of Manufacture</label><input type="number" min="1900" max="2099" className="w-full p-2 border rounded" value={formData.year_of_manufacture} onChange={e => setFormData({...formData, year_of_manufacture: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Vehicle / Motorcycle Value (ZMW)</label><input type="number" step="0.01" className="w-full p-2 border rounded" value={formData.vehicle_value} onChange={e => setFormData({...formData, vehicle_value: e.target.value})} /></div>
                {formData.insurance_type === 'motor_vehicle' && (
                  <div><label className="block font-bold mb-1">Vehicle Type</label>
                    <select className="w-full p-2 border rounded" value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})}>
                      <option value="Private Car">Private Car</option>
                      <option value="Commercial Vehicle">Commercial Vehicle</option>
                      <option value="Minibus">Minibus</option>
                      <option value="Truck">Truck</option>
                    </select>
                  </div>
                )}
                {formData.insurance_type === 'motorcycle' && (
                  <div><label className="block font-bold mb-1">Motorcycle Type</label>
                    <select className="w-full p-2 border rounded" value={formData.motorcycle_type} onChange={e => setFormData({...formData, motorcycle_type: e.target.value})}>
                      <option value="">Select Type</option>
                      <option value="Sport">Sport</option>
                      <option value="Cruiser">Cruiser</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Touring">Touring</option>
                      <option value="Dirt">Dirt / Off-road</option>
                    </select>
                  </div>
                )}
                {/* White Book Name Section */}
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <label className="block font-bold mb-2">Name on White Book</label>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center gap-1">
                      <input type="radio" name="white_same" checked={formData.white_book_name_same === true} onChange={() => setFormData({...formData, white_book_name_same: true})} />
                      Same as client's full name
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" name="white_same" checked={formData.white_book_name_same === false} onChange={() => setFormData({...formData, white_book_name_same: false})} />
                      Different
                    </label>
                  </div>
                  {!formData.white_book_name_same && (
                    <div>
                      <label className="block font-bold mb-1">Name appearing on White Book *</label>
                      <input type="text" required className="w-full p-2 border rounded" value={formData.white_book_name} onChange={e => setFormData({...formData, white_book_name: e.target.value})} placeholder="Enter name as it appears on the White Book" />
                    </div>
                  )}
                  {formData.white_book_name_same && (
                    <div className="text-sm text-gray-600">(Auto-filled with client's full name: <strong>{formData.buyer_name}</strong>)</div>
                  )}
                </div>
              </div>
            </fieldset>
          )}

          {/* Property Details */}
          {isPropertyType && (
            <fieldset className="border rounded-lg p-4">
              <legend className="font-bold text-lg px-2">Property Details</legend>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div className="md:col-span-2"><label className="block font-bold mb-1">Property Address *</label><input type="text" required className="w-full p-2 border rounded" value={formData.property_address} onChange={e => setFormData({...formData, property_address: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Property Type</label>
                  <select className="w-full p-2 border rounded" value={formData.property_type} onChange={e => setFormData({...formData, property_type: e.target.value})}>
                    <option value="">Select Type</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Office">Office</option>
                    <option value="Shop">Shop</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>
                <div><label className="block font-bold mb-1">Property Value (ZMW)</label><input type="number" step="0.01" className="w-full p-2 border rounded" value={formData.property_value} onChange={e => setFormData({...formData, property_value: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Size (sq meters)</label><input type="number" className="w-full p-2 border rounded" value={formData.property_size} onChange={e => setFormData({...formData, property_size: e.target.value})} /></div>
              </div>
            </fieldset>
          )}

          {/* Life & Health Details */}
          {isLifeHealthType && (
            <fieldset className="border rounded-lg p-4">
              <legend className="font-bold text-lg px-2">{formData.insurance_type === 'life' ? 'Life' : 'Health'} Insurance Details</legend>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div><label className="block font-bold mb-1">Occupation</label><input type="text" className="w-full p-2 border rounded" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Employer / Company</label><input type="text" className="w-full p-2 border rounded" value={formData.employer} onChange={e => setFormData({...formData, employer: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Monthly Income (ZMW)</label><input type="number" step="0.01" className="w-full p-2 border rounded" value={formData.monthly_income} onChange={e => setFormData({...formData, monthly_income: e.target.value})} /></div>
                <div className="md:col-span-2"><label className="block font-bold mb-1">Existing Medical Conditions</label><textarea className="w-full p-2 border rounded" rows="2" value={formData.existing_conditions} onChange={e => setFormData({...formData, existing_conditions: e.target.value})} placeholder="List any existing conditions (if none, write 'None')" /></div>
                <div className="flex items-center gap-4"><label><input type="checkbox" checked={formData.smoker} onChange={e => setFormData({...formData, smoker: e.target.checked})} /> Smoker</label><label><input type="checkbox" checked={formData.alcohol_consumption} onChange={e => setFormData({...formData, alcohol_consumption: e.target.checked})} /> Consumes Alcohol</label></div>
              </div>
            </fieldset>
          )}

          {/* Travel Details */}
          {isTravelType && (
            <fieldset className="border rounded-lg p-4">
              <legend className="font-bold text-lg px-2">Travel Insurance Details</legend>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div><label className="block font-bold mb-1">Destination Country *</label><input type="text" required className="w-full p-2 border rounded" value={formData.destination_country} onChange={e => setFormData({...formData, destination_country: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Purpose of Travel</label><input type="text" className="w-full p-2 border rounded" value={formData.purpose_of_travel} onChange={e => setFormData({...formData, purpose_of_travel: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Travel Start Date</label><input type="date" className="w-full p-2 border rounded" value={formData.travel_start_date} onChange={e => setFormData({...formData, travel_start_date: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Travel End Date</label><input type="date" className="w-full p-2 border rounded" value={formData.travel_end_date} onChange={e => setFormData({...formData, travel_end_date: e.target.value})} /></div>
              </div>
            </fieldset>
          )}

          {/* Public Liability Details */}
          {isPublicLiabilityType && (
            <fieldset className="border rounded-lg p-4">
              <legend className="font-bold text-lg px-2">Public Liability Insurance Details</legend>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div className="md:col-span-2"><label className="block font-bold mb-1">Business / Entity Name *</label><input type="text" required className="w-full p-2 border rounded" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Business Type</label>
                  <select className="w-full p-2 border rounded" value={formData.business_type} onChange={e => setFormData({...formData, business_type: e.target.value})}>
                    <option value="">Select Type</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Limited Company">Limited Company</option>
                    <option value="NGO">NGO</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2"><label className="block font-bold mb-1">Premises Address *</label><input type="text" required className="w-full p-2 border rounded" value={formData.premises_address} onChange={e => setFormData({...formData, premises_address: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Estimated Annual Turnover (ZMW)</label><input type="number" step="0.01" className="w-full p-2 border rounded" value={formData.estimated_turnover} onChange={e => setFormData({...formData, estimated_turnover: e.target.value})} /></div>
                <div><label className="block font-bold mb-1">Coverage Amount Required (ZMW)</label><input type="number" step="0.01" className="w-full p-2 border rounded" value={formData.coverage_amount} onChange={e => setFormData({...formData, coverage_amount: e.target.value})} /></div>
                <div className="md:col-span-2"><label className="block font-bold mb-1">Additional Notes / Description</label><textarea className="w-full p-2 border rounded" rows="2" value={formData.public_liability_notes} onChange={e => setFormData({...formData, public_liability_notes: e.target.value})} placeholder="Describe your business operations, risks, etc." /></div>
              </div>
            </fieldset>
          )}

          {/* Quote / Quotation Request for Other Types */}
          {isOtherType && (
            <fieldset className="border rounded-lg p-4">
              <legend className="font-bold text-lg px-2">Quotation Request</legend>
              <div>
                <label className="block font-bold mb-1">Description of what you want to insure</label>
                <textarea className="w-full p-2 border rounded" rows="4" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Please describe what you want to insure, the value, and any other relevant details. Our team will contact you for further information and provide a quotation." />
              </div>
            </fieldset>
          )}

          {/* Insurance Company & Policy */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Policy Details</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Insurance Company</label>
                <select className="w-full p-2 border rounded" value={formData.insurance_company_id} onChange={e => setFormData({...formData, insurance_company_id: e.target.value})}>
                  <option value="">Select Company (optional)</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="block font-bold mb-1">Policy Start Date</label><input type="date" className="w-full p-2 border rounded" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} /></div>
              {/* Only show Quarters for Motor types */}
              {isMotorType && (
                <div><label className="block font-bold mb-1">Number of Quarters (90 days each)</label>
                  <select className="w-full p-2 border rounded" value={formData.quarters} onChange={e => setFormData({...formData, quarters: parseInt(e.target.value)})}>
                    <option value="1">1 Quarter (90 days)</option>
                    <option value="2">2 Quarters (180 days)</option>
                    <option value="3">3 Quarters (270 days)</option>
                    <option value="4">4 Quarters (360 days)</option>
                  </select>
                </div>
              )}
            </div>
          </fieldset>

          {/* Price Calculator (only for Motor types with company selected) */}
          {isMotorType && (
            <PriceCalculator
              serviceType="insurance"
              params={{
                company_id: formData.insurance_company_id,
                vehicle_type: formData.vehicle_type,
                insurance_type: formData.insurance_type,
                quarters: formData.quarters
              }}
              onPriceFetched={handlePriceFetched}
            />
          )}

          {/* Document Uploads (Motor only) */}
          {isMotorType && (
            <fieldset className="border rounded-lg p-4">
              <legend className="font-bold text-lg px-2">Motor Documents (at least one required)</legend>
              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block font-bold mb-1">White Book (Logbook) Copy</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'white_book')} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-bold mb-1">Road Tax Disc Copy</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'road_tax_disc')} className="w-full p-2 border rounded" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">* You must upload at least one of the above documents.</p>
            </fieldset>
          )}

          {/* Notes */}
          <div><label className="block font-bold mb-1">Additional Notes</label><textarea className="w-full p-2 border rounded" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any additional information or special requests..." /></div>

          {/* Preview & Submit Buttons */}
          <div className="flex gap-4">
            <button type="button" onClick={handlePreview} className="btn-outline">
              {showSummary ? 'Hide' : 'Preview'} Summary
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>

          {/* Summary Card */}
          {showSummary && (
            <div className="glass-card p-6 mt-4">
              <h3 className="font-bold text-lg mb-4">Application Summary</h3>
              <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded">{generateSummary()}</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default InsuranceRequest;