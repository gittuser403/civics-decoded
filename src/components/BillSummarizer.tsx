import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type ReadingLevel = "middle" | "high" | "college";

type Bill = {
  id: string;
  bill_number: string;
  title: string;
  short_description: string;
  full_text: string;
  status: string;
  introduced_date: string;
  category: string;
  sponsor: string | null;
};

type BillSummarizerProps = {
  selectedBill?: Bill | null;
  onClearBill?: () => void;
};

export const BillSummarizer = ({ selectedBill, onClearBill }: BillSummarizerProps) => {
  const [billText, setBillText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>("middle");
  const { toast } = useToast();

  useEffect(() => {
    if (selectedBill) {
      handleSummarize(selectedBill.full_text);
    } else {
      setSummary("");
    }
  }, [selectedBill, readingLevel]);

  const handleSummarize = async (textOverride?: string) => {
    const textToSummarize = textOverride || selectedBill?.full_text || billText;
    
    if (!textToSummarize.trim()) {
      toast({
        title: "Missing input",
        description: "Please paste some bill text or select a bill from the list",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('summarize-bill', {
        body: { billText: textToSummarize, readingLevel }
      });

      if (error) throw error;

      setSummary(data.summary);
      toast({
        title: "Summary generated!",
        description: "Your bill summary is ready",
      });
    } catch (error) {
      console.error('Error summarizing bill:', error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Bill Summarizer
        </CardTitle>
        <CardDescription>
          {selectedBill ? "Plain-English summary of the selected bill" : "Paste a bill's text to get a plain-English summary"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Reading Level</label>
            <Select 
              value={readingLevel} 
              onValueChange={(value: ReadingLevel) => setReadingLevel(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="middle">🎓 Middle School</SelectItem>
                <SelectItem value="high">📚 High School</SelectItem>
                <SelectItem value="college">🎯 College</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedBill ? (
          <div className="rounded-lg border bg-primary-light/20 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Badge variant="outline" className="mb-2">{selectedBill.bill_number}</Badge>
                <h4 className="font-semibold">{selectedBill.title}</h4>
              </div>
              {onClearBill && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearBill();
                    setSummary("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{selectedBill.short_description}</p>
          </div>
        ) : (
          <>
            <Textarea
              placeholder="Paste bill text here..."
              value={billText}
              onChange={(e) => setBillText(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
            />
            <Button 
              onClick={() => handleSummarize()} 
              disabled={loading || !billText.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Summarize Bill
                </>
              )}
            </Button>
          </>
        )}

        {summary && (
          <div className="mt-4 rounded-lg border bg-secondary/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline">
                {readingLevel === "middle" 
                  ? "🎓 Middle School Level" 
                  : readingLevel === "high" 
                  ? "📚 High School Level" 
                  : "🎯 College Level"}
              </Badge>
            </div>
            <div className="prose prose-sm max-w-none text-foreground">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
