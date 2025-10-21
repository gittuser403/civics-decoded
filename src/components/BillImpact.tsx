import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, MapPin, Calendar, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Bill = {
  id: string;
  bill_number: string;
  title: string;
  short_description: string;
  full_text: string;
  impact_data?: any;
};

type BillImpactProps = {
  bill: Bill | null;
};

export const BillImpact = ({ bill }: BillImpactProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [impactData, setImpactData] = useState(bill?.impact_data);
  const { toast } = useToast();

  // Update impact data when bill changes
  useEffect(() => {
    setImpactData(bill?.impact_data);
  }, [bill]);

  const handleAnalyzeImpact = async () => {
    if (!bill) return;

    setAnalyzing(true);
    toast({
      title: "Analyzing impact...",
      description: "AI is evaluating the bill's effects and implications",
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast({
          title: "Authentication required",
          description: "Please log in to analyze bill impact",
          variant: "destructive",
        });
        setAnalyzing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('analyze-bill-impact', {
        body: {
          billId: bill.id,
          billTitle: bill.title,
          billNumber: bill.bill_number,
          shortDescription: bill.short_description,
          fullText: bill.full_text,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setImpactData(data.impact);
      toast({
        title: "Analysis complete!",
        description: "Impact assessment has been generated",
      });
    } catch (error) {
      console.error('Error analyzing impact:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze bill impact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (!bill) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Bill Impact Analysis
          </CardTitle>
          <CardDescription>
            Select a bill to see its impact analysis
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!impactData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Bill Impact Analysis
          </CardTitle>
          <CardDescription>
            Who this bill affects and how
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleAnalyzeImpact} 
            disabled={analyzing}
            className="w-full"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Impact...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Bill Impact
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Bill Impact Analysis
        </CardTitle>
        <CardDescription>
          Who this bill affects and how
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={handleAnalyzeImpact} 
          disabled={analyzing}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Re-analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Re-analyze Impact
            </>
          )}
        </Button>
        {/* Affected Population */}
        {impactData.affected_population && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-light/20 border border-primary/20">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Affected Population</h4>
              <p className="text-sm text-muted-foreground">{impactData.affected_population}</p>
            </div>
          </div>
        )}

        {/* Cost Estimate */}
        {impactData.cost_estimate && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-info-light/20 border border-info/20">
            <div className="rounded-full bg-info/10 p-2">
              <DollarSign className="h-5 w-5 text-info" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Cost Estimate</h4>
              <p className="text-sm text-muted-foreground">{impactData.cost_estimate}</p>
            </div>
          </div>
        )}

        {/* Geographic Scope */}
        {impactData.geographic_scope && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-success-light/20 border border-success/20">
            <div className="rounded-full bg-success/10 p-2">
              <MapPin className="h-5 w-5 text-success" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Geographic Scope</h4>
              <p className="text-sm text-muted-foreground">{impactData.geographic_scope}</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        {impactData.timeline && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-light/20 border border-accent/20">
            <div className="rounded-full bg-accent/10 p-2">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Implementation Timeline</h4>
              <p className="text-sm text-muted-foreground">{impactData.timeline}</p>
            </div>
          </div>
        )}

        {/* Affected Sectors */}
        {impactData.sectors && impactData.sectors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Affected Sectors</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {impactData.sectors.map((sector: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-secondary">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
