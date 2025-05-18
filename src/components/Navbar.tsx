
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePIN } from "@/context/PINContext"; 
import { Lock } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const { lockScreen } = usePIN();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const links = [
    { href: "/", label: "Devices" },
    { href: "/logs", label: "Activity Log" },
    { href: "/pos", label: "Point of Sale" },
    { href: "/transactions", label: "Transactions" },
    { href: "/sales-summary", label: "Sales Summary" },
  ];

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="font-bold text-xl mr-8">GameZone</div>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6 flex-grow">
          {links.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(link.href) 
                  ? "text-primary underline underline-offset-4" 
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button
          variant="outline" 
          size="icon"
          onClick={lockScreen}
          title="Lock Application"
        >
          <Lock className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
