import { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, Users, FileText, Sparkles, Menu, X, LogOut, UserCircle, ChevronDown } from "lucide-react";
import LanguageToggle from "../components/LanguageToggle";
import { logout } from "../services/authService";
import { AuthContext } from "../context/AuthContext";

export default function RecruiterLayout({ children }) {
  const { user, setUser } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // ignore
    } finally {
      localStorage.clear();
      setUser(null);
      navigate("/login");
    }
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navLinks = [
    { path: "/recruiter/resumes", label: "Talent Pool", icon: Users },
    { path: "/recruiter/templates", label: "Template Proposals", icon: FileText },
    { path: "/recruiter/profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link to="/recruiter/resumes" className="flex items-center space-x-2 group">
                <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-sky-500/40 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Recruiter Hub
                  </p>
                  <p className="text-lg font-semibold text-slate-900">Talent Dashboard</p>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(path)
                      ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/50"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-3" ref={profileMenuRef}>
              <LanguageToggle />
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="flex items-center space-x-3 px-3 py-2 bg-white rounded-full border border-slate-200 shadow-sm hover:border-sky-200 transition-colors"
                >
                  <img
                    src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=recruiter"}
                    className="h-10 w-10 rounded-full border-2 border-sky-100"
                    alt={user?.name}
                  />
                  <div className="text-sm text-left">
                    <p className="font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-slate-500 text-xs flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-sky-500" />
                      Recruiter
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-60 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/recruiter/profile"
                      className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserCircle className="h-4 w-4 mr-3 text-sky-600" />
                      Recruiter Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <LanguageToggle />
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-screen" : "max-h-0"
          }`}
        >
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white/95 border-t border-slate-200">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                  isActive(path)
                    ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
                }`}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg text-base font-semibold text-red-600 bg-red-50 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="py-10">{children}</main>
    </div>
  );
}

