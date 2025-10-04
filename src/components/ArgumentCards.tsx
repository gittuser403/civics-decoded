import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Argument = {
  side: "for" | "against";
  text: string;
  source: string;
};

type Bill = {
  id: string;
  bill_number: string;
  title: string;
  full_text: string;
  arguments?: Argument[];
};

type ArgumentCardsProps = {
  bill: Bill | null;
};

export const ArgumentCards = ({ bill }: ArgumentCardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [billArguments, setBillArguments] = useState<Argument[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (bill?.arguments && Array.isArray(bill.arguments)) {
      setBillArguments(bill.arguments);
      setCurrentIndex(0);
    } else {
      setBillArguments([]);
    }
  }, [bill]);

  const generateArguments = async () => {
    if (!bill) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-arguments', {
        body: { 
          billText: bill.full_text,
          billTitle: bill.title 
        }
      });

      if (error) throw error;

      if (data?.arguments) {
        setBillArguments(data.arguments);
        setCurrentIndex(0);
        toast({
          title: "Arguments generated!",
          description: "View balanced perspectives on this bill",
        });
      }
    } catch (error) {
      console.error('Error generating arguments:', error);
      toast({
        title: "Error",
        description: "Failed to generate arguments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!bill) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚖️ For vs. Against Arguments
          </CardTitle>
          <CardDescription>
            Select a bill to see arguments from both sides
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (billArguments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚖️ For vs. Against Arguments
          </CardTitle>
          <CardDescription>
            Generate balanced perspectives on this bill
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateArguments} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Arguments...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Arguments
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentArg = billArguments[currentIndex];

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % billArguments.length);
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + billArguments.length) % billArguments.length);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚖️ For vs. Against Arguments
        </CardTitle>
        <CardDescription>
          Swipe through different perspectives on this bill
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <div
            className={`rounded-xl p-6 transition-all duration-300 ${
              currentArg.side === "for"
                ? "bg-success-light border-2 border-success"
                : "bg-danger-light border-2 border-danger"
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              {currentArg.side === "for" ? (
                <div className="rounded-full bg-success p-2">
                  <ThumbsUp className="h-5 w-5 text-success-foreground" />
                </div>
              ) : (
                <div className="rounded-full bg-danger p-2">
                  <ThumbsDown className="h-5 w-5 text-danger-foreground" />
                </div>
              )}
              <Badge
                variant="outline"
                className={
                  currentArg.side === "for"
                    ? "bg-success text-success-foreground border-success"
                    : "bg-danger text-danger-foreground border-danger"
                }
              >
                {currentArg.side === "for" ? "Supporting" : "Opposing"}
              </Badge>
            </div>

            <p className="text-lg font-medium mb-3 text-foreground">
              {currentArg.text}
            </p>

            <p className="text-sm text-muted-foreground italic">
              Source: {currentArg.source}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={goPrevious} size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {billArguments.length}
          </div>

          <Button variant="outline" onClick={goNext} size="sm">
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
