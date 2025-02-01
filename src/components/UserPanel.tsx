import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const UserPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="p-2 transition-colors">
            {isOpen ? (
              <X className="h-6 w-6 text-zen-600 hover:text-zen-800 transition-colors" />
            ) : (
              <Menu className="h-6 w-6 text-zen-600 hover:text-zen-800 transition-colors" />
            )}
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] bg-zen-50">
          <div className="space-y-6 mt-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zen-800">User Profile</h2>
              <p className="text-sm text-zen-600">{user?.email}</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-zen-200 hover:bg-zen-100"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};