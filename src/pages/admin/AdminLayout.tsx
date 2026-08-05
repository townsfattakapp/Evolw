import { useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut, FileText, Award } from "lucide-react";
import { ThemeToggle } from "../../components/theme-toggle";

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("evolw_admin_auth");
    if (!isAuthenticated) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("evolw_admin_auth");
    navigate("/admin");
  };

  const navItems = [
    { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Form Leads", path: "/admin/contacts", icon: MessageSquare },
    { name: "Website Content", path: "/admin/content", icon: Settings },
    { name: "Job Openings", path: "/admin/jobs", icon: Users },
    { name: "Job Applications", path: "/admin/applications", icon: Users },
    { name: "Offer Letters", path: "/admin/offer-letters", icon: FileText },
    { name: "Intern Certificates", path: "/admin/certificates", icon: Award },
  ];

  return (
    <div className="flex h-screen bg-evolw-gray-50 dark:bg-evolw-black overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-evolw-gray-900 border-r border-evolw-gray-200 dark:border-white/5 flex flex-col shadow-sm print:hidden">
        <div className="h-20 flex items-center px-8 border-b border-evolw-gray-200 dark:border-white/5">
          <Link to="/" className="text-2xl font-bold tracking-tight hover:text-evolw-accent transition-colors">EVOLW</Link>
          <span className="ml-2 text-xs font-semibold px-2 py-1 bg-evolw-gray-100 dark:bg-white/10 rounded-md">ADMIN</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <p className="text-xs font-semibold text-evolw-gray-400 tracking-wider uppercase mb-4 px-2">Menu</p>
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link 
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-evolw-accent text-white shadow-md shadow-evolw-accent/20" 
                    : "text-evolw-gray-600 dark:text-evolw-gray-400 hover:bg-evolw-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-6 border-t border-evolw-gray-200 dark:border-white/5">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
        {/* Top Header */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-10 border-b border-evolw-gray-200 dark:border-white/5 bg-white/80 dark:bg-evolw-slate/80 backdrop-blur-md z-10 print:hidden">
          <h2 className="text-xl font-bold tracking-tight capitalize">
            {location.pathname.split("/").pop() || "Dashboard"}
          </h2>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-evolw-black dark:text-white">Admin User</p>
              <p className="text-xs text-evolw-gray-500">admin@evolw.in</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-evolw-accent to-blue-400 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
              A
            </div>
          </div>
        </header>
        
        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-10 relative print:overflow-visible print:p-0 print:m-0 print:block">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
