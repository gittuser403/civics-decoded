import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, GraduationCap, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ReadingLevel = "middle" | "high";

export const BillSummarizer = () => {
  const [billText, setBillText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>("middle");
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!billText.trim()) {
      toast({
        title: "Missing input",
        description: "Please paste some bill text or a link to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate AI processing - in production, this would call Lovable AI
    setTimeout(() => {
      const levelText = readingLevel === "middle" ? "middle school" : "high school";
      setSummary(
        `📜 **Bill Summary** (${levelText} level)\n\n` +
        `🎯 **Main Goal:** This bill aims to [main purpose]\n\n` +
        `💰 **Budget Impact:** $X million over Y years\n\n` +
        `👥 **Who It Affects:** Students, families, educators\n\n` +
        `⏰ **Timeline:** If passed, changes would start in [date]\n\n` +
        `✅ **Key Points:**\n` +
        `• Point 1: Simplified explanation\n` +
        `• Point 2: Another key detail\n` +
        `• Point 3: Important change\n\n` +
        `📊 **Current Status:** Under committee review`
      );
      setLoading(false);
      toast({
        title: "Summary generated!",
        description: "Your bill summary is ready",
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Bill Summarizer
        </CardTitle>
        <CardDescription>
          Paste a bill link or text to get a plain English summary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={readingLevel === "middle" ? "default" : "outline"}
            size="sm"
            onClick={() => setReadingLevel("middle")}
            className="flex-1"
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            Middle School
          </Button>
          <Button
            variant={readingLevel === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => setReadingLevel("high")}
            className="flex-1"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            High School
          </Button>
        </div>

        <Textarea
          placeholder="Paste bill text or link here... (e.g., congress.gov/bill/...)"
          value={billText}
          onChange={(e) => setBillText(e.target.value)}
          className="min-h-[120px]"
        />

        <Button 
          onClick={handleSummarize} 
          disabled={loading}
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

        {summary && (
          <div className="mt-4 rounded-lg border bg-secondary/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline">
                {readingLevel === "middle" ? "📚 Middle School Level" : "📖 High School Level"}
              </Badge>
            </div>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
              {summary}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
