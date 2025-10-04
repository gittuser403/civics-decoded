import { Header } from "@/components/Header";
import { BillSummarizer } from "@/components/BillSummarizer";
import { ArgumentCards } from "@/components/ArgumentCards";
import { BillTracker } from "@/components/BillTracker";
import { ContactRep } from "@/components/ContactRep";

const Index = () => {
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
        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          <div className="space-y-8">
            <BillSummarizer />
            <ArgumentCards />
          </div>
          
          <div className="space-y-8">
            <BillTracker />
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
