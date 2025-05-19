
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out."
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const normalClass = "text-sm font-medium transition-colors hover:text-foreground/80";
  const activeClass = "text-sm font-medium text-foreground/80 underline underline-offset-4";
  
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center gap-6">
          <NavLink to="/" className={({isActive}) => isActive ? activeClass : normalClass}>
            Dashboard
          </NavLink>
          <NavLink to="/pos" className={({isActive}) => isActive ? activeClass : normalClass}>
            POS
          </NavLink>
          <NavLink to="/transactions" className={({isActive}) => isActive ? activeClass : normalClass}>
            Transactions
          </NavLink>
          <NavLink to="/devices" className={({isActive}) => isActive ? activeClass : normalClass}>
            Devices
          </NavLink>
          <NavLink to="/expenses" className={({isActive}) => isActive ? activeClass : normalClass}>
            Expenses
          </NavLink>
          <NavLink to="/sales-summary" className={({isActive}) => isActive ? activeClass : normalClass}>
            Sales Summary
          </NavLink>
          <NavLink to="/reports" className={({isActive}) => isActive ? activeClass : normalClass}>
            Reports
          </NavLink>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="ml-2 h-8 w-8 p-0 data-[state=open]:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Avatar"} />
                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || "AV"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem as={NavLink} to="/settings">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem as={NavLink} to="/pin-management">
              PIN Management
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
