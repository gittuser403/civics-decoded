import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, MapPin, Calendar, Briefcase } from "lucide-react";

type Bill = {
  id: string;
  bill_number: string;
  title: string;
  impact_data?: any;
};

type BillImpactProps = {
  bill: Bill | null;
};

export const BillImpact = ({ bill }: BillImpactProps) => {
  if (!bill?.impact_data) {
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

  const impact = bill.impact_data;

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
        {/* Affected Population */}
        {impact.affected_population && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-light/20 border border-primary/20">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Affected Population</h4>
              <p className="text-sm text-muted-foreground">{impact.affected_population}</p>
            </div>
          </div>
        )}

        {/* Cost Estimate */}
        {impact.cost_estimate && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-info-light/20 border border-info/20">
            <div className="rounded-full bg-info/10 p-2">
              <DollarSign className="h-5 w-5 text-info" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Cost Estimate</h4>
              <p className="text-sm text-muted-foreground">{impact.cost_estimate}</p>
            </div>
          </div>
        )}

        {/* Geographic Scope */}
        {impact.geographic_scope && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-success-light/20 border border-success/20">
            <div className="rounded-full bg-success/10 p-2">
              <MapPin className="h-5 w-5 text-success" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Geographic Scope</h4>
              <p className="text-sm text-muted-foreground">{impact.geographic_scope}</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        {impact.timeline && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-light/20 border border-accent/20">
            <div className="rounded-full bg-accent/10 p-2">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Implementation Timeline</h4>
              <p className="text-sm text-muted-foreground">{impact.timeline}</p>
            </div>
          </div>
        )}

        {/* Affected Sectors */}
        {impact.sectors && impact.sectors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Affected Sectors</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {impact.sectors.map((sector: string, index: number) => (
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
