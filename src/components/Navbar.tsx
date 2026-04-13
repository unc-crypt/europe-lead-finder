import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Zap } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-2xl">
      <div className="container flex h-[68px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-mono text-sm font-bold text-primary-foreground shadow-md shadow-primary/30">
            LP
          </div>
          <span className="text-[19px] font-extrabold tracking-tight">
            Lead<span className="text-primary">Pulse</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {isLanding ? (
            <>
              <a href="#coverage" className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3.5 py-2 rounded-lg transition-all font-medium">Coverage</a>
              <a href="#lists" className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3.5 py-2 rounded-lg transition-all font-medium">Email Lists</a>
              <a href="#how" className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3.5 py-2 rounded-lg transition-all font-medium">How It Works</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3.5 py-2 rounded-lg transition-all font-medium">Pricing</a>
              <a href="#compare" className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3.5 py-2 rounded-lg transition-all font-medium">Compare</a>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3.5 py-2 rounded-lg transition-all font-medium">Search</Link>
              <Link to="/lists" className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3.5 py-2 rounded-lg transition-all font-medium">My Lists</Link>
              <Link to="/credits" className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3.5 py-2 rounded-lg transition-all font-medium">Credits</Link>
              <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3.5 py-2 rounded-lg transition-all font-medium">Settings</Link>
            </>
          )}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          {isLanding ? (
            <>
              <Button variant="outline" size="sm" className="font-semibold" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="font-bold shadow-md shadow-primary/25" asChild>
                <Link to="/signup">Get Free Leads →</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span>250 credits</span>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard"><Search className="h-4 w-4" /></Link>
              </Button>
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
                <a href="#coverage" className="text-sm" onClick={() => setOpen(false)}>Coverage</a>
                <a href="#lists" className="text-sm" onClick={() => setOpen(false)}>Email Lists</a>
                <a href="#pricing" className="text-sm" onClick={() => setOpen(false)}>Pricing</a>
                <Link to="/login" className="text-sm" onClick={() => setOpen(false)}>Sign In</Link>
                <Link to="/signup" className="text-sm font-medium text-primary" onClick={() => setOpen(false)}>Get Free Leads</Link>
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
