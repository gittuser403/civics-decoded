import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock } from "lucide-react";

type BillStage = {
  name: string;
  status: "completed" | "current" | "pending";
  date?: string;
};

type Bill = {
  id: string;
  bill_number: string;
  title: string;
  stages?: BillStage[];
};

type BillTrackerProps = {
  bill: Bill | null;
};

export const BillTracker = ({ bill }: BillTrackerProps) => {
  const [stages, setStages] = useState<BillStage[]>([]);

  useEffect(() => {
    if (bill?.stages && Array.isArray(bill.stages)) {
      setStages(bill.stages);
    }
  }, [bill]);

  if (!bill || stages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Bill Progress Tracker
          </CardTitle>
          <CardDescription>
            Select a bill to track its journey through Congress
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const progress = (stages.filter((s) => s.status === "completed").length / stages.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Bill Progress Tracker
        </CardTitle>
        <CardDescription>
          Track this bill's journey through the legislative process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                {stage.status === "completed" ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : stage.status === "current" ? (
                  <Clock className="h-6 w-6 text-info" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
                {index < stages.length - 1 && (
                  <div
                    className={`w-0.5 h-12 mt-1 ${
                      stage.status === "completed" ? "bg-success" : "bg-muted"
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{stage.name}</h4>
                  <Badge
                    variant="outline"
                    className={
                      stage.status === "completed"
                        ? "bg-success-light border-success text-success"
                        : stage.status === "current"
                        ? "bg-info-light border-info text-info"
                        : "bg-muted border-muted-foreground/20"
                    }
                  >
                    {stage.status === "completed"
                      ? "✓ Complete"
                      : stage.status === "current"
                      ? "⏳ In Progress"
                      : "⏱️ Pending"}
                  </Badge>
                </div>
                {stage.date && (
                  <p className="text-sm text-muted-foreground">{stage.date}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
