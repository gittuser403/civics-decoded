import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock } from "lucide-react";

type BillStage = {
  id: number;
  name: string;
  status: "completed" | "current" | "pending";
  date?: string;
};

const billStages: BillStage[] = [
  { id: 1, name: "Introduced", status: "completed", date: "Jan 15, 2024" },
  { id: 2, name: "Committee Review", status: "completed", date: "Feb 3, 2024" },
  { id: 3, name: "House Vote", status: "current", date: "Expected Mar 2024" },
  { id: 4, name: "Senate Vote", status: "pending" },
  { id: 5, name: "Presidential Signature", status: "pending" },
];

export const BillTracker = () => {
  const progress = (billStages.filter((s) => s.status === "completed").length / billStages.length) * 100;

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
          {billStages.map((stage, index) => (
            <div key={stage.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                {stage.status === "completed" ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : stage.status === "current" ? (
                  <Clock className="h-6 w-6 text-info" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
                {index < billStages.length - 1 && (
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
