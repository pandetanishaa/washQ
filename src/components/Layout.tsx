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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="pixel-bg relative min-h-screen">
      <FloatingBubbles />
      
      {/* Top Right Controls */}
      {showNav && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
          <HelpFeedbackDialog />
          <button
            onClick={handleLogout}
            className="font-pixel flex items-center gap-2 rounded-lg border-2 border-red-700 bg-red-500 px-3 py-2 text-sm text-white transition-colors hover:bg-red-600"
          >
            <LogOut className="h-4 w-4" />
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
        <nav className="bg-card border-primary/20 safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-50 border-t-4 px-4 py-2">
          <div className="mx-auto flex max-w-md items-center justify-around">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all ${
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="font-pixel text-xs">{label}</span>
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
