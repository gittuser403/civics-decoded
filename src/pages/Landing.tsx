import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ArrowRight, CheckCircle2, BookOpen, MessageSquare, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/app");
      }
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/app");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-heading font-bold">Congressional Clarity</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/auth?mode=login")}>
              Log In
            </Button>
            <Button onClick={() => navigate("/auth?mode=signup")}>
              Sign Up <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2 mb-6 shadow-card animate-float">
          <span className="text-sm font-heading font-semibold text-white">
            Making legislation accessible to everyone
          </span>
        </div>
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight max-w-5xl mx-auto">
          Understand Complex Bills in Seconds
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed mb-12">
          Transform confusing legal language into clear, simple explanations. 
          Perfect for students, educators, and engaged citizens.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="text-lg" onClick={() => navigate("/auth?mode=signup")}>
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-lg" onClick={() => navigate("/auth?mode=login")}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 animate-slide-up">
        <h3 className="text-4xl font-heading font-bold text-center mb-16">
          Powerful Features for Understanding Legislation
        </h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-xl font-heading font-bold mb-3">AI-Powered Summaries</h4>
            <p className="text-muted-foreground">
              Get instant, easy-to-understand summaries of complex congressional bills in plain English.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-xl font-heading font-bold mb-3">Bill Buddy Chat</h4>
            <p className="text-muted-foreground">
              Ask questions about any bill and get intelligent, conversational answers from our AI assistant.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-xl font-heading font-bold mb-3">Contact Representatives</h4>
            <p className="text-muted-foreground">
              Easily reach out to your elected officials and make your voice heard on issues that matter.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 animate-scale-in">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-primary p-12 text-center shadow-elevated">
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-white">
            Why Congressional Clarity?
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 text-white flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1">Clear & Simple</p>
                <p className="text-white/90">No legal jargon - just plain English explanations</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 text-white flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1">Stay Informed</p>
                <p className="text-white/90">Track bills and understand their real-world impact</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 text-white flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1">Take Action</p>
                <p className="text-white/90">Connect directly with your representatives</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 text-white flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1">Free to Use</p>
                <p className="text-white/90">Built for students and citizens everywhere</p>
              </div>
            </div>
          </div>
          <Button 
            size="lg" 
            variant="secondary" 
            className="mt-8 text-lg"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Start Understanding Bills Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 Congressional Clarity. Making government transparent and accessible.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
