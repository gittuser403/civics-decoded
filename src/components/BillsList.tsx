import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Calendar, User, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  source?: string;
  external_id?: string;
  last_synced?: string;
  official_url?: string;
};

type BillsListProps = {
  onSelectBill: (bill: Bill) => void;
};

export const BillsList = ({ onSelectBill }: BillsListProps) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBills();
    checkLastSync();
  }, []);

  useEffect(() => {
    filterBills();
  }, [bills, searchQuery, statusFilter]);

  const checkLastSync = async () => {
    try {
      const { data } = await supabase
        .from('sync_log')
        .select('completed_at')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.completed_at) {
        setLastSyncTime(data.completed_at);
      }
    } catch (error) {
      console.error('Error checking last sync:', error);
    }
  };

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('last_synced', { ascending: false });

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

  const handleRefresh = async () => {
    setSyncing(true);
    toast({
      title: "Syncing legislation...",
      description: "Fetching latest bills from Congress.gov, GovTrack, and Open States",
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast({
          title: "Authentication required",
          description: "Please log in to sync legislation",
          variant: "destructive",
        });
        setSyncing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('sync-legislative-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Sync complete!",
        description: `Synced ${data.totalBillsSynced} bills from ${Object.keys(data.sources).length} sources`,
      });

      await fetchBills();
      await checkLastSync();
    } catch (error) {
      console.error('Error syncing bills:', error);
      toast({
        title: "Sync failed",
        description: "Could not sync bills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const filterBills = () => {
    let filtered = bills;

    if (searchQuery) {
      filtered = filtered.filter(bill =>
        bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.bill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.sponsor?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(bill => bill.status === statusFilter);
    }

    setFilteredBills(filtered);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              📚 Live Legislative Feed
            </CardTitle>
            <CardDescription>
              {lastSyncTime && (
                <span className="text-xs">
                  Last synced: {new Date(lastSyncTime).toLocaleString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button onClick={handleRefresh} disabled={syncing} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
        <div className="space-y-2 mt-4">
          <Input
            placeholder="Search bills, sponsors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Introduced">Introduced</SelectItem>
              <SelectItem value="Committee Review">Committee Review</SelectItem>
              <SelectItem value="Passed House">Passed House</SelectItem>
              <SelectItem value="Passed Senate">Passed Senate</SelectItem>
              <SelectItem value="Enacted">Enacted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm text-muted-foreground">
          Showing {filteredBills.length} of {bills.length} bills
        </div>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {filteredBills.map((bill) => (
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
                      {bill.source && (
                        <Badge variant="outline" className="text-xs">
                          {bill.source}
                        </Badge>
                      )}
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

                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Read Summary
                  </Button>
                  {bill.official_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(bill.official_url, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
