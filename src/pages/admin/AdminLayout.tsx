import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  FileText,
  Award,
  Package,
  Menu,
  X,
  Briefcase,
  Receipt,
  FileSpreadsheet,
  Wallet,
  Building2,
  PieChart,
} from "lucide-react";
import { ThemeToggle } from "../../components/theme-toggle";
import { SEO } from "../../components/common/seo";

const navItems = [
  { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Form Leads", path: "/admin/contacts", icon: MessageSquare },
  { name: "Website Content", path: "/admin/content", icon: Settings },
  { name: "Community Projects", path: "/admin/community/projects", icon: Users },
  { name: "Job Openings", path: "/admin/jobs", icon: Briefcase },
  { name: "Job Applications", path: "/admin/applications", icon: Users },
  { name: "Offer Letters", path: "/admin/offer-letters", icon: FileText },
  { name: "Intern Certificates", path: "/admin/certificates", icon: Award },
];

const billingNavItems = [
  { name: "Billing Dashboard", path: "/admin/billing", icon: PieChart },
  { name: "Clients", path: "/admin/clients", icon: Building2 },
  { name: "Quotations", path: "/admin/quotations", icon: FileSpreadsheet },
  { name: "Invoices", path: "/admin/invoices", icon: Receipt },
  { name: "Payments", path: "/admin/payments", icon: Wallet },
  { name: "Billing Settings", path: "/admin/billing-settings", icon: Settings },
];

function pageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop() || "dashboard";
  return segment.replace(/-/g, " ");
}

function SidebarNav({
  pathname,
  onNavigate,
  onLogout,
  showClose,
  onClose,
  showTheme,
}: {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
  showClose?: boolean;
  onClose?: () => void;
  showTheme?: boolean;
}) {
  return (
    <>
      <div className="h-16 sm:h-20 flex items-center justify-between px-5 sm:px-8 border-b border-evolw-gray-200 dark:border-white/10">
        <Link
          to="/admin/dashboard"
          className="text-xl sm:text-2xl font-bold tracking-tight text-evolw-black dark:text-white hover:text-evolw-accent transition-colors"
          onClick={onNavigate}
        >
          EVOLW
          <span className="ml-2 text-[10px] sm:text-xs font-semibold px-2 py-0.5 bg-evolw-gray-100 dark:bg-white/10 text-evolw-gray-600 dark:text-evolw-gray-300 rounded-md align-middle">
            ADMIN
          </span>
        </Link>
        {showClose && (
          <button
            type="button"
            className="p-2 rounded-xl text-evolw-gray-500 dark:text-evolw-gray-400 hover:bg-evolw-gray-100 dark:hover:bg-white/10"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 sm:p-6 space-y-1 overflow-y-auto">
        <p className="text-[10px] sm:text-xs font-semibold text-evolw-gray-400 tracking-wider uppercase mb-3 px-2">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-evolw-accent text-white shadow-md shadow-evolw-accent/20"
                  : "text-evolw-gray-700 dark:text-evolw-gray-200 hover:bg-evolw-gray-100 dark:hover:bg-white/10"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm sm:text-base">{item.name}</span>
            </Link>
          );
        })}

        <p className="text-[10px] sm:text-xs font-bold text-evolw-black dark:text-white tracking-[0.14em] uppercase mt-6 mb-3 px-2 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-evolw-accent" />
          Billing & Finance
        </p>
        {billingNavItems.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-evolw-accent text-white shadow-md shadow-evolw-accent/20"
                  : "text-evolw-gray-700 dark:text-evolw-gray-200 hover:bg-evolw-gray-100 dark:hover:bg-white/10"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm sm:text-base">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 sm:p-6 border-t border-evolw-gray-200 dark:border-white/10 space-y-3">
        {showTheme && (
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-evolw-gray-500 dark:text-evolw-gray-400">Theme</span>
            <ThemeToggle />
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Secure Logout</span>
        </button>
      </div>
    </>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("evolw_admin_auth");
    if (!isAuthenticated) {
      navigate("/admin");
    }
  }, [navigate]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const handleLogout = () => {
    localStorage.removeItem("evolw_admin_auth");
    navigate("/admin");
  };

  return (
    <div className="flex h-[100dvh] bg-evolw-gray-50 dark:bg-evolw-black overflow-hidden font-sans text-evolw-black dark:text-white print:h-auto print:overflow-visible print:bg-white print:block">
      <SEO title="EVOLW Admin" path={location.pathname} noindex nofollow />

      <aside className="hidden lg:flex w-72 shrink-0 bg-white dark:bg-evolw-slate border-r border-evolw-gray-200 dark:border-white/10 flex-col shadow-sm print:hidden">
        <SidebarNav
          pathname={location.pathname}
          onLogout={handleLogout}
        />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close menu overlay"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(100%,20rem)] bg-white dark:bg-evolw-slate border-r border-evolw-gray-200 dark:border-white/10 flex flex-col shadow-2xl">
            <SidebarNav
              pathname={location.pathname}
              onNavigate={() => setMobileNavOpen(false)}
              onLogout={handleLogout}
              showClose
              onClose={() => setMobileNavOpen(false)}
              showTheme
            />
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden print:h-auto print:overflow-visible print:block">
        <header className="h-14 sm:h-16 lg:h-20 shrink-0 flex items-center justify-between gap-3 px-3 sm:px-6 lg:px-10 border-b border-evolw-gray-200 dark:border-white/10 bg-white/90 dark:bg-evolw-slate/90 backdrop-blur-md z-10 print:hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl text-evolw-gray-600 dark:text-evolw-gray-300 hover:bg-evolw-gray-100 dark:hover:bg-white/10 shrink-0"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight capitalize truncate text-evolw-black dark:text-white">
              {pageTitle(location.pathname)}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-evolw-black dark:text-white">Admin User</p>
              <p className="text-xs text-evolw-gray-500 dark:text-evolw-gray-400">admin@evolw.in</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-evolw-accent to-blue-400 flex items-center justify-center text-white font-bold shadow-md text-sm">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-10 relative print:overflow-visible print:p-0 print:m-0 print:block">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
