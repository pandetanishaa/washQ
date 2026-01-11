import { ReactNode } from "react";
import FloatingBubbles from "./FloatingBubbles";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, WashingMachine, Settings, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useMachineNotifications } from "@/hooks/useMachineNotifications";
import { HelpFeedbackDialog } from "./HelpFeedbackDialog";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const Layout = ({ children, showNav = true }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userRole } = useApp();

  // Monitor machine status changes and notify user
  useMachineNotifications();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/machines", icon: WashingMachine, label: "Machines" },
    ...(userRole === "admin" ? [{ path: "/admin", icon: Settings, label: "Admin" }] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen pixel-bg relative">
      <FloatingBubbles />
      
      {/* Top Right Controls */}
      {showNav && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <HelpFeedbackDialog />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white border-2 border-red-700 rounded-lg font-pixel text-sm hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT</span>
          </button>
        </div>
      )}
      
      {/* Main Content */}
      <main className="relative z-10 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-4 border-primary/20 px-4 py-2 safe-area-inset-bottom">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-pixel">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
