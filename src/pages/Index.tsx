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
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2 mb-6 shadow-card animate-float">
            <span className="text-sm font-heading font-semibold text-white">
              ✨ Making legislation accessible to everyone
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
            Understand Complex Bills
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            Transform confusing legal language into clear, simple explanations. 
            Perfect for students, educators, and engaged citizens. 🎓
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3 mb-12 animate-slide-up">
          {/* Left Column - Bills List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
              <BillsList onSelectBill={setSelectedBill} />
            </div>
          </div>

          {/* Middle Column - Summarizer & Arguments */}
          <div className="lg:col-span-1 space-y-8">
            <div className="rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
              <BillSummarizer 
                selectedBill={selectedBill} 
                onClearBill={() => setSelectedBill(null)}
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
              <ArgumentCards bill={selectedBill} />
            </div>
          </div>
          
          {/* Right Column - Tracker, Impact & Contact */}
          <div className="lg:col-span-1 space-y-8">
            <div className="rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
              <BillTracker bill={selectedBill} />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
              <BillImpact bill={selectedBill} />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
              <ContactRep />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-16 rounded-3xl bg-gradient-primary p-8 text-center shadow-elevated animate-scale-in">
          <h3 className="text-2xl font-heading font-bold mb-3 text-white">
            🎓 Built for Students & Citizens
          </h3>
          <p className="text-white/90 max-w-2xl mx-auto text-lg font-medium">
            Our mission is to make government more transparent and accessible. 
            Every citizen deserves to understand the laws that affect their lives.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
