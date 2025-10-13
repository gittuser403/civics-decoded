import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lightbulb, Mail, MapPin, ExternalLink, Phone } from "lucide-react";

const proposalSchema = z.object({
  proposal_title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  problem_statement: z.string().min(1, "Problem statement is required").max(1000, "Must be less than 1000 characters"),
  proposed_solution: z.string().min(1, "Proposed solution is required"),
  expected_impact: z.string().min(1, "Expected impact is required").max(1000, "Must be less than 1000 characters"),
  category: z.string().min(1, "Category is required"),
  zip_code: z.string().min(5, "ZIP code must be 5 digits").max(5, "ZIP code must be 5 digits"),
  your_name: z.string().min(1, "Your name is required").max(100, "Name must be less than 100 characters"),
  your_email: z.string().email("Must be a valid email"),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

const categories = [
  "Healthcare",
  "Education",
  "Environment",
  "Economy",
  "Transportation",
  "Technology",
  "Public Safety",
  "Housing",
  "Infrastructure",
  "Other"
];

type Representative = {
  name: string;
  party: string;
  district: string;
  email: string;
  phone: string;
  website: string;
};

const ProposeBill = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [representative, setRepresentative] = useState<Representative | null>(null);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      proposal_title: "",
      problem_statement: "",
      proposed_solution: "",
      expected_impact: "",
      category: "",
      zip_code: "",
      your_name: "",
      your_email: "",
    },
  });

  const zipCode = form.watch("zip_code");

  const handleLookupRep = async () => {
    if (!zipCode || zipCode.length < 5) {
      toast({
        title: "Invalid ZIP code",
        description: "Please enter a valid 5-digit ZIP code",
        variant: "destructive",
      });
      return;
    }

    setIsLookingUp(true);

    try {
      const { data, error } = await supabase.functions.invoke('lookup-representative', {
        body: { zipCode }
      });

      if (error) throw error;

      setRepresentative(data.representative);
      toast({
        title: "Representative found!",
        description: "You can now send your proposal directly to them",
      });
    } catch (error) {
      console.error('Error looking up representative:', error);
      toast({
        title: "Error",
        description: "Could not look up representative. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const onSubmit = async (values: ProposalFormValues) => {
    if (!representative) {
      toast({
        title: "Find your representative first",
        description: "Please look up your representative before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Create email body
    const emailSubject = encodeURIComponent(`Constituent Proposal: ${values.proposal_title}`);
    const emailBody = encodeURIComponent(
      `Dear ${representative.name},\n\n` +
      `I am writing as your constituent to propose legislation regarding ${values.category.toLowerCase()}.\n\n` +
      `PROPOSAL TITLE:\n${values.proposal_title}\n\n` +
      `PROBLEM STATEMENT:\n${values.problem_statement}\n\n` +
      `PROPOSED SOLUTION:\n${values.proposed_solution}\n\n` +
      `EXPECTED IMPACT:\n${values.expected_impact}\n\n` +
      `I believe this proposal would benefit our community and hope you will consider it.\n\n` +
      `Sincerely,\n${values.your_name}\n${values.your_email}`
    );

    // Open email client
    window.location.href = `mailto:${representative.email}?subject=${emailSubject}&body=${emailBody}`;

    toast({
      title: "Email draft created!",
      description: "Your email client should open with your proposal",
    });

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4"
          >
            ← Back to Home
          </Button>
          
          <div className="text-center mb-8">
            <div className="inline-block rounded-full bg-accent/10 px-4 py-1 mb-4">
              <span className="text-sm font-medium text-accent">
                Make your voice heard
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Propose a Bill to Your Representatives
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Draft a legislative proposal and send it directly to your local government representatives. Increase civic engagement and shape the future of your community.
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              Your Proposal
            </CardTitle>
            <CardDescription>
              Describe the issue you'd like addressed and your proposed solution. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="proposal_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposal Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Install Solar Panels on Municipal Buildings" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, concise title for your legislative proposal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="problem_statement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Statement *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the issue that needs to be addressed in your community"
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Clearly explain the problem this proposal aims to solve
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proposed_solution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposed Solution *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your proposed solution in detail"
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Detail how you propose to address the problem
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expected_impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Impact *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What positive changes will this proposal bring to the community?"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the expected benefits and outcomes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Your Information</h3>
                  
                  <div className="grid gap-6 md:grid-cols-2 mb-6">
                    <FormField
                      control={form.control}
                      name="your_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="your_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input 
                              placeholder="12345" 
                              maxLength={5}
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            onClick={handleLookupRep} 
                            disabled={isLookingUp || zipCode?.length !== 5}
                          >
                            {isLookingUp ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <MapPin className="mr-2 h-4 w-4" />
                            )}
                            Find Rep
                          </Button>
                        </div>
                        <FormDescription>
                          We'll find your local representative to send your proposal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {representative && (
                  <Card className="bg-secondary/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                          {representative.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{representative.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {representative.district} • {representative.party}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {representative.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {representative.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ExternalLink className="h-4 w-4" />
                          <a 
                            href={representative.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Official Website
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-4 justify-end pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !representative}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Email...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send to Representative
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProposeBill;
