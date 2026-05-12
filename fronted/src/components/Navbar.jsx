import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Info,
  Mail,
  Menu,
  X,
  Search,
  Heart,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // ── Navigation items based on role ──────────────────────────────────────────
  const getNavItems = () => {
    if (!user) {
      // Guest navigation
      return [
        { path: "/", label: "Home", icon: Home },
        { path: "/about", label: "About", icon: Info },
        { path: "/marketplace-rules", label: "Rules", icon: FileText },
        { path: "/contact", label: "Contact", icon: Mail },
      ];
    }

    if (user.role === "customer") {
      // Customer navigation
      return [
        { path: "/", label: "Home", icon: Home },
        { path: "/dashboard", label: "Dashboard", icon: ClipboardList },
        { path: "/about", label: "About", icon: Info },
        { path: "/marketplace-rules", label: "Rules", icon: FileText },
        { path: "/contact", label: "Contact", icon: Mail },
      ];
    }

    if (user.role === "vendor") {
      return [
        { path: "/", label: "Home", icon: Home },
        {
          path: "/vendor/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        { path: "/about", label: "About", icon: Info },
        { path: "/marketplace-rules", label: "Rules", icon: FileText },
        { path: "/contact", label: "Contact", icon: Mail },
      ];
    }

    if (user.role === "admin") {
      return [
        { path: "/", label: "Home", icon: Home },
        { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { path: "/about", label: "About", icon: Info },
        { path: "/marketplace-rules", label: "Rules", icon: FileText },
        { path: "/contact", label: "Contact", icon: Mail },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const path = location.pathname;
  if (
    path === "/auth" ||
    path === "/login" ||
    path === "/signup" ||
    path.startsWith("/login/") ||
    path.startsWith("/signup/")
  ) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ────────────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all">
              <span className="text-white text-lg">🔥</span>
            </div>
            <span
              className="text-white font-black text-xl hidden sm:block tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              FlavorCraft
            </span>
          </Link>

          {/* ── Desktop Navigation ─────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* ── Right Actions ──────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Cart button (customers only) */}
            {user?.role === "customer" && (
              <button
                onClick={openDrawer}
                className="relative w-10 h-10 rounded-xl bg-[#18181b] border border-white/[0.06] hover:border-orange-500/30 flex items-center justify-center text-gray-400 hover:text-orange-400 transition-all"
              >
                <ShoppingBag size={17} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-orange-500/50">
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth buttons or Profile dropdown */}
            {!user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-orange-500/30"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2.5 bg-[#18181b]/90 backdrop-blur-md border border-white/[0.08] hover:border-orange-500/25 rounded-xl pl-2 pr-3 py-1.5 transition-all shadow-lg shadow-black/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/30 to-orange-600/10 border border-orange-500/35 flex items-center justify-center shrink-0">
                    <span className="text-orange-300 text-sm font-bold">
                      {(user.name || user.email)?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:flex flex-col items-start min-w-0 text-left">
                    <span className="text-white text-sm font-semibold leading-tight max-w-[140px] truncate">
                      {user.name || user.email.split("@")[0]}
                    </span>
                    <span className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">
                      Account
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 shrink-0 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Profile dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-[#121214]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/70 overflow-hidden py-1.5 ring-1 ring-white/[0.04]">
                    {/* User info */}
                    <div className="px-4 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                      <p className="text-white text-sm font-semibold truncate">
                        {user.name || "Member"}
                      </p>
                      <p className="text-gray-500 text-xs truncate mt-0.5">
                        {user.email}
                      </p>
                      <p className="inline-flex mt-2 text-[10px] font-bold uppercase tracking-wider text-orange-400/90 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
                        {user.role}
                      </p>
                    </div>

                    {/* Role-specific links */}
                    {user.role === "customer" && (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] text-sm transition-colors"
                        >
                          <ClipboardList size={14} /> Dashboard
                        </Link>
                      </>
                    )}

                    {user.role === "vendor" && (
                      <>
                        <Link
                          to="/vendor/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] text-sm transition-colors"
                        >
                          <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        <Link
                          to="/marketplace-rules"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] text-sm transition-colors"
                        >
                          <FileText size={14} /> Marketplace rules
                        </Link>
                      </>
                    )}

                    {user.role === "admin" && (
                      <>
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] text-sm transition-colors"
                        >
                          <LayoutDashboard size={14} /> Admin overview
                        </Link>
                        <Link
                          to="/admin/support"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] text-sm transition-colors"
                        >
                          <Mail size={14} /> Support inbox
                        </Link>
                      </>
                    )}

                    {/* About & Contact for all */}
                    <div className="border-t border-white/[0.06] mt-1.5 pt-1.5">
                      <Link
                        to="/about"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] text-sm transition-colors"
                      >
                        <Info size={14} /> About Us
                      </Link>
                      <Link
                        to="/marketplace-rules"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] text-sm transition-colors"
                      >
                        <FileText size={14} /> Marketplace rules
                      </Link>
                      <Link
                        to="/contact"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] text-sm transition-colors"
                      >
                        <Mail size={14} /> Contact
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-white/[0.06] mt-1.5 pt-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.06] text-sm transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl bg-[#18181b] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ────────────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}

            {!user && (
              <>
                <Link
                  to="/about"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all"
                >
                  <Info size={15} />
                  About
                </Link>
                <Link
                  to="/marketplace-rules"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all"
                >
                  <FileText size={15} />
                  Rules
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all"
                >
                  <Mail size={15} />
                  Contact
                </Link>
                <div className="border-t border-white/[0.06] mt-2 pt-2">
                  <Link
                    to="/auth"
                    className="block w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl text-center transition-all"
                  >
                    Login / Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
