import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaPhone, FaEnvelope, FaLocationDot } from 'react-icons/fa6';

const Contact = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/api/contact', formData);
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ full_name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="glass-card p-8">
          <h1 className="text-3xl font-black mb-6">Get in Touch</h1>
          <p className="text-gray-600 mb-8">
            Have questions about our services? Need assistance with a booking? Our team is here to help.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaPhone className="text-brand-red text-xl" />
              <div>
                <p className="font-semibold">Phone</p>
                <p>+260 975 074 272</p>
                <p>+260 977 492 911</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-brand-red text-xl" />
              <div>
                <p className="font-semibold">Email</p>
                <p>eniscogroup@gmail.com</p>
                <p>support@eniscotours.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaLocationDot className="text-brand-red text-xl" />
              <div>
                <p className="font-semibold">Office Address</p>
                <p>Plot 6318 Elm Road, Woodlands, Lusaka, Zambia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold mb-1">Full Name *</label>
              <input
                type="text"
                name="full_name"
                required
                className="w-full p-3 rounded-xl border"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Email *</label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-3 rounded-xl border"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                className="w-full p-3 rounded-xl border"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Subject *</label>
              <input
                type="text"
                name="subject"
                required
                className="w-full p-3 rounded-xl border"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Message *</label>
              <textarea
                name="message"
                rows="5"
                required
                className="w-full p-3 rounded-xl border"
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;