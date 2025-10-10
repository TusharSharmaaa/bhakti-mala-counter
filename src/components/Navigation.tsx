import { Link, useLocation } from "react-router-dom";
import { Home, TrendingUp, BookOpen, Timer, Settings } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Counter" },
    { path: "/stats", icon: TrendingUp, label: "Stats" },
    { path: "/spiritual", icon: BookOpen, label: "Content" },
    { path: "/timer", icon: Timer, label: "Timer" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
                <span className="text-xs">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
