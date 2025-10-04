import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ContactRep = () => {
  const [zipCode, setZipCode] = useState("");
  const [showRep, setShowRep] = useState(false);
  const { toast } = useToast();

  const handleLookup = () => {
    if (!zipCode || zipCode.length < 5) {
      toast({
        title: "Invalid ZIP code",
        description: "Please enter a valid 5-digit ZIP code",
        variant: "destructive",
      });
      return;
    }

    setShowRep(true);
    toast({
      title: "Representative found!",
      description: "Here's your representative's contact information",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📞 Contact Your Representative
        </CardTitle>
        <CardDescription>
          Find and reach out to your elected officials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter your ZIP code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
              maxLength={5}
            />
          </div>
          <Button onClick={handleLookup}>
            <MapPin className="mr-2 h-4 w-4" />
            Find Rep
          </Button>
        </div>

        {showRep && (
          <div className="mt-6 space-y-4 rounded-lg border bg-secondary/50 p-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">Rep. Jane Smith</h4>
                <p className="text-sm text-muted-foreground">
                  District 5 • Democrat
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="mailto:rep.smith@house.gov">
                  <Mail className="mr-2 h-4 w-4" />
                  rep.smith@house.gov
                </a>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="tel:202-555-0100">
                  <Phone className="mr-2 h-4 w-4" />
                  (202) 555-0100
                </a>
              </Button>

              <Button variant="outline" className="w-full justify-start" asChild>
                <a
                  href="https://www.house.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Official Website
                </a>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full" variant="default">
                <Mail className="mr-2 h-4 w-4" />
                Draft Email About This Bill
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
