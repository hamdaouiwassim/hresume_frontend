
import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mail, MapPin, Phone, ArrowRight, Linkedin, Twitter, Github, Loader2, Check, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import { AuthContext } from '../context/AuthContext';
import { getStats } from '../services/statsService';
import { subscribe } from '../services/subscriberService';
import { toast } from 'sonner';

export default function GuestLayout({ children, navVariant = 'default' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [heroNavScrolled, setHeroNavScrolled] = useState(false);
    const { user , setUser } = useContext(AuthContext);
    const location = useLocation();
    const isHeroNav = navVariant === 'hero' && !heroNavScrolled;
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

    useEffect(() => {
        if (navVariant !== 'hero') {
            setHeroNavScrolled(false);
            return;
        }

        const threshold = 480;
        let ticking = false;

        const update = () => {
            ticking = false;
            const scrolled = window.scrollY > threshold;
            setHeroNavScrolled((prev) => (prev === scrolled ? prev : scrolled));
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [navVariant, location.pathname]);

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
            <nav
                className={`fixed z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ${
                    isHeroNav
                        ? 'guest-nav-hero border-b border-white/10 shadow-lg shadow-black/25'
                        : 'border-b border-gray-200 bg-white shadow-lg'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 group">
                                <img 
                                    src="/logo.png" 
                                    alt="HResume Logo" 
                                    className="h-10 w-auto group-hover:scale-110 transition-transform duration-300"
                                />
                                <span
                                    className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                                        isHeroNav
                                            ? 'from-blue-200 via-purple-200 to-violet-200'
                                            : 'from-blue-600 via-purple-600 to-blue-800'
                                    }`}
                                >
                                    HResume
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-4">
                            <LanguageToggle tone={isHeroNav ? 'dark' : 'light'} />
                           { !user ? (
                            <>
                            <Link 
                                to="/login"
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    isHeroNav
                                        ? 'text-slate-200 hover:bg-white/10 hover:text-white'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                                }`}
                            >
                                <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
                                Get Started
                            </Link>
                            </>
                            ) : (
                                 <Link
                                to="/resumes"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
                                Dashboard
                            </Link>
                            )}

                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center space-x-2 md:hidden">
                            <LanguageToggle tone={isHeroNav ? 'dark' : 'light'} />
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={`inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-inset ${
                                    isHeroNav
                                        ? 'text-slate-200 hover:bg-white/10 hover:text-white focus:ring-violet-400/40'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 focus:ring-blue-500'
                                }`}
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
                    <div
                        className={`space-y-2 border-t px-4 pt-2 pb-4 ${
                            isHeroNav
                                ? 'border-white/10 bg-slate-950/95'
                                : 'border-gray-200 bg-white'
                        }`}
                    >
                        {!user ? (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200 ${
                                        isHeroNav
                                            ? 'text-slate-200 hover:bg-white/10 hover:text-white'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                                    }`}
                                >
                                    <LogIn className={`h-5 w-5 shrink-0 ${isHeroNav ? 'text-violet-300' : 'text-blue-500'}`} aria-hidden />
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg text-center transition-all duration-200"
                                >
                                    <UserPlus className="h-5 w-5 shrink-0" aria-hidden />
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/resumes"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg text-center transition-all duration-200"
                            >
                                <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden />
                                Dashboard
                            </Link>
                        )}
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
                                    <li><Link to="/cover-letter-builder" className="hover:text-white transition">Cover Letter Builder</Link></li>
                                    <li><Link to="/work-certificate" className="hover:text-white transition">Work Certificate</Link></li>
                                    <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
                                    <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white uppercase tracking-[0.2em]">Company</h3>
                                <ul className="mt-4 space-y-4 text-sm text-gray-400">
                                    <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                                    <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                                    <li><Link to="/terms" className="hover:text-white transition">Terms</Link></li>
                                    <li><Link to="/privacy" className="hover:text-white transition">Privacy</Link></li>
                                    <li><Link to="/refund" className="hover:text-white transition">Refunds</Link></li>
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
                            <Link to="/refund" className="hover:text-white transition">Refunds</Link>
                            <span className="text-gray-600">SOC2-ready infrastructure</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}