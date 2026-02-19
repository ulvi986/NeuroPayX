import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LogOut, User, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            NeuropayX
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/consultants" className="text-sm font-medium hover:text-primary transition-colors">
              Consultants
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

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Button 
                  variant="ghost" 
                  className="justify-start text-lg"
                  onClick={() => handleNavigation('/consultants')}
                >
                  Consultants
                </Button>

                <div className="border-t pt-4 mt-4 space-y-4">
                  {user ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-lg"
                        onClick={() => handleNavigation('/profile')}
                      >
                        <User className="h-5 w-5 mr-2" />
                        Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-lg"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="default" 
                      className="w-full justify-start text-lg"
                      onClick={() => handleNavigation('/auth')}
                    >
                      Login
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
