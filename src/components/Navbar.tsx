
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ShoppingCart, Package } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const links = [
    { name: 'Devices', path: '/', icon: 'game-controller' },
    { name: 'Usage Logs', path: '/logs', icon: 'clock' },
    { name: 'POS', path: '/pos', icon: 'shopping-cart' },
    { name: 'Transactions', path: '/transactions', icon: 'receipt' },
  ];

  return (
    <div className="border-b">
      <div className="flex h-16 items-center container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="font-bold text-xl flex items-center">
          <span className="text-primary mr-1">Game</span>
          <span>Zone</span>
        </div>
        <nav className="ml-8 flex space-x-4 lg:space-x-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1",
                isActive(link.path) 
                  ? "text-foreground" 
                  : "text-muted-foreground"
              )}
            >
              {link.icon === 'shopping-cart' && <ShoppingCart className="h-4 w-4" />}
              {link.icon === 'receipt' && <Package className="h-4 w-4" />}
              {link.icon !== 'shopping-cart' && link.icon !== 'receipt' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  {link.icon === 'game-controller' ? (
                    <>
                      <rect x="6" y="11" width="12" height="8" rx="2" />
                      <path d="M12 17v-6" />
                      <path d="M8 13h8" />
                      <path d="M8.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                      <path d="M20.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                    </>
                  ) : link.icon === 'clock' ? (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </>
                  ) : null}
                </svg>
              )}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
