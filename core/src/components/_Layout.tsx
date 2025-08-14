import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Home,
  Settings,
  Moon,
  Sun,
  MapPin,
  Trophy,
  Users,
  BarChart3,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(false);
  const { user, logout } = useAuthStore();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Arenas", href: "/arenas", icon: MapPin },
    { name: "Tournaments", href: "/tournaments", icon: Trophy },
    { name: "Participants", href: "/participants", icon: Users },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col">
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Beyblade Pro</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="h-8 w-8"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
