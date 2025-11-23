import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Plus, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
            
            <Link to="/create-template">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => navigate('/auth')}>
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
