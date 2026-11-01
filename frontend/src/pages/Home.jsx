import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
    FaPlaneDeparture,
    FaVanShuttle,
    FaShieldHalved,
    FaCarSide,
    FaBriefcase,
    FaUsers,
    FaArrowRight,
    FaPlane,
    FaPhone,
    FaEnvelope,
    FaLocationDot,
    FaNewspaper,
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaTag,
    FaStar,
    FaGlobe,
    FaUserTie,
} from 'react-icons/fa6';
import { FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';

const Home = () => {
    const [featuredNews, setFeaturedNews] = useState([]);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [touchStartX, setTouchStartX] = useState(null);
    const carouselRef = useRef(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}/${path}`;
    };

    useEffect(() => {
        //api.get('/api/news/featured?limit=5')
        api.get('/api/news/featured')
            .then(res => setFeaturedNews(res.data))
            .catch(err => console.error('Failed to load news', err));
    }, []);

    // Auto-slide with pause on hover
    useEffect(() => {
        if (featuredNews.length === 0 || isPaused) return;
        const interval = setInterval(() => {
            setCurrentNewsIndex((prev) => (prev + 1) % featuredNews.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [featuredNews, isPaused]);

    const goToSlide = (index) => {
        setCurrentNewsIndex(index);
    };

    const goToPrev = () => {
        setCurrentNewsIndex((prev) =>
            prev === 0 ? featuredNews.length - 1 : prev - 1
        );
    };

    const goToNext = () => {
        setCurrentNewsIndex((prev) =>
            (prev + 1) % featuredNews.length
        );
    };

    // Touch handlers for mobile swipe
    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (!touchStartX) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goToNext();
            else goToPrev();
        }
        setTouchStartX(null);
    };

    const currentItem = featuredNews[currentNewsIndex];

    // Service features data
    const features = [
        { icon: FaPlaneDeparture, title: 'Flight Ticketing', desc: 'Domestic & international' },
        { icon: FaVanShuttle, title: 'Airport Transport', desc: 'Pickups & drop-offs' },
        { icon: FaShieldHalved, title: 'Insurance', desc: 'Third party & comprehensive' },
        { icon: FaGlobe, title: 'Visa Assistance', desc: 'Visa acquisition support' },
        { icon: FaUserTie, title: 'Tour Packages', desc: 'Tour Packages for local and internatioal Tourists' },
        { icon: FaCarSide, title: 'Car Hire', desc: 'Short & long term' }
    ];

    return (
        <div className="overflow-x-hidden">
            {/* ========== HERO SECTION ========== */}
            <section className="relative min-h-[820px] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand-red/20">
                {/* Animated background particles / shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/5 rounded-full blur-3xl" />

                    {/* Floating icons */}
                    <div className="absolute top-20 left-[10%] text-brand-red/20 text-6xl animate-float delay-0">
                        <FaPlaneDeparture />
                    </div>
                    <div className="absolute bottom-32 right-[8%] text-brand-red/15 text-7xl animate-float delay-700">
                        <FaShieldHalved />
                    </div>
                    <div className="absolute top-1/3 right-[15%] text-brand-red/10 text-5xl animate-float delay-1000">
                        <FaVanShuttle />
                    </div>
                    <div className="absolute bottom-1/4 left-[5%] text-brand-red/10 text-4xl animate-float delay-500">
                        <FaCarSide />
                    </div>
                </div>

                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-5 gap-12 items-center">
                        {/* Left content - takes 3/5 on large screens */}
                        <div className="lg:col-span-3">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-bold mb-6 shadow-lg">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-red" />
                                </span>
                                Flights · Airport Transport · Insurance · Car Hire · Visa · Tour Guide
                            </div>

                            {/* Heading */}
                            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.05] tracking-tight mb-6">
                                <span className="text-white">Your journey,</span>
                                <br />
                                <span className="bg-gradient-to-r from-brand-red via-red-400 to-orange-400 bg-clip-text text-transparent">
                                    handled with care.
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-white/80 max-w-xl mb-8 leading-relaxed">
                                Enisco supports domestic and international air ticketing, airport pickups
                                and drop-offs, vehicle insurance, and reliable car hire services for
                                individuals, families, companies, corporate guests, and delegations.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 mb-10">
                                <Link
                                    to="/travel-request"
                                    className="group bg-brand-red hover:bg-brand-red-dark text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3 shadow-lg shadow-brand-red/25 hover:shadow-brand-red/40"
                                >
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    Start Transaction
                                </Link>
                                <Link
                                    to="#services"
                                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 inline-flex items-center gap-3 border border-white/20"
                                >
                                    <FaPlane />
                                    Explore Services
                                </Link>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex items-center gap-6 text-white/60 text-sm">
                                <span className="flex items-center gap-2">
                                    <FaCheckCircle className="text-brand-red" />
                                    Trusted since 2018
                                </span>
                                <span className="w-px h-6 bg-white/20" />
                                <span className="flex items-center gap-2">
                                    <FaStar className="text-yellow-400" />
                                    4.9/5 rating
                                </span>
                                <span className="w-px h-6 bg-white/20" />
                                <span className="flex items-center gap-2">
                                    <FaUsers className="text-brand-red" />
                                    5k+ clients
                                </span>
                            </div>
                        </div>

                        {/* Right content - News Carousel - takes 2/5 on large screens */}
                        <div className="lg:col-span-2">
                            {featuredNews.length > 0 && currentItem && (
                                <div
                                    className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/30 bg-white/5 backdrop-blur-xl border border-white/10"
                                    onMouseEnter={() => setIsPaused(true)}
                                    onMouseLeave={() => setIsPaused(false)}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                    ref={carouselRef}
                                >
                                    {/* News Card */}
                                    <div className="relative">
                                        {/* Image or placeholder */}
                                        <div className="relative h-48 md:h-52 overflow-hidden">
                                            {currentItem.image_url ? (
                                                <img
                                                    src={getFileUrl(currentItem.image_url)}
                                                    alt={currentItem.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                                />
                                            ) : currentItem.video_url ? (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                                                    <div className="w-16 h-16 rounded-full bg-brand-red/20 flex items-center justify-center">
                                                        <div className="w-12 h-12 rounded-full bg-brand-red flex items-center justify-center">
                                                            <span className="text-white text-xl ml-1">▶</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-brand-red/20 to-slate-700 flex items-center justify-center">
                                                    <FaNewspaper className="text-5xl text-brand-red/40" />
                                                </div>
                                            )}

                                            {/* Category badge */}
                                            {currentItem.category && (
                                                <span className="absolute top-3 left-3 bg-brand-red/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                                    <FaTag className="text-[10px]" />
                                                    {currentItem.category}
                                                </span>
                                            )}

                                            {/* Date badge */}
                                            <span className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white/90 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                                <FaClock className="text-[10px]" />
                                                {new Date(currentItem.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <Link
                                                to={`/news/${currentItem.id}`}
                                                className="block group"
                                            >
                                                <h3 className="font-bold text-lg text-white leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                                                    {currentItem.title}
                                                </h3>
                                                <p className="text-sm text-white/60 mt-2 line-clamp-2 leading-relaxed">
                                                    {currentItem.content}
                                                </p>
                                            </Link>

                                            {/* Read more link */}
                                            <Link
                                                to={`/news/${currentItem.id}`}
                                                className="inline-flex items-center gap-1.5 text-brand-red text-sm font-semibold mt-3 hover:gap-3 transition-all"
                                            >
                                                Read More
                                                <FaArrowRight className="text-xs" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Carousel Controls */}
                                    <div className="flex items-center justify-between px-5 pb-5">
                                        {/* Dots */}
                                        <div className="flex gap-1.5">
                                            {featuredNews.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => goToSlide(idx)}
                                                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentNewsIndex
                                                            ? 'w-8 bg-brand-red'
                                                            : 'w-2 bg-white/20 hover:bg-white/40'
                                                        }`}
                                                    aria-label={`Go to slide ${idx + 1}`}
                                                />
                                            ))}
                                        </div>

                                        {/* Nav buttons */}
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={goToPrev}
                                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all flex items-center justify-center"
                                                aria-label="Previous news"
                                            >
                                                <FaChevronLeft className="text-sm" />
                                            </button>
                                            <button
                                                onClick={goToNext}
                                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all flex items-center justify-center"
                                                aria-label="Next news"
                                            >
                                                <FaChevronRight className="text-sm" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Slide counter */}
                                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-2.5 py-1 rounded-full">
                                        {currentNewsIndex + 1} / {featuredNews.length}
                                    </div>
                                </div>
                            )}

                            {/* Fallback when no news */}
                            {featuredNews.length === 0 && (
                                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
                                    <FaNewspaper className="text-4xl text-white/20 mx-auto mb-4" />
                                    <p className="text-white/40">No news available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ========== FEATURES GRID - Single Horizontal Row ========== */}
                    <div className="mt-14 pt-6 border-t border-white/10">
                        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                            {features.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="group flex items-center gap-3 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-brand-red/40 rounded-2xl px-4 py-3 transition-all duration-300 cursor-default min-w-[140px] flex-1 max-w-[200px]"
                                >
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-red/20 group-hover:bg-brand-red/30 flex items-center justify-center transition-colors">
                                        <item.icon className="text-brand-red text-lg group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-sm font-bold truncate">{item.title}</h4>
                                        <p className="text-white/50 text-[11px] truncate">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== REST OF THE PAGE (SERVICES, ETC) ========== */}
            <div id="services" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    {/* Flight Ticketing */}
                    <div className="grid md:grid-cols-2 gap-8 items-center mb-20">
                        <div className="glass-card p-8">
                            <div className="text-brand-red font-bold mb-2">Flight Ticketing</div>
                            <h2 className="text-4xl font-black mb-4">Domestic and international air ticketing support.</h2>
                            <p className="text-gray-600 mb-6">Let Enisco assist you with flight arrangements, travel planning, and ticketing support for local and international journeys.</p>
                            <div className="space-y-3 mb-8">
                                {['Domestic flight assistance', 'International ticketing support', 'Corporate and delegation travel support'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 font-semibold"><FaCheckCircle className="text-brand-red" /> {item}</div>
                                ))}
                            </div>
                            <Link to="/travel-request?service=flight_ticketing" className="btn-primary">Request Flight Quote</Link>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <img src="/assets/images/airTicketing.png" alt="Air ticketing" className="w-full h-96 object-cover" />
                        </div>
                    </div>

                    {/* Airport Transfer */}
                    <div className="grid md:grid-cols-2 gap-8 items-center mb-20">
                        <div className="order-2 md:order-1 rounded-2xl overflow-hidden shadow-xl">
                            <img src="/assets/images/pickUps.png" alt="Airport transfer" className="w-full h-96 object-cover" />
                        </div>
                        <div className="glass-card p-8 order-1 md:order-2">
                            <div className="text-brand-red font-bold mb-2">Airport Transfer</div>
                            <h2 className="text-4xl font-black mb-4">Airport pickups and drop-offs without stress.</h2>
                            <p className="text-gray-600 mb-6">We support individuals, families, corporate guests, and delegations with organized airport transfers.</p>
                            <div className="space-y-3 mb-8">
                                {['Airport pickups and drop-offs', 'Family, corporate and delegation transfers', 'Professional travel coordination'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 font-semibold"><FaCheckCircle className="text-brand-red" /> {item}</div>
                                ))}
                            </div>
                            <Link to="/travel-request?service=airport_transfer" className="btn-primary">Book Airport Transfer</Link>
                        </div>
                    </div>

                    {/* Insurance Services */}
                    <div className="grid md:grid-cols-2 gap-8 items-center mb-20">
                        <div className="glass-card p-8">
                            <div className="text-brand-red font-bold mb-2">Insurance Services</div>
                            <h2 className="text-4xl font-black mb-4">Buy or renew vehicle insurance with clear duration options.</h2>
                            <p className="text-gray-600 mb-6">Enisco helps customers request vehicle insurance by providing car details, number plate, insurance type, start date, and number of 90-day quarters.</p>
                            <div className="space-y-3 mb-8">
                                {['Third party insurance', 'Comprehensive insurance requests', '90-day quarter-based cover duration'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 font-semibold"><FaCheckCircle className="text-brand-red" /> {item}</div>
                                ))}
                            </div>
                            <Link to="/insurance-request" className="btn-primary">Buy / Renew Insurance</Link>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <img src="/assets/images/carKeys.png" alt="Insurance" className="w-full h-96 object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Car Hire Section */}
            <div className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <div className="text-brand-red font-bold mb-2">Car Hire</div>
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Reliable vehicles for personal and business movement</h2>
                        <p className="text-gray-600 text-lg">Enisco offers car hire support for short-term, long-term, corporate, and personal travel needs.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: FaCarSide, title: 'Car Hire Solutions', img: '/assets/images/carr1.png', desc: 'Flexible vehicle rental support for business trips, family travel, executive movement.' },
                            { icon: FaBriefcase, title: 'Corporate Hire', img: '/assets/images/car2.png', desc: 'Transport support for meetings, conferences, guests, and company movement.' },
                            { icon: FaUsers, title: 'Personal Hire', img: '/assets/images/car1.png', desc: 'Vehicle hire for personal movement, family errands, events, and travel.' }
                        ].map((item, idx) => (
                            <div key={idx} className="glass-card overflow-hidden">
                                <img src={item.img} alt={item.title} className="w-full h-64 object-cover" />
                                <div className="p-6">
                                    <item.icon className="text-brand-red text-3xl mb-3" />
                                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-gray-600">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <div className="text-brand-red font-bold mb-2">Payments</div>
                    <h2 className="text-4xl font-black mb-4">Payment options</h2>
                    <p className="text-gray-600 mb-8">Choose card or mobile money payment. Secure online transactions.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {['Visa', 'Mastercard', 'Airtel Money', 'MTN Money', 'Zamtel Money'].map((method, i) => (
                            <span key={i} className="bg-white border-l-4 border-brand-red px-6 py-3 rounded-full font-bold shadow-md">{method}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="py-20">
                <div className="container mx-auto px-4">
                    <div className="glass-card p-8 md:p-12 grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-3xl font-black mb-4">Need assistance?</h2>
                            <p className="text-gray-600">Our team can help you choose the right service before you submit your request.</p>
                        </div>
                        <div>
                            <p className="flex items-center gap-2 mb-2"><FaPhone className="text-brand-red" /> <strong>Phone:</strong> +260 975 074 272 / +260 977 492 911</p>
                            <p className="flex items-center gap-2 mb-2"><FaEnvelope className="text-brand-red" /> <strong>Email:</strong> eniscogroup@gmail.com</p>
                            <p className="flex items-center gap-2"><FaLocationDot className="text-brand-red" /> <strong>Address:</strong> Plot 6318 Elm Road, Woodlands, Lusaka</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;