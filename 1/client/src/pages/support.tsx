import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Mail, HelpCircle, CheckCircle } from "lucide-react";
import { insertSupportTicketSchema, type InsertSupportTicket } from "@shared/schema";

export default function Support() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<InsertSupportTicket>({
    resolver: zodResolver(insertSupportTicketSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      priority: "medium"
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertSupportTicket) => {
      const response = await apiRequest("POST", "/api/support", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Support ticket submitted",
        description: "We'll get back to you within 24 hours!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InsertSupportTicket) => {
    submitMutation.mutate(data);
  };

  const faqs = [
    {
      question: "How do I download my purchased products?",
      answer: "After purchase, you'll receive an email with download links. You can also access your products from your account dashboard."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and cryptocurrency payments through our secure payment processor."
    },
    {
      question: "How long do license keys last?",
      answer: "License duration varies by product. Check the product description for specific duration details (1 day, 7 days, 30 days, or lifetime)."
    },
    {
      question: "What if my product doesn't work?",
      answer: "Contact our support team immediately. We offer 24/7 technical support and will help resolve any issues or provide refunds if necessary."
    },
    {
      question: "Can I get a refund?",
      answer: "Yes, we offer refunds within 24 hours of purchase if you experience technical issues that we cannot resolve."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="falling-dots"></div>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="heading-support">
              Support Center
            </h1>
            <p className="text-muted-foreground text-lg">
              Get help with your products or contact our support team
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card data-testid="card-contact-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Submit a support ticket and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8" data-testid="success-message">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ticket Submitted!</h3>
                    <p className="text-muted-foreground">
                      We've received your support request and will respond within 24 hours.
                    </p>
                    <Button 
                      onClick={() => setIsSubmitted(false)} 
                      className="mt-4"
                      data-testid="button-submit-another"
                    >
                      Submit Another Ticket
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your full name" 
                                {...field} 
                                data-testid="input-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your.email@example.com" 
                                {...field} 
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject/Order ID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Order ID" 
                                {...field} 
                                data-testid="input-subject"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please provide details about your issue..."
                                className="min-h-[120px]"
                                {...field} 
                                data-testid="textarea-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={submitMutation.isPending}
                        data-testid="button-submit-ticket"
                      >
                        {submitMutation.isPending ? "Submitting..." : "Submit Ticket"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card data-testid="card-faqs">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>
                  Quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-b-0" data-testid={`faq-${index}`}>
                      <h4 className="font-semibold text-foreground mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Support Options */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Card className="text-center p-6" data-testid="card-email-support">
              <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Direct email for urgent issues
              </p>
              <a 
                href="mailto:support@playdirty.com" 
                className="text-primary hover:underline text-sm"
                data-testid="link-email"
              >
                support@playdirty.com
              </a>
            </Card>

            <Card className="text-center p-6" data-testid="card-live-chat">
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Available 24/7 for instant help
              </p>
              <Button size="sm" data-testid="button-live-chat">
                Start Chat
              </Button>
            </Card>

            <Card className="text-center p-6" data-testid="card-response-time">
              <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Response Time</h3>
              <p className="text-sm text-muted-foreground">
                Average response within 2-4 hours
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}