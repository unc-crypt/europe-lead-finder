import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Zap } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>LeadPulse</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {isLanding ? (
            <>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#domains" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Coverage</a>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Search</Link>
              <Link to="/lists" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Lists</Link>
              <Link to="/credits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Credits</Link>
              <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
            </>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isLanding ? (
            <>
              <Button variant="ghost" asChild><Link to="/login">Log in</Link></Button>
              <Button asChild><Link to="/signup">Get Started Free</Link></Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span>250 credits</span>
              </div>
              <Button variant="ghost" size="icon" asChild><Link to="/dashboard"><Search className="h-4 w-4" /></Link></Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {isLanding ? (
              <>
                <Link to="/login" className="text-sm" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/signup" className="text-sm font-medium text-primary" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-sm" onClick={() => setOpen(false)}>Search</Link>
                <Link to="/lists" className="text-sm" onClick={() => setOpen(false)}>My Lists</Link>
                <Link to="/credits" className="text-sm" onClick={() => setOpen(false)}>Credits</Link>
                <Link to="/settings" className="text-sm" onClick={() => setOpen(false)}>Settings</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
