import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Shield,
    Users,
    Layout,
    User,
    LogOut,
    Menu,
    X,
    BarChart3,
    Settings,
    FileText,
    Type,
    Mail,
    ChevronRight,
    Search,
    Bell
} from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import { logout } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout({ children }) {
    const { user, setUser } = useContext(AuthContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Handle responsiveness
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const signout = async () => {
        try {
            await logout();
            localStorage.clear();
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: '/admin', icon: BarChart3, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/templates', icon: Layout, label: 'Templates' },
        { path: '/admin/cover-letter-templates', icon: Mail, label: 'CL Templates' },
        { path: '/admin/blog', icon: FileText, label: 'Blog' },
        { path: '/admin/cvs', icon: FileText, label: 'Generated CVs' },
        { path: '/admin/fonts', icon: Type, label: 'Fonts' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                        <Link to="/admin" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-105 transition-transform duration-300">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                Admin Panel
                            </span>
                        </Link>
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                                        ? 'bg-purple-50 text-purple-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <item.icon className={`h-5 w-5 mr-3 transition-colors duration-200 ${isActive(item.path) ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                                        }`} />
                                    {item.label}
                                </div>
                                {isActive(item.path) && <ChevronRight className="h-4 w-4" />}
                            </Link>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <Link
                            to="/admin/profile"
                            className={`flex items-center p-3 rounded-xl transition-all duration-200 mb-2 ${isActive('/admin/profile')
                                    ? 'bg-white shadow-md ring-1 ring-purple-100'
                                    : 'hover:bg-white hover:shadow-sm'
                                }`}
                        >
                            <div className="relative">
                                <img
                                    className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
                                    src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"}
                                    alt={user?.name}
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-purple-600 font-medium capitalize">Administrator</p>
                            </div>
                        </Link>

                        <div className="flex gap-2">
                            <button
                                onClick={signout}
                                className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign out
                            </button>
                            <div className="p-1 bg-white border border-gray-200 rounded-lg">
                                <LanguageToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-72' : ''}`}>
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 px-4 md:px-8">
                    <div className="h-full flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 mr-4"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="hidden md:flex items-center px-4 py-2 bg-gray-100 rounded-xl border border-gray-200 group focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:bg-white transition-all duration-200">
                                <Search className="h-4 w-4 text-gray-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none focus:outline-none text-sm w-64 text-gray-700 placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 md:space-x-4">
                            <Link
                                to="/resumes"
                                className="hidden sm:flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200"
                            >
                                <Settings className="h-4 w-4 mr-2 text-gray-400" />
                                Back to App
                            </Link>

                            <button className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 relative group transition-all duration-200">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-600 rounded-full ring-2 ring-white"></span>
                            </button>

                            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

                            <img
                                className="h-10 w-10 rounded-xl border border-gray-100 shadow-sm cursor-pointer lg:hidden"
                                src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"}
                                alt={user?.name}
                                onClick={() => navigate('/admin/profile')}
                            />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

