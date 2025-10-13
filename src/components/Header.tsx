import { Scale, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="rounded-lg bg-gradient-primary p-2">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Policy in Plain English</h1>
            <p className="text-xs text-muted-foreground">Understand legislation, simply</p>
          </div>
        </div>
        
        <Button onClick={() => navigate("/submit-bill")} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Submit Bill
        </Button>
      </div>
    </header>
  );
};
