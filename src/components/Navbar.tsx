
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [activeTab, setActiveTab] = React.useState("devices");

  return (
    <nav className="bg-card p-3 flex justify-between items-center border-b border-border">
      <div className="flex items-center">
        <Gamepad className="text-gaming-accent w-6 h-6 mr-2" />
        <h1 className="text-xl font-bold">Game Zone</h1>
      </div>

      <div className="hidden md:flex space-x-1">
        <NavLink 
          to="/" 
          isActive={activeTab === "devices"} 
          onClick={() => setActiveTab("devices")}
        >
          Devices
        </NavLink>
        <NavLink 
          to="/logs" 
          isActive={activeTab === "logs"} 
          onClick={() => setActiveTab("logs")}
        >
          Usage Logs
        </NavLink>
      </div>

      <div className="md:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link to={activeTab === "devices" ? "/logs" : "/"} onClick={() => setActiveTab(activeTab === "devices" ? "logs" : "devices")}>
            {activeTab === "devices" ? "Logs" : "Devices"}
          </Link>
        </Button>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  children: React.ReactNode;
  to: string;
  isActive: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ 
  children, 
  to, 
  isActive, 
  onClick 
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "font-medium",
        isActive && "bg-secondary"
      )}
      asChild
    >
      <Link to={to} onClick={onClick}>
        {children}
      </Link>
    </Button>
  );
};

export default Navbar;
