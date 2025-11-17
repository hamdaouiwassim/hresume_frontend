import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, User, Settings, LogOut, ChevronDown, Menu, X, Shield, Briefcase } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import { logout } from '../services/authService';
import { AuthContext } from '../context/AuthContext';


export default function AuthLayout({ children }) {
    const { user , setUser } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    console.log("user inside" , user);
    
    const signout = async () => {
        try {
        const res = await logout();
        // Add logout logic here
        localStorage.clear();
         setUser(null);
        // Redirect to login page after logout
        navigate('/login');
        }catch (error) {
            console.log(error);
            
        }
       
    }
  

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white/95 backdrop-blur-md shadow-lg fixed w-full z-50 border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and primary nav */}
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="flex items-center space-x-2 group">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-110 transition-transform duration-300">
                                        <FileText className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                                        HResume
                                    </span>
                                </Link>
                            </div>
                            {/* Desktop Navigation */}
                            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-2">
                                <Link 
                                    to="/resumes"
                                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        location.pathname === '/resumes' || location.pathname.startsWith('/resume/')
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                                    }`}
                                >
                                    My Resumes
                                </Link>
                                {/* <Link 
                                    to="/templates"
                                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        location.pathname === '/templates'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Templates
                                </Link> */}
                            </div>
                        </div>

                        {/* User dropdown menu */}
                        <div className="hidden md:ml-4 md:flex md:items-center md:space-x-3">
                            <LanguageToggle />
                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none px-2 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-200 group"
                                >
                                    <img
                                        className="h-9 w-9 rounded-full border-2 border-blue-500 group-hover:border-purple-500 transition-colors duration-200 ring-2 ring-offset-2 ring-blue-500/20"
                                        src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                                        alt={user.name}
                                    />
                                    <span className="hidden lg:block font-medium">{user.name}</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown menu */}
                                {isDropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={toggleDropdown}
                                        ></div>
                                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-1.5 bg-white/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 focus:outline-none z-20 animate-in slide-in-from-top-2 duration-200">
                                            <div className="px-3 py-2.5 border-b border-gray-200">
                                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                                onClick={toggleDropdown}
                                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-200"
                                        >
                                                <User className="h-4 w-4 mr-2.5" />
                                            Profile
                                        </Link>
                                        {/* <Link
                                            to="/settings"
                                                onClick={toggleDropdown}
                                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-200"
                                        >
                                                <Settings className="h-4 w-4 mr-2.5" />
                                            Settings
                                        </Link> */}
                                            {user.is_admin && (
                                                <>
                                                    <div className="border-t border-gray-200 my-1"></div>
                                                    <Link
                                                        to="/admin"
                                                        onClick={toggleDropdown}
                                                        className="flex items-center px-3 py-2 text-sm text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200 font-semibold"
                                                    >
                                                        <Shield className="h-4 w-4 mr-2.5" />
                                                        Admin Panel
                                                    </Link>
                                                </>
                                            )}
                                            {user.is_recruiter && (
                                                <Link
                                                    to="/recruiter/resumes"
                                                    onClick={toggleDropdown}
                                                    className="flex items-center px-3 py-2 text-sm text-sky-700 hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 hover:text-sky-600 transition-all duration-200 font-semibold"
                                                >
                                                    <Briefcase className="h-4 w-4 mr-2.5" />
                                                    Recruiter Hub
                                                </Link>
                                            )}
                                            <div className="border-t border-gray-200 my-1"></div>
                                        <button
                                                onClick={() => {signout(); toggleDropdown();}}
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
                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
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

                {/* Mobile menu with smooth animation */}
                <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                    isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="px-3 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md border-t border-gray-200">
                            <Link
                                to="/resumes"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${
                                location.pathname === '/resumes' || location.pathname.startsWith('/resume/')
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                            }`}
                            >
                                My Resumes
                            </Link>
                            <Link
                                to="/templates"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${
                                location.pathname === '/templates'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                            }`}
                            >
                                Templates
                            </Link>
                        
                        {/* Mobile user menu */}
                        <div className="pt-3 border-t border-gray-200 mt-3">
                            <div className="flex items-center px-3 py-2.5 mb-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                                    <img
                                    className="h-10 w-10 rounded-full border-2 border-blue-500"
                                    src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                                        alt={user.name}
                                    />
                                <div className="ml-2.5">
                                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-200"
                                >
                                    <User className="h-4 w-4 mr-2.5" />
                                    Profile
                                </Link>
                                <Link
                                    to="/settings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-200"
                                >
                                    <Settings className="h-4 w-4 mr-2.5" />
                                    Settings
                                </Link>
                                {user.is_admin && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200"
                                    >
                                        <Shield className="h-4 w-4 mr-2.5" />
                                        Admin Panel
                                    </Link>
                                )}
                                {user.is_recruiter && (
                                    <Link
                                        to="/recruiter/resumes"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-sky-700 hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 hover:text-sky-600 transition-all duration-200"
                                    >
                                        <Briefcase className="h-4 w-4 mr-2.5" />
                                        Recruiter Hub
                                    </Link>
                                )}
                                <div className="border-t border-gray-200 my-1.5"></div>
                                <button
                                    onClick={() => {signout(); setIsMobileMenuOpen(false);}}
                                    className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                                >
                                    <LogOut className="h-4 w-4 mr-2.5" />
                                    Sign out
                                </button>
                            </div>
                        </div>
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