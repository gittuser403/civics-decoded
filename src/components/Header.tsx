import { Scale, Plus, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-sm">
      <div className="container flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="rounded-2xl bg-gradient-primary p-3 shadow-card group-hover:shadow-elevated transition-all duration-300 group-hover:scale-105">
            <Scale className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              Policy in Plain English
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Understand legislation, simply
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate("/propose-bill")} 
            size="lg" 
            className="rounded-xl font-heading font-semibold shadow-card hover:shadow-elevated transition-all duration-300"
          >
            <Lightbulb className="mr-2 h-5 w-5" />
            Propose Bill
          </Button>
          <Button 
            onClick={() => navigate("/submit-bill")} 
            size="lg" 
            variant="outline"
            className="rounded-xl font-heading font-semibold border-2 hover:border-primary/50 transition-all duration-300"
          >
            <Plus className="mr-2 h-5 w-5" />
            Submit Bill
          </Button>
        </div>
      </div>
    </header>
  );
};
