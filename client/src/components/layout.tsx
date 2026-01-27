import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  User, 
  LogOut, 
  LayoutDashboard, 
  LifeBuoy,
  Menu,
  X,
  ChevronDown,
  UserPlus,
  LogIn,
  Info,
  FileText
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCurrency, Currency } from "@/hooks/use-currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();

  const CurrencySwitcher = () => (
    <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
      <SelectTrigger className="w-[80px] h-8 border-none bg-transparent hover:bg-muted/50 transition-colors focus:ring-0">
        <SelectValue placeholder="USD" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USD">USD ($)</SelectItem>
        <SelectItem value="NGN">NGN (₦)</SelectItem>
        <SelectItem value="EUR">EUR (€)</SelectItem>
        <SelectItem value="GBP">GBP (£)</SelectItem>
      </SelectContent>
    </Select>
  );

  const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: any }) => {
    const isActive = location === href;
    return (
      <Link href={href} className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md",
        isActive 
          ? "bg-primary/5 text-primary" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}>
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </Link>
    );
  };

  const NavMenu = () => (
    <div className="flex items-center gap-2">
      <CurrencySwitcher />
      <div className="h-4 w-px bg-border mx-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            {user ? (
              <>
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </>
            ) : (
              <>
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </>
            )}
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {!user ? (
            <>
              <Link href="/auth">
                <DropdownMenuItem className="cursor-pointer">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </DropdownMenuItem>
              </Link>
              <Link href="/auth">
                <DropdownMenuItem className="cursor-pointer">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </DropdownMenuItem>
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile & Bookings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <Link href="#">
            <DropdownMenuItem className="cursor-pointer">
              <Info className="w-4 h-4 mr-2" />
              About Us
            </DropdownMenuItem>
          </Link>
          <Link href="#">
            <DropdownMenuItem className="cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              Terms & Conditions
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-sm font-display font-bold text-xl group-hover:bg-accent transition-colors">
              L
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">Lumiere</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            <NavLink href="/">Apartments</NavLink>
            
            {user && (
              <>
                {(user.role === 'admin' || user.role === 'manager') && (
                  <NavLink href="/admin" icon={LayoutDashboard}>Admin</NavLink>
                )}
                {(user.role === 'support' || user.role === 'admin') && (
                  <NavLink href="/support" icon={LifeBuoy}>Support</NavLink>
                )}
              </>
            )}
            
            <div className="h-4 w-px bg-border mx-2" />
            <NavMenu />
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b bg-background overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-2">
              <NavLink href="/">Apartments</NavLink>
              {user && <NavLink href="/profile">My Bookings</NavLink>}
              {user?.role === 'admin' && <NavLink href="/admin">Admin Dashboard</NavLink>}
              
              <div className="border-t pt-4 mt-2">
                {user ? (
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <Link href="/auth">
                    <Button className="w-full">Sign In</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold">Lumiere</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Experience luxury living in the heart of the city. Hand-picked apartments for the discerning traveler.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-primary transition-colors">Apartments</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Neighborhoods</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Experiences</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Newsletter</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter email" 
                  className="bg-background border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button size="sm">Join</Button>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Lumiere Apartments. All rights reserved.</p>
            <p className="font-medium">Created by Giovanni Paul Sodipo</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
