
import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, FileText, Mail, MapPin, Phone, ArrowRight, Linkedin, Twitter, Github, Loader2, Check } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import { AuthContext } from '../context/AuthContext';
import { getStats } from '../services/statsService';
import { subscribe } from '../services/subscriberService';
import { toast } from 'sonner';

export default function GuestLayout({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const { user , setUser } = useContext(AuthContext);
    const [resumeCount, setResumeCount] = useState(null);
    const [subscriptionEmail, setSubscriptionEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getStats();
                if (response.data?.status) {
                    setResumeCount(response.data.data?.total_resumes ?? null);
                }
            } catch (error) {
            }
        };

        fetchStats();
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        
        if (!subscriptionEmail.trim()) {
            toast.error('Please enter a valid email address');
            return;
        }

        setIsSubscribing(true);
        try {
            const response = await subscribe(subscriptionEmail);
            if (response.data.status) {
                toast.success(response.data.message || 'Successfully subscribed to our newsletter!');
                setIsSubscribed(true);
                setSubscriptionEmail('');
                // Reset success state after 3 seconds
                setTimeout(() => setIsSubscribed(false), 3000);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || 
                'Failed to subscribe. Please try again later.'
            );
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <div className="min-h-screen w-full">
            <nav className="bg-white/95 backdrop-blur-md fixed w-full z-50 shadow-lg border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 group">
                                <img 
                                    src="/logo.png" 
                                    alt="HResume Logo" 
                                    className="h-10 w-auto group-hover:scale-110 transition-transform duration-300"
                                />
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                                    HResume
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-4">
                            <LanguageToggle />
                           { !user ? (
                            <>
                            <Link 
                                to="/login"
                                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-all duration-200"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                Get Started
                            </Link>
                            </>
                            ) : (
                                 <Link
                                to="/resumes"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                Dashboard
                            </Link>
                            )}

                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden space-x-2">
                            <LanguageToggle />
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isOpen ? (
                                    <X className="block h-6 w-6" />
                                ) : (
                                    <Menu className="block h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu with smooth animation */}
                <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="px-4 pt-2 pb-4 space-y-2 bg-white/95 backdrop-blur-md border-t border-gray-200">
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg text-center transition-all duration-200"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main content with proper padding for fixed navbar */}
            <main className="pt-16">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-[#05060a] text-gray-300">
                <div className="border-y border-white/5 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <div>
                                <p className="text-sm uppercase tracking-[0.35em] text-gray-400">Weekly insights</p>
                                <h3 className="text-2xl font-semibold text-white mt-2">Stay ahead with job market tactics.</h3>
                            </div>
                            <form onSubmit={handleSubscribe} className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={subscriptionEmail}
                                        onChange={(e) => setSubscriptionEmail(e.target.value)}
                                        placeholder="Enter your work email"
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                        disabled={isSubscribing || isSubscribed}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubscribing || isSubscribed}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[#05060a] font-semibold px-6 py-3 text-sm shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {isSubscribing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Subscribing...
                                        </>
                                    ) : isSubscribed ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Subscribed!
                                        </>
                                    ) : (
                                        <>
                                            Subscribe
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                        {/* Brand Section */}
                        <div className="lg:col-span-2 space-y-5">
                            <div className="flex items-center space-x-2">
                                <img 
                                    src="/logo-light.png" 
                                    alt="HResume Logo" 
                                    className="h-10 w-auto"
                                />
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                                    HResume
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Intelligent resume workflows for teams and talents. Build trust with ATS-friendly exports,
                                branded templates, and live collaboration that helps you sign offers faster.
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div>
                                    <p className="text-white font-semibold text-lg">
                                        {resumeCount !== null ? resumeCount.toLocaleString() : '—'}
                                    </p>
                                    <p>Resumes shipped</p>
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-lg">0</p>
                                    <p>Recruiter partners</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="grid grid-cols-2 gap-8 lg:col-span-2">
                            <div>
                                <h3 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">Product</h3>
                                <ul className="mt-4 space-y-4 text-sm text-gray-400">
                                    <li><Link to="/templates/public" className="hover:text-white transition">Resume Templates</Link></li>
                                    <li><Link to="/templates" className="hover:text-white transition">Template Builder</Link></li>
                                    <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
                                    <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">Company</h3>
                                <ul className="mt-4 space-y-4 text-sm text-gray-400">
                                    <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                                    <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                                    <li><Link to="/privacy" className="hover:text-white transition">Privacy</Link></li>
                                    <li><Link to="/review" className="hover:text-white transition">Reviews</Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">Talk to humans</h3>
                            <div className="space-y-4 text-sm text-gray-400">
                                <a href="mailto:contact@hresume.pro" className="flex items-center gap-3 hover:text-white transition">
                                    <Mail className="h-4 w-4 text-blue-400" />
                                    contact@hresume.pro
                                </a>
                                <a href="tel:+21692045389" className="flex items-center gap-3 hover:text-white transition">
                                    <Phone className="h-4 w-4 text-blue-400" />
                                    +216 92 045 389
                                </a>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-blue-400" />
                                    Remote-first · Available worldwide
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <a href="https://linkedin.com" className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition" aria-label="LinkedIn">
                                    <Linkedin className="h-4 w-4" />
                                </a>
                                <a href="https://twitter.com" className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition" aria-label="Twitter">
                                    <Twitter className="h-4 w-4" />
                                </a>
                                <a href="https://github.com" className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition" aria-label="GitHub">
                                    <Github className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
                        <p>© {new Date().getFullYear()} HResume. Built for ambitious careers.</p>
                        <div className="flex items-center gap-6">
                            <Link to="/terms" className="hover:text-white transition">Terms</Link>
                            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
                            <span className="text-gray-600">SOC2-ready infrastructure</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}