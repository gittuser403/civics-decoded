import { Scale, Plus, Lightbulb, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-sm">
      <div className="container flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4 gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 cursor-pointer group min-w-0" onClick={() => navigate("/app")}>
          <div className="rounded-2xl bg-gradient-primary p-2.5 sm:p-3 shadow-card group-hover:shadow-glow transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0">
            <Scale className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-xl md:text-2xl font-heading font-bold text-foreground tracking-tight truncate group-hover:text-primary transition-colors duration-300">
              Policy in Plain English
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block group-hover:text-primary/70 transition-colors duration-300">
              Understand legislation, simply ✨
            </p>
          </div>
        </div>
        
        <div className="flex gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          <Button 
            onClick={() => navigate("/propose-bill")} 
            size="sm"
            className="rounded-xl font-heading font-semibold shadow-card hover:shadow-elevated transition-all duration-500 text-xs sm:text-sm md:text-base hidden md:flex md:size-lg group"
          >
            <Lightbulb className="mr-0 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-500" />
            <span className="hidden lg:inline">Propose Bill</span>
          </Button>
          <Button 
            onClick={() => navigate("/submit-bill")} 
            size="sm"
            variant="outline"
            className="rounded-xl font-heading font-semibold border-2 hover:border-primary/50 transition-all duration-500 text-xs sm:text-sm md:text-base hidden sm:flex md:size-lg group"
          >
            <Plus className="mr-0 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform duration-500" />
            <span className="hidden lg:inline">Submit Bill</span>
          </Button>
          <Button 
            onClick={handleLogout} 
            size="sm"
            variant="outline"
            className="rounded-xl font-heading font-semibold border-2 hover:border-destructive/50 transition-all duration-500 text-xs sm:text-sm md:text-base md:size-lg group"
          >
            <LogOut className="mr-0 sm:mr-1 md:mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform duration-500" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
