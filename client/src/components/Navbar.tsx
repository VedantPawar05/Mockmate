import { useEffect, useRef, useState } from "react";
import { logoutUser, getUser } from "@/api/user.api";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { Notification } from "@/vite-env";
import {
  LayoutDashboard, BarChart3, Trophy, FileText,
  CreditCard, History, LogOut, Menu, X, Plus, Zap, ChevronRight, Search, BrainCircuit,
} from "lucide-react";
import CommandPalette from "./CommandPalette";

const NAV_LINKS = [
  { label: "Dashboard",   to: "/dashboard",       icon: LayoutDashboard, desc: "Overview & stats" },
  { label: "Analyzer",    to: "/analyzer",        icon: BarChart3,       desc: "AI performance insights" },
  { label: "Leaderboard", to: "/leaderboard",     icon: Trophy,          desc: "Global rankings" },
  { label: "Resume",      to: "/resume-analyzer", icon: FileText,        desc: "Analyze your resume" },
  { label: "Flashcards",  to: "/flashcards",      icon: CreditCard,      desc: "MCQ review cards" },
  { label: "History",     to: "/history",         icon: History,         desc: "Past interviews" },
];

const Navbar = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { addNotification } = useNotification();

  const [open,      setOpen]      = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const [userName,  setUserName]  = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  // Custom interactive states for command palette & sliding active pill
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const navRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    getUser().then((u: any) => {
      setUserName(u?.name || u?.email?.split("@")[0] || "User");
      setUserEmail(u?.email || "");
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dynamic Sliding Pill tracking
  useEffect(() => {
    const updatePill = () => {
      const activeLink = navRefs.current[location.pathname];
      if (activeLink) {
        setPillStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
          opacity: 1,
        });
      } else {
        setPillStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };
    const timer = setTimeout(updatePill, 50);
    window.addEventListener("resize", updatePill);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePill);
    };
  }, [location.pathname]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      addNotification({ id: Date.now().toString(), type: "success", message: "Logged out successfully" } as Notification);
      navigate("/login");
    } catch { console.error("Logout failed"); }
  };

  const isActive = (to: string) => location.pathname === to;

  const initials = userName
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <>
      {/* ── Floating Topbar ───────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-2xl shadow-black/60" : ""
        }`}
      >
        <div className="mx-4 mt-3">
          <div className={`glass rounded-2xl px-6 py-3.5 flex items-center justify-between transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/8 relative overflow-hidden ${
            scrolled ? "glass-strong border-white/12" : ""
          }`}>
            
            {/* Left side: Hamburger button + Logo */}
            <div className="flex items-center gap-3.5">
              {/* Hamburger */}
              <button
                id="navbar-hamburger"
                onClick={() => setOpen(true)}
                className="glass-btn w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-4 h-4 text-white" />
              </button>

              {/* Logo */}
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  {/* Outer breathing neon glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-violet-500 via-indigo-500 to-fuchsia-500 opacity-40 blur-[6px] group-hover:opacity-75 transition-opacity duration-300 animate-pulse" />
                  
                  {/* Outer gradient border ring */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Glassmorphic icon container */}
                  <div className="relative w-8 h-8 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <BrainCircuit className="w-4.5 h-4.5 text-violet-400 group-hover:text-fuchsia-400 transition-colors duration-300" />
                  </div>
                </div>
                <span className="font-black text-lg tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-violet-300 group-hover:to-fuchsia-300 transition-all duration-300">
                  MockMate
                </span>
              </Link>
            </div>

            {/* Center: quick nav pills (desktop with fluid sliding pill) */}
            <nav className="hidden lg:flex items-center gap-1 bg-white/4 border border-white/6 rounded-xl p-0.5 relative">
              {/* Sliding dynamic background pill */}
              <div
                className="absolute bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg shadow-[0_4px_16px_rgba(124,58,237,0.35)] border border-violet-500/30 transition-all duration-300 ease-out pointer-events-none"
                style={{
                  left: `${pillStyle.left}px`,
                  width: `${pillStyle.width}px`,
                  height: "calc(100% - 4px)",
                  top: "2px",
                  opacity: pillStyle.opacity,
                }}
              />

              {NAV_LINKS.map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  ref={(el) => { navRefs.current[to] = el; }}
                  className={`relative z-10 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors duration-300 ${
                    isActive(to)
                      ? "text-white font-bold"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {/* Right */}
            <div className="flex items-center gap-3">
              {/* Command Search Bar Pill */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 text-white/45 hover:text-white/70 transition-all text-xs font-semibold shadow-inner"
              >
                <Search className="w-3.5 h-3.5 text-white/50" />
                <span>Search...</span>
                <kbd className="hidden lg:inline-flex items-center h-4 select-none px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono-tech border border-white/10 leading-none">
                  Ctrl K
                </kbd>
              </button>

              {/* New Interview CTA */}
              <Link
                to="/create"
                id="navbar-start-interview"
                className="hidden sm:flex items-center gap-2 glass-btn-primary px-4 py-2 rounded-xl text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                New Interview
              </Link>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg shadow-violet-500/20 border border-white/10">
                {initials}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Sidebar Overlay ───────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 left-0 h-full w-80 glass-strong border-r border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">{userName}</p>
                <p className="text-white/40 text-xs truncate max-w-[160px]">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="glass-btn w-8 h-8 rounded-lg flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <p className="text-white/25 text-xs font-mono-tech px-3 py-2">Navigation</p>
            {NAV_LINKS.map(({ label, to, icon: Icon, desc }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive(to)
                    ? "bg-white/10 border border-white/12"
                    : "hover:bg-white/6 border border-transparent"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isActive(to) ? "bg-white/15" : "bg-white/6 group-hover:bg-white/10"
                }`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isActive(to) ? "text-white" : "text-white/70 group-hover:text-white"}`}>
                    {label}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">{desc}</p>
                </div>
                {isActive(to) && <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />}
              </Link>
            ))}
          </nav>

          {/* New Interview CTA */}
          <div className="p-4 border-t border-white/8">
            <Link
              to="/create"
              className="flex items-center justify-center gap-2 glass-btn-primary w-full py-3 rounded-xl text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Start New Interview
            </Link>
          </div>

          {/* Logout */}
          <div className="p-4 pt-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Command Search Palette overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
