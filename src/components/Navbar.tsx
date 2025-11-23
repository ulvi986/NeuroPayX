import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Plus } from "lucide-react";

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            NeuropayX
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/templates" className="text-sm font-medium hover:text-primary transition-colors">
              Templates
            </Link>
            <Link to="/consultants" className="text-sm font-medium hover:text-primary transition-colors">
              Consultants
            </Link>
            <Link to="/community" className="text-sm font-medium hover:text-primary transition-colors">
              Community
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/create-template">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
