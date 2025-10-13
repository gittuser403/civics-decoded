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
import { Loader2, FileText } from "lucide-react";

const billSchema = z.object({
  bill_number: z.string().min(1, "Bill number is required").max(50, "Bill number must be less than 50 characters"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  short_description: z.string().min(1, "Short description is required").max(500, "Short description must be less than 500 characters"),
  full_text: z.string().min(1, "Full text is required"),
  category: z.string().min(1, "Category is required"),
  sponsor: z.string().max(100, "Sponsor name must be less than 100 characters").optional(),
  official_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  introduced_date: z.string().min(1, "Introduced date is required"),
  status: z.string().min(1, "Status is required"),
});

type BillFormValues = z.infer<typeof billSchema>;

const categories = [
  "Healthcare",
  "Education",
  "Environment",
  "Economy",
  "Transportation",
  "Technology",
  "Defense",
  "Agriculture",
  "Housing",
  "Other"
];

const statuses = [
  "Introduced",
  "In Committee",
  "Committee Approved",
  "Floor Vote Scheduled",
  "Passed House",
  "Passed Senate",
  "Sent to President",
  "Enacted",
  "Vetoed",
  "Failed"
];

const SubmitBill = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      bill_number: "",
      title: "",
      short_description: "",
      full_text: "",
      category: "",
      sponsor: "",
      official_url: "",
      introduced_date: "",
      status: "Introduced",
    },
  });

  const onSubmit = async (values: BillFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("bills").insert([
        {
          bill_number: values.bill_number,
          title: values.title,
          short_description: values.short_description,
          full_text: values.full_text,
          category: values.category,
          sponsor: values.sponsor || null,
          official_url: values.official_url || null,
          introduced_date: values.introduced_date,
          status: values.status,
          source: "user_submission",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Bill submitted successfully!",
        description: "Your bill has been added to the database.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error submitting bill:", error);
      toast({
        title: "Error submitting bill",
        description: "There was an error submitting your bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1 mb-4">
              <span className="text-sm font-medium text-primary">
                Contribute to transparency
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Submit a Bill
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help make legislation more accessible by submitting bills for analysis and discussion.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bill Information
            </CardTitle>
            <CardDescription>
              Fill in the details of the bill you'd like to submit. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="bill_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., H.R. 1234 or S. 567" {...field} />
                      </FormControl>
                      <FormDescription>
                        The official bill number (e.g., H.R. 1234, S. 567)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the official bill title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a brief summary of what this bill aims to do"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A concise summary of the bill's purpose (max 500 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="full_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Bill Text *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste the complete text of the bill here"
                          className="min-h-[200px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The complete text of the legislation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="sponsor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sen. Jane Smith" {...field} />
                        </FormControl>
                        <FormDescription>
                          Primary sponsor of the bill
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="introduced_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Introduced Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="official_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Official URL (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="url" 
                          placeholder="https://www.congress.gov/bill/..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Link to the official bill page (e.g., Congress.gov)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 justify-end pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Bill"
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

export default SubmitBill;
