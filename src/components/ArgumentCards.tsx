import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from "lucide-react";

type Argument = {
  id: number;
  side: "for" | "against";
  text: string;
  source: string;
};

const sampleArguments: Argument[] = [
  {
    id: 1,
    side: "for",
    text: "Increases funding for public education by 15%, helping schools hire more teachers and reduce class sizes.",
    source: "Department of Education Analysis",
  },
  {
    id: 2,
    side: "against",
    text: "May lead to higher taxes for middle-class families to cover the $2 billion annual cost.",
    source: "Congressional Budget Office",
  },
  {
    id: 3,
    side: "for",
    text: "Provides resources for after-school programs that keep students engaged and safe.",
    source: "National Education Association",
  },
  {
    id: 4,
    side: "against",
    text: "Lacks clear accountability measures to ensure the funds are used effectively.",
    source: "Government Accountability Office",
  },
];

export const ArgumentCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentArg = sampleArguments[currentIndex];

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sampleArguments.length);
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sampleArguments.length) % sampleArguments.length);
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
            {currentIndex + 1} / {sampleArguments.length}
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
