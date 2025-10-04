import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

type BillsListProps = {
  onSelectBill: (bill: Bill) => void;
};

export const BillsList = ({ onSelectBill }: BillsListProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('introduced_date', { ascending: false });

      if (error) throw error;
      
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: "Error loading bills",
        description: "Could not load the bills list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed senate':
      case 'passed house':
        return 'bg-success text-success-foreground';
      case 'senate vote':
      case 'house vote':
        return 'bg-info text-info-foreground';
      case 'committee review':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📚 Explore Bills</CardTitle>
          <CardDescription>Loading legislation...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📚 Explore Bills
        </CardTitle>
        <CardDescription>
          Click on any bill to see a detailed plain-English summary
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="rounded-lg border bg-card p-4 transition-all hover:shadow-md cursor-pointer"
                onClick={() => onSelectBill(bill)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {bill.bill_number}
                      </Badge>
                      <Badge className={getStatusColor(bill.status)}>
                        {bill.status}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{bill.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {bill.short_description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(bill.introduced_date).toLocaleDateString()}
                  </div>
                  {bill.sponsor && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {bill.sponsor}
                    </div>
                  )}
                  <Badge variant="outline">{bill.category}</Badge>
                </div>

                <Button variant="ghost" size="sm" className="mt-3 w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read Summary
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
