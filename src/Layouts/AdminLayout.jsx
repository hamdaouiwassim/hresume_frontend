import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Users, Layout, User, LogOut, Menu, X, BarChart3, Settings, FileText, Type, Mail } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import { logout } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout({ children }) {
    const { user, setUser } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const signout = async () => {
        try {
            const res = await logout();
            localStorage.clear();
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.log(error);
        }
    };

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white/95 backdrop-blur-md shadow-lg fixed w-full z-50 border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and primary nav */}
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/admin" className="flex items-center space-x-2 group">
                                    <img
                                        src="/logo.png"
                                        alt="HResume Logo"
                                        className="h-10 w-auto group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent">
                                        Admin Panel
                                    </span>
                                </Link>
                            </div>
                            {/* Desktop Navigation */}
                            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-2">
                                <Link
                                    to="/admin"
                                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${location.pathname === '/admin'
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Link>
                                <Link
                                    to="/admin/users"
                                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/admin/users')
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Users
                                </Link>
                                <Link
                                    to="/admin/templates"
                                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/admin/templates')
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Layout className="h-4 w-4 mr-2" />
                                    Templates
                                </Link>
                                <Link
                                    to="/admin/cover-letter-templates"
                                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/admin/cover-letter-templates')
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    CL Templates
                                </Link>
                                <Link
                                    to="/admin/blog"
                                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/admin/blog')
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Blog
                                </Link>
                                <Link
                                    to="/admin/cvs"
                                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/admin/cvs')
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generated CVs
                                </Link>
                                <Link
                                    to="/admin/fonts"
                                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/admin/fonts')
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                                            : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Type className="h-4 w-4 mr-2" />
                                    Fonts
                                </Link>
                            </div>
                        </div>

                        {/* User dropdown menu */}
                        <div className="hidden md:ml-4 md:flex md:items-center md:space-x-3">
                            <Link
                                to="/admin/profile"
                                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive('/admin/profile')
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
                                    }`}
                            >
                                <User className="h-4 w-4 mr-2" />
                                Profile
                            </Link>
                            <LanguageToggle />
                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none px-2 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-200 group"
                                >
                                    <img
                                        className="h-9 w-9 rounded-full border-2 border-purple-500 group-hover:border-pink-500 transition-colors duration-200 ring-2 ring-offset-2 ring-purple-500/20"
                                        src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                                        alt={user?.name}
                                    />
                                    <span className="hidden lg:block font-medium">{user?.name}</span>
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={toggleDropdown}
                                        ></div>
                                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-1.5 bg-white/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 focus:outline-none z-20 animate-in slide-in-from-top-2 duration-200">
                                            <div className="px-3 py-2.5 border-b border-gray-200">
                                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-purple-600 font-medium">Administrator</p>
                                            </div>
                                            <Link
                                                to="/resumes"
                                                onClick={toggleDropdown}
                                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200"
                                            >
                                                <Settings className="h-4 w-4 mr-2.5" />
                                                Back to App
                                            </Link>
                                            <div className="border-t border-gray-200 my-1"></div>
                                            <button
                                                onClick={() => { signout(); toggleDropdown(); }}
                                                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                                            >
                                                <LogOut className="h-4 w-4 mr-2.5" />
                                                Sign out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden space-x-2">
                            <LanguageToggle />
                            <button
                                onClick={toggleMobileMenu}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all duration-200"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="block h-6 w-6" />
                                ) : (
                                    <Menu className="block h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="px-3 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md border-t border-gray-200">
                        <Link
                            to="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${location.pathname === '/admin'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/admin/users"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${isActive('/admin/users')
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                                }`}
                        >
                            Users
                        </Link>
                        <Link
                            to="/admin/templates"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${isActive('/admin/templates')
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                                }`}
                        >
                            Templates
                        </Link>
                        <Link
                            to="/admin/cover-letter-templates"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${isActive('/admin/cover-letter-templates')
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                                }`}
                        >
                            CL Templates
                        </Link>
                        <Link
                            to="/admin/blog"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${isActive('/admin/blog')
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                                }`}
                        >
                            Blog
                        </Link>
                        <Link
                            to="/admin/cvs"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${isActive('/admin/cvs')
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                                }`}
                        >
                            Generated CVs
                        </Link>
                        <Link
                            to="/admin/fonts"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${isActive('/admin/fonts')
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                                }`}
                        >
                            Fonts
                        </Link>
                        <Link
                            to="/admin/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${isActive('/admin/profile')
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                                }`}
                        >
                            Profile
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="pt-16">
                {children}
            </main>
        </div>
    );
}

