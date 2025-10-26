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
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-lg sm:text-2xl font-heading font-bold">Congressional Clarity</h1>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="sm:size-default" onClick={() => navigate("/auth?mode=login")}>
              Log In
            </Button>
            <Button size="sm" className="sm:size-default" onClick={() => navigate("/auth?mode=signup")}>
              <span className="hidden sm:inline">Sign Up</span>
              <span className="sm:hidden">Sign Up</span>
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 sm:px-6 py-2 sm:py-2.5 mb-4 sm:mb-6 shadow-elevated animate-float hover:shadow-glow transition-all duration-500 cursor-default">
          <span className="text-xs sm:text-sm font-heading font-bold text-white tracking-wide">
            ✨ Making legislation accessible to everyone
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-extrabold mb-4 sm:mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight max-w-5xl mx-auto px-4">
          Understand Complex Bills in Seconds
        </h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed mb-8 sm:mb-12 px-4">
          Transform confusing legal language into clear, simple explanations. 
          Perfect for students, educators, and engaged citizens.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Button size="lg" className="text-base sm:text-lg w-full sm:w-auto group" onClick={() => navigate("/auth?mode=signup")}>
            Get Started Free 
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          <Button size="lg" variant="outline" className="text-base sm:text-lg w-full sm:w-auto" onClick={() => navigate("/auth?mode=login")}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 animate-slide-up">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-center mb-8 sm:mb-12 md:mb-16 px-4">
          Powerful Features for Understanding Legislation
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <div className="group rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-card hover:shadow-elevated hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-500 shadow-glow">
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h4 className="text-lg sm:text-xl font-heading font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">AI-Powered Summaries</h4>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Get instant, easy-to-understand summaries of complex congressional bills in plain English.
            </p>
          </div>

          <div className="group rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-card hover:shadow-elevated hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-500 shadow-glow">
              <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h4 className="text-lg sm:text-xl font-heading font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">Bill Buddy Chat</h4>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Ask questions about any bill and get intelligent, conversational answers from our AI assistant.
            </p>
          </div>

          <div className="group rounded-3xl border-2 border-border bg-card p-6 sm:p-8 shadow-card hover:shadow-elevated hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer sm:col-span-2 lg:col-span-1">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-500 shadow-glow">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h4 className="text-lg sm:text-xl font-heading font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">Contact Representatives</h4>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Easily reach out to your elected officials and make your voice heard on issues that matter.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 animate-scale-in">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-primary p-8 sm:p-10 md:p-12 text-center shadow-elevated">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-6 sm:mb-8 text-white">
            Why Congressional Clarity?
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 text-left">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1 text-sm sm:text-base">Clear & Simple</p>
                <p className="text-white/90 text-xs sm:text-sm">No legal jargon - just plain English explanations</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1 text-sm sm:text-base">Stay Informed</p>
                <p className="text-white/90 text-xs sm:text-sm">Track bills and understand their real-world impact</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1 text-sm sm:text-base">Take Action</p>
                <p className="text-white/90 text-xs sm:text-sm">Connect directly with your representatives</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-semibold mb-1 text-sm sm:text-base">Free to Use</p>
                <p className="text-white/90 text-xs sm:text-sm">Built for students and citizens everywhere</p>
              </div>
            </div>
          </div>
          <Button 
            size="lg" 
            variant="secondary" 
            className="mt-6 sm:mt-8 text-base sm:text-lg w-full sm:w-auto"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Start Understanding Bills Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12 sm:mt-16 md:mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 Congressional Clarity. Making government transparent and accessible.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
