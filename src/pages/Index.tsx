import { useState } from "react";
import { Header } from "@/components/Header";
import { BillSummarizer } from "@/components/BillSummarizer";
import { ArgumentCards } from "@/components/ArgumentCards";
import { BillTracker } from "@/components/BillTracker";
import { ContactRep } from "@/components/ContactRep";
import { BillsList } from "@/components/BillsList";
import { BillImpact } from "@/components/BillImpact";

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

const Index = () => {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1 mb-4">
            <span className="text-sm font-medium text-primary">
              Making legislation accessible to everyone
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Understand Complex Bills
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform confusing legal language into clear, simple explanations. 
            Perfect for students, educators, and engaged citizens.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          {/* Left Column - Bills List */}
          <div className="lg:col-span-1">
            <BillsList onSelectBill={setSelectedBill} />
          </div>

          {/* Middle Column - Summarizer & Arguments */}
          <div className="lg:col-span-1 space-y-8">
            <BillSummarizer 
              selectedBill={selectedBill} 
              onClearBill={() => setSelectedBill(null)}
            />
            <ArgumentCards bill={selectedBill} />
          </div>
          
          {/* Right Column - Tracker, Impact & Contact */}
          <div className="lg:col-span-1 space-y-8">
            <BillTracker bill={selectedBill} />
            <BillImpact bill={selectedBill} />
            <ContactRep />
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 rounded-xl bg-primary/5 border border-primary/20 p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            🎓 Built for Students & Citizens
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our mission is to make government more transparent and accessible. 
            Every citizen deserves to understand the laws that affect their lives.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
