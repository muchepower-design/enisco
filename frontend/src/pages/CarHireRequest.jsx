import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CarHireRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [files, setFiles] = useState({ license: null, id_document: null });

  const [idType, setIdType] = useState('nrc');
  const [idNumber, setIdNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [nationalityLocked, setNationalityLocked] = useState(false);

  // Emergency contacts state
  const [emergencyContacts, setEmergencyContacts] = useState([
    { full_name: '', tel: '', cell: '' },
    { full_name: '', tel: '', cell: '' }
  ]);

  // Terms modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    action_type: 'quote',
    full_name: '',
    phone: '',
    email: '',
    driver_license_number: '',
    driver_license_expiry: '',
    physical_address: '',            // new field
    // date_of_birth removed
    pickup_location: '',
    dropoff_location: '',
    pickup_date: '',
    pickup_time: '',
    dropoff_date: '',
    dropoff_time: '',
    // rental_duration_days removed (computed)
    vehicle_type: '',
    preferred_model: '',
    transmission: '',
    fuel_policy: 'Full-to-Full',
    additional_drivers: 0,
    child_seat: false,
    gps_navigation: false,
    // base_amount removed
    notes: '',
    employment_status: 'employed',   // 'employed' or 'unemployed'
    employer_name: '',
    business_occupation: '',
    travel_area: 'within_lusaka',    // 'within_lusaka' or 'outside_lusaka'
    travel_town: '',
  });

  // Compute rental duration when dates change
  const [rentalDuration, setRentalDuration] = useState(null);

  useEffect(() => {
    if (formData.pickup_date && formData.dropoff_date) {
      const start = new Date(formData.pickup_date);
      const end = new Date(formData.dropoff_date);
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setRentalDuration(diffDays);
      } else {
        setRentalDuration(null);
      }
    } else {
      setRentalDuration(null);
    }
  }, [formData.pickup_date, formData.dropoff_date]);

  // Fetch vehicle types
  useEffect(() => {
    api.get('/api/pricing/vehicle-types')
      .then(res => setVehicleTypes(res.data))
      .catch(err => console.error('Failed to load vehicle types', err));
  }, []);

  // ---- ID validation ----
  const isValidNRC = (value) => {
    const raw = value.replace(/\//g, '');
    const nrcZmbRegex = /^ZMB\d{10}$/;
    const rawSlashRegex = /^\d{6}\d{1,2}\d{1,3}$/;
    return nrcZmbRegex.test(raw) || (rawSlashRegex.test(raw) && raw.length >= 8 && raw.length <= 11);
  };

  const isValidPassport = (value) => {
    const passportRegex = /^[A-Z0-9]{6,20}$/;
    return passportRegex.test(value.toUpperCase());
  };

  const getNationalityFromNRC = (value) => {
    const raw = value.replace(/\//g, '');
    if (value.includes('/')) {
      const parts = value.split('/');
      const last = parts[parts.length - 1];
      if (last === '1') return 'Zambian';
      else return null;
    }
    if (value.startsWith('ZMB')) return 'Zambian';
    return null;
  };

  const formatNRC = (value) => {
    let raw = value.replace(/[^A-Za-z0-9]/g, '');
    if (raw.toUpperCase().startsWith('ZMB')) {
      return raw.toUpperCase().slice(0, 13);
    }
    raw = raw.slice(0, 11);
    let formatted = '';
    for (let i = 0; i < raw.length; i++) {
      if (i === 6) formatted += '/';
      else if (i === 8) formatted += '/';
      formatted += raw[i];
    }
    return formatted;
  };

  const handleIdNumberChange = (e) => {
    let value = e.target.value;
    if (idType === 'nrc') value = formatNRC(value);
    setIdNumber(value);
    if (idType === 'nrc' && value.length > 0) {
      const detected = getNationalityFromNRC(value);
      if (detected) {
        setNationality(detected);
        setNationalityLocked(true);
      } else {
        setNationality('');
        setNationalityLocked(false);
      }
    } else {
      setNationalityLocked(false);
    }
  };

  const handleIdTypeChange = (type) => {
    setIdType(type);
    setIdNumber('');
    setNationality('');
    setNationalityLocked(false);
  };

  const handleNationalityChange = (e) => {
    if (!nationalityLocked) setNationality(e.target.value);
  };

  // Emergency contacts handlers
  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { full_name: '', tel: '', cell: '' }]);
  };

  const removeEmergencyContact = (index) => {
    if (emergencyContacts.length <= 2) {
      toast.error('You need at least 2 emergency contacts.');
      return;
    }
    const newContacts = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(newContacts);
  };

  const updateEmergencyContact = (index, field, value) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  // Validation
  const isFormValid = () => {
    if (!formData.full_name || !formData.phone || !formData.email) return false;
    if (!idNumber) return false;
    if (idType === 'nrc' && !isValidNRC(idNumber)) return false;
    if (idType === 'passport' && !isValidPassport(idNumber)) return false;
    if (!nationality) return false;
    if (!formData.driver_license_number || !formData.driver_license_expiry) return false;
    if (!formData.pickup_location || !formData.pickup_date) return false;
    if (!formData.physical_address) return false;
    // Check emergency contacts completeness
    for (let contact of emergencyContacts) {
      if (!contact.full_name || !contact.tel || !contact.cell) return false;
    }
    // Check employment fields
    if (formData.employment_status === 'employed' && !formData.employer_name) return false;
    if (formData.employment_status === 'unemployed' && !formData.business_occupation) return false;
    // Travel area
    if (formData.travel_area === 'outside_lusaka' && !formData.travel_town) return false;
    // Terms
    if (!termsAccepted) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error('Please fill all required fields correctly and accept the Terms.');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      service_type: 'carhire',
      email: formData.email || null,
      id_type: idType,
      id_number: idNumber,
      nationality: nationality,
      driver_license_expiry: new Date(formData.driver_license_expiry).toISOString(),
      // date_of_birth removed
      physical_address: formData.physical_address,
      pickup_date: new Date(formData.pickup_date).toISOString(),
      dropoff_date: formData.dropoff_date ? new Date(formData.dropoff_date).toISOString() : null,
      // base_amount removed
      notes: formData.notes || null,
      rental_duration_days: rentalDuration, // computed, will be sent
      additional_drivers: parseInt(formData.additional_drivers) || 0,
      employment_status: formData.employment_status,
      employer_name: formData.employment_status === 'employed' ? formData.employer_name : null,
      business_occupation: formData.employment_status === 'unemployed' ? formData.business_occupation : null,
      emergency_contacts: emergencyContacts,
      travel_area: formData.travel_area,
      travel_town: formData.travel_area === 'outside_lusaka' ? formData.travel_town : null,
    };

    try {
      const formDataObj = new FormData();
      formDataObj.append('data', JSON.stringify(payload));
      if (files.license) formDataObj.append('license_file', files.license);
      if (files.id_document) formDataObj.append('id_document', files.id_document);

      await api.post('/api/carhire/request', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Car hire request submitted!');
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        toast.error(detail.map(e => e.msg).join(', '));
      } else if (typeof detail === 'string') {
        toast.error(detail);
      } else {
        toast.error('Failed to submit');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [type]: file }));
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="glass-card p-8">
        <h1 className="text-3xl font-black mb-6">Car Hire / Rental Request</h1>
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal Details */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Personal Details</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Full Name *</label><input type="text" required className="w-full p-2 border rounded" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Phone *</label><input type="tel" required className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Email *</label><input type="email" required className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Physical Address *</label><input type="text" required className="w-full p-2 border rounded" value={formData.physical_address} onChange={e => setFormData({...formData, physical_address: e.target.value})} /></div>
            </div>
          </fieldset>

          {/* Identification */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Identification</legend>
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-2">ID Type *</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="nrc" checked={idType === 'nrc'} onChange={() => handleIdTypeChange('nrc')} />
                    NRC (National Registration Card)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="passport" checked={idType === 'passport'} onChange={() => handleIdTypeChange('passport')} />
                    Passport
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">{idType === 'nrc' ? 'NRC Number *' : 'Passport Number *'}</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded font-mono"
                  value={idNumber}
                  onChange={handleIdNumberChange}
                  placeholder={idType === 'nrc' ? 'e.g., ZMB1234567890 or 266817/24/1' : 'e.g., ZA123456'}
                />
                {idType === 'nrc' && idNumber.length > 0 && !isValidNRC(idNumber) && (
                  <p className="text-red-500 text-sm mt-1">Invalid NRC format.</p>
                )}
                {idType === 'passport' && idNumber.length > 0 && !isValidPassport(idNumber) && (
                  <p className="text-red-500 text-sm mt-1">Invalid passport format.</p>
                )}
              </div>
              <div>
                <label className="block font-bold mb-1">Nationality *</label>
                <input
                  type="text"
                  required
                  className={`w-full p-2 border rounded ${nationalityLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  value={nationality}
                  onChange={handleNationalityChange}
                  readOnly={nationalityLocked}
                  placeholder={nationalityLocked ? 'Auto-detected' : 'Enter nationality'}
                />
                {nationalityLocked && <p className="text-sm text-gray-500 mt-1">Auto-detected from NRC.</p>}
              </div>
            </div>
          </fieldset>

          {/* Driver License */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Driver License</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">License Number *</label><input type="text" required className="w-full p-2 border rounded" value={formData.driver_license_number} onChange={e => setFormData({...formData, driver_license_number: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Expiry Date *</label><input type="date" required className="w-full p-2 border rounded" value={formData.driver_license_expiry} onChange={e => setFormData({...formData, driver_license_expiry: e.target.value})} /></div>
            </div>
          </fieldset>

          {/* Employment Status */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Employment Status</legend>
            <div className="space-y-4 mt-2">
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input type="radio" value="employed" checked={formData.employment_status === 'employed'} onChange={() => setFormData({...formData, employment_status: 'employed', business_occupation: ''})} />
                  Employed
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="unemployed" checked={formData.employment_status === 'unemployed'} onChange={() => setFormData({...formData, employment_status: 'unemployed', employer_name: ''})} />
                  Unemployed / Self-employed
                </label>
              </div>
              {formData.employment_status === 'employed' && (
                <div>
                  <label className="block font-bold mb-1">Employer Name *</label>
                  <input type="text" required className="w-full p-2 border rounded" value={formData.employer_name} onChange={e => setFormData({...formData, employer_name: e.target.value})} />
                </div>
              )}
              {formData.employment_status === 'unemployed' && (
                <div>
                  <label className="block font-bold mb-1">Business / Occupation *</label>
                  <input type="text" required className="w-full p-2 border rounded" value={formData.business_occupation} onChange={e => setFormData({...formData, business_occupation: e.target.value})} />
                </div>
              )}
            </div>
          </fieldset>

          {/* Rental Details */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Rental Details</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Pickup Location *</label><input type="text" required className="w-full p-2 border rounded" value={formData.pickup_location} onChange={e => setFormData({...formData, pickup_location: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Drop-off Location</label><input type="text" className="w-full p-2 border rounded" value={formData.dropoff_location} onChange={e => setFormData({...formData, dropoff_location: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Pickup Date *</label><input type="date" required className="w-full p-2 border rounded" value={formData.pickup_date} onChange={e => setFormData({...formData, pickup_date: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Pickup Time</label><input type="time" className="w-full p-2 border rounded" value={formData.pickup_time} onChange={e => setFormData({...formData, pickup_time: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Drop-off Date</label><input type="date" className="w-full p-2 border rounded" value={formData.dropoff_date} onChange={e => setFormData({...formData, dropoff_date: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Drop-off Time</label><input type="time" className="w-full p-2 border rounded" value={formData.dropoff_time} onChange={e => setFormData({...formData, dropoff_time: e.target.value})} /></div>
              <div className="md:col-span-2">
                <label className="block font-bold mb-1">Rental Duration (days) – auto‑calculated</label>
                <input type="text" readOnly className="w-full p-2 border rounded bg-gray-100" value={rentalDuration !== null ? rentalDuration : 'Select dates'} />
              </div>
            </div>
          </fieldset>

          {/* Travel Area */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Travel Area</legend>
            <div className="space-y-4 mt-2">
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input type="radio" value="within_lusaka" checked={formData.travel_area === 'within_lusaka'} onChange={() => setFormData({...formData, travel_area: 'within_lusaka', travel_town: ''})} />
                  Within Lusaka
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="outside_lusaka" checked={formData.travel_area === 'outside_lusaka'} onChange={() => setFormData({...formData, travel_area: 'outside_lusaka'})} />
                  Outside Lusaka
                </label>
              </div>
              {formData.travel_area === 'outside_lusaka' && (
                <div>
                  <label className="block font-bold mb-1">Town / Destination *</label>
                  <input type="text" required className="w-full p-2 border rounded" value={formData.travel_town} onChange={e => setFormData({...formData, travel_town: e.target.value})} />
                </div>
              )}
            </div>
          </fieldset>

          {/* Emergency Contacts */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Contact Persons In Case of Emergency (at least 2)</legend>
            <div className="space-y-4 mt-2">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="grid md:grid-cols-4 gap-2 items-end border-b pb-2">
                  <div>
                    <label className="block font-bold mb-1">Full Name *</label>
                    <input type="text" required className="w-full p-2 border rounded" value={contact.full_name} onChange={e => updateEmergencyContact(index, 'full_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Tel (Landline)</label>
                    <input type="text" className="w-full p-2 border rounded" value={contact.tel} onChange={e => updateEmergencyContact(index, 'tel', e.target.value)} />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Cell *</label>
                    <input type="text" required className="w-full p-2 border rounded" value={contact.cell} onChange={e => updateEmergencyContact(index, 'cell', e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    {index >= 2 && (
                      <button type="button" onClick={() => removeEmergencyContact(index)} className="text-red-600 hover:underline">Remove</button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addEmergencyContact} className="text-blue-600 hover:underline">+ Add another contact</button>
            </div>
          </fieldset>

          {/* Vehicle Preferences */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Vehicle Preferences</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Vehicle Type</label>
                <select className="w-full p-2 border rounded" value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})}>
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div><label className="block font-bold mb-1">Preferred Model</label><input type="text" className="w-full p-2 border rounded" value={formData.preferred_model} onChange={e => setFormData({...formData, preferred_model: e.target.value})} /></div>
              <div><label className="block font-bold mb-1">Transmission</label>
                <select className="w-full p-2 border rounded" value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})}>
                  <option value="">Any</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div><label className="block font-bold mb-1">Fuel Policy</label>
                <select className="w-full p-2 border rounded" value={formData.fuel_policy} onChange={e => setFormData({...formData, fuel_policy: e.target.value})}>
                  <option value="Full-to-Full">Full-to-Full</option>
                  <option value="Pre-paid">Pre-paid</option>
                </select>
              </div>
              <div><label className="block font-bold mb-1">Additional Drivers</label><input type="number" min="0" className="w-full p-2 border rounded" value={formData.additional_drivers} onChange={e => setFormData({...formData, additional_drivers: parseInt(e.target.value) || 0})} /></div>
              <div className="flex items-center gap-4"><label><input type="checkbox" checked={formData.child_seat} onChange={e => setFormData({...formData, child_seat: e.target.checked})} /> Child Seat</label><label><input type="checkbox" checked={formData.gps_navigation} onChange={e => setFormData({...formData, gps_navigation: e.target.checked})} /> GPS Navigation</label></div>
            </div>
          </fieldset>

          {/* Document Uploads */}
          <fieldset className="border rounded-lg p-4">
            <legend className="font-bold text-lg px-2">Upload Documents</legend>
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div><label className="block font-bold mb-1">Driver License Copy *</label><input type="file" accept="image/*,application/pdf" required className="w-full p-2 border rounded" onChange={(e) => handleFileChange(e, 'license')} /></div>
              <div><label className="block font-bold mb-1">{idType === 'nrc' ? 'NRC Copy *' : 'Passport Copy *'}</label><input type="file" accept="image/*,application/pdf" required className="w-full p-2 border rounded" onChange={(e) => handleFileChange(e, 'id_document')} /></div>
            </div>
          </fieldset>

          {/* Notes */}
          <div><label className="block font-bold mb-1">Notes</label><textarea className="w-full p-2 border rounded" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>

          {/* Terms and Conditions */}
          <div className="border rounded-lg p-4">
            <div className="h-48 overflow-y-scroll bg-gray-50 p-3 border rounded mb-2 text-sm">
              <p className="font-bold">TERMS AND CONDITIONS</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Enisco Transport and Car Hire Limited will rent out its vehicles at a charge. This fee will vary according to the type of vehicle required by a client; the maximum charge will be based on one calendar day and not 24hrs. Days for which the car is rented out are counted starting from the first calendar day when the car is collected on the first calendar day.</li>
                <li>The company will only accept reservations from clients with a valid driver's licence which should have been held for at least two years; and upon submission of essential personal information i.e. NRC/ID No. Physical Address, Contact Details, Referees place of work etc. vehicle will not be rented out to underage individuals below the age of 22 years.</li>
                <li>In case of a breakdown Enisco Transport and Car Hire Limited will replace a car within 48 hours.</li>
                <li>In the event of an accident and damages to the car, Enisco Transport and Car Hire Limited reserves the right to charge loss of business use to the client for the period when the car will not be in use by Enisco Transport and Car Hire Limited as a revenue generation asset.</li>
                <li>Clients are expected to inspect the car for any damages/ Abnormalities before collecting the car. Such inspections should be done in the presence of both the Client and Enisco Transport and Car Hire Limited representative should sign on the inspection form.</li>
                <li>Fuel is the client's responsibility. Enisco Transport and Car Hire Limited reserves the right to provide the car with or without fuel depending on circumstances. In the event that fuel is provided the client is expected to return the car with the same amount of fuel which was provided with the car.</li>
                <li>All vehicles and camping equipment will be provided in good condition apart from reasonable wear and tear clients are expected to return the vehicle in the same good condition. Whilst our vehicle are compressively insured, any damages or loss of vehicle property whilst the car is in the client's custody and the associated cost of repair will be borne by the client. The 10% excess payable by the client will also apply in the event of a write off. The Vehicle will be deemed to be in the client's custody upon delivery and will be returned to the client's custody.</li>
                <li>Enisco Transport and Car Hire Limited will accept a security deposit in the form of cash in the event of damages to the car the client agrees for Enisco Transport and Car Hire Limited to charge him/her a charge of 10% excess including any other cost borne by the client as outlined in the contract.</li>
                <li>All vehicles are expected to be returned on time, any late return will attract a penalty equal to full days charge. An allowance of 1 hour from the time of return is given. If the client decides to extend the time of the hire period whilst the vehicle is in the client's custody, then the client should communicate this. In this case there be an additional charge for the extended hire period extension of rental period is not automatic hence client are advised to communicate in time.</li>
                <li>Any cancellation of the vehicle reservation should be made at least 7 days before the hire is due otherwise a levy of 100% of the deposit paid or to be paid will be charged to the client. Any cancellation of hire after commencement will attract a charge equal to the amount invoiced.</li>
                <li>In case of an accident a client is liable to pay 10% of the total damage cost and it's nonnegotiable and a police report must be produced.</li>
                <li>A reservation will only be confirmed on payment of 50% deposit of the proforma invoice. The 50% balance should be paid upon collecting the car. However, full payment can be made for reservation to be confirmed either by cash or credit card should the client choose to.</li>
                <li>In the event of Enisco Transport and Car Hire Limited instructing attorneys to collect from the client an mount owing to the Enisco Transport and Car Hire Limited, the client agrees to pay all costs on the scale as between attorney and own client, including collection charges.</li>
                <li>All Enisco Transport and Car Hire Limited once rented shall not be used for activities which are prohibited by the laws of Zambia and the company shall not accept any responsibility on any of its vehicles used for such activities. All vehicles not returned on time and without prior communication of the extension of the rental period will be declared stolen.</li>
                <li>All clients are required to read through the vehicle Rental Contract terms. The acceptance of our offer service provision on the part of the client and the signing of the vehicle rental contract will be full acceptance of our vehicle rental terms and conditions as outlined on the vehicle rental contract form. All trading conditions and the vehicle rental contract terms and conditions shall be construed and enforced according to the Laws of Republic of Zambia.</li>
              </ol>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              <span>I accept the Terms and Conditions</span>
              <button type="button" onClick={() => setShowTermsModal(true)} className="text-blue-600 underline ml-4">View full terms</button>
            </div>
          </div>

          <button type="submit" disabled={loading || !isFormValid()} className="btn-primary w-full">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl max-h-[80vh] overflow-y-auto w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>
            <div className="space-y-2 text-sm">
              <ol className="list-decimal ml-5 space-y-1">
                <li>Enisco Transport and Car Hire Limited will rent out its vehicles at a charge. This fee will vary according to the type of vehicle required by a client; the maximum charge will be based on one calendar day and not 24hrs. Days for which the car is rented out are counted starting from the first calendar day when the car is collected on the first calendar day.</li>
                <li>The company will only accept reservations from clients with a valid driver's licence which should have been held for at least two years; and upon submission of essential personal information i.e. NRC/ID No. Physical Address, Contact Details, Referees place of work etc. vehicle will not be rented out to underage individuals below the age of 22 years.</li>
                <li>In case of a breakdown Enisco Transport and Car Hire Limited will replace a car within 48 hours.</li>
                <li>In the event of an accident and damages to the car, Enisco Transport and Car Hire Limited reserves the right to charge loss of business use to the client for the period when the car will not be in use by Enisco Transport and Car Hire Limited as a revenue generation asset.</li>
                <li>Clients are expected to inspect the car for any damages/ Abnormalities before collecting the car. Such inspections should be done in the presence of both the Client and Enisco Transport and Car Hire Limited representative should sign on the inspection form.</li>
                <li>Fuel is the client's responsibility. Enisco Transport and Car Hire Limited reserves the right to provide the car with or without fuel depending on circumstances. In the event that fuel is provided the client is expected to return the car with the same amount of fuel which was provided with the car.</li>
                <li>All vehicles and camping equipment will be provided in good condition apart from reasonable wear and tear clients are expected to return the vehicle in the same good condition. Whilst our vehicle are compressively insured, any damages or loss of vehicle property whilst the car is in the client's custody and the associated cost of repair will be borne by the client. The 10% excess payable by the client will also apply in the event of a write off. The Vehicle will be deemed to be in the client's custody upon delivery and will be returned to the client's custody.</li>
                <li>Enisco Transport and Car Hire Limited will accept a security deposit in the form of cash in the event of damages to the car the client agrees for Enisco Transport and Car Hire Limited to charge him/her a charge of 10% excess including any other cost borne by the client as outlined in the contract.</li>
                <li>All vehicles are expected to be returned on time, any late return will attract a penalty equal to full days charge. An allowance of 1 hour from the time of return is given. If the client decides to extend the time of the hire period whilst the vehicle is in the client's custody, then the client should communicate this. In this case there be an additional charge for the extended hire period extension of rental period is not automatic hence client are advised to communicate in time.</li>
                <li>Any cancellation of the vehicle reservation should be made at least 7 days before the hire is due otherwise a levy of 100% of the deposit paid or to be paid will be charged to the client. Any cancellation of hire after commencement will attract a charge equal to the amount invoiced.</li>
                <li>In case of an accident a client is liable to pay 10% of the total damage cost and it's nonnegotiable and a police report must be produced.</li>
                <li>A reservation will only be confirmed on payment of 50% deposit of the proforma invoice. The 50% balance should be paid upon collecting the car. However, full payment can be made for reservation to be confirmed either by cash or credit card should the client choose to.</li>
                <li>In the event of Enisco Transport and Car Hire Limited instructing attorneys to collect from the client an mount owing to the Enisco Transport and Car Hire Limited, the client agrees to pay all costs on the scale as between attorney and own client, including collection charges.</li>
                <li>All Enisco Transport and Car Hire Limited once rented shall not be used for activities which are prohibited by the laws of Zambia and the company shall not accept any responsibility on any of its vehicles used for such activities. All vehicles not returned on time and without prior communication of the extension of the rental period will be declared stolen.</li>
                <li>All clients are required to read through the vehicle Rental Contract terms. The acceptance of our offer service provision on the part of the client and the signing of the vehicle rental contract will be full acceptance of our vehicle rental terms and conditions as outlined on the vehicle rental contract form. All trading conditions and the vehicle rental contract terms and conditions shall be construed and enforced according to the Laws of Republic of Zambia.</li>
              </ol>
            </div>
            <button onClick={() => setShowTermsModal(false)} className="mt-4 btn-primary">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarHireRequest;