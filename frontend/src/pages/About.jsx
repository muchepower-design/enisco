import { FaCheckCircle } from 'react-icons/fa';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="glass-card p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-black mb-6">About Enisco</h1>
        <p className="text-lg text-gray-600 mb-6">
          Enisco Transport Car Hire and Travels Ltd is a premier provider of integrated travel and insurance solutions 
          based in Lusaka, Zambia. We bridge the gap between clients and service providers, ensuring seamless access 
          to flight ticketing, airport transfers, car hire, insurance, and visa assistance.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To make travel and insurance services accessible, transparent, and hassle‑free for everyone, especially 
              those who face barriers to digital access. We handle the complexity so you can focus on your journey.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-600">
              To become Zambia’s most trusted travel and insurance concierge, known for reliability, integrity, 
              and customer‑centric innovation.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Why Choose Enisco?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Personalised assistance for every client",
              "Online payments with multiple options (card, mobile money)",
              "Expert support for air ticketing, visas, and insurance",
              "Reliable airport transfers and car hire",
              "Transparent service fees – no hidden costs",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <FaCheckCircle className="text-brand-red" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 p-6 bg-red-50 rounded-2xl">
          <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
          <p>📞 +260 975 074 272 / +260 977 492 911</p>
          <p>✉️ eniscogroup@gmail.com</p>
          <p>📍 Plot 6318 Elm Road, Woodlands, Lusaka, Zambia</p>
        </div>
      </div>
    </div>
  );
};

export default About;