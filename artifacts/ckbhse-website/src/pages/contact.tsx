import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { SectionReveal } from '@/components/section-reveal';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
            className="max-w-4xl"
          >
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Get in Touch
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Book a free consultation, discuss your HSEQ needs, or enquire
              about our services. We're here to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <SectionReveal>
                <h2 className="font-display font-bold text-3xl text-foreground mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6 mb-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Phone
                      </h3>
                      <a
                        href="tel:+442012345678"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-phone-contact"
                      >
                        +44 20 1234 5678
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Email
                      </h3>
                      <a
                        href="mailto:info@ckbhse.co.uk"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-email-contact"
                      >
                        info@ckbhse.co.uk
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Office
                      </h3>
                      <p className="text-muted-foreground">
                        CKBHSE Limited
                        <br />
                        123 Business Park
                        <br />
                        London, EC1A 1BB
                        <br />
                        United Kingdom
                      </p>
                    </div>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="bg-muted/50 rounded-xl p-6">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Office Hours
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Monday - Friday
                      </span>
                      <span className="font-medium text-foreground">
                        8:00 AM - 6:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium text-foreground">
                        9:00 AM - 1:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="font-medium text-foreground">
                        Closed
                      </span>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <SectionReveal delay={0.2}>
                <div className="bg-card border border-card-border rounded-2xl p-8">
                  <h2 className="font-display font-bold text-3xl text-foreground mb-2">
                    Book a Free Consultation
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Fill in the form below and we'll get back to you within 24
                    hours.
                  </p>

                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/10 border border-primary/20 rounded-xl p-8 text-center"
                    >
                      <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="font-display font-bold text-2xl text-foreground mb-2">
                        Thank You!
                      </h3>
                      <p className="text-muted-foreground">
                        We've received your enquiry and will be in touch within
                        24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            type="text"
                            required
                            className="mt-2"
                            data-testid="input-first-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            type="text"
                            required
                            className="mt-2"
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            className="mt-2"
                            data-testid="input-email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            className="mt-2"
                            data-testid="input-phone"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          type="text"
                          className="mt-2"
                          data-testid="input-company"
                        />
                      </div>

                      <div>
                        <Label htmlFor="service">Service Interest *</Label>
                        <Select required>
                          <SelectTrigger
                            className="mt-2"
                            data-testid="select-service"
                          >
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="health-safety-audits">
                              Health & Safety Audits
                            </SelectItem>
                            <SelectItem value="risk-assessments">
                              Risk Assessments & RAMS
                            </SelectItem>
                            <SelectItem value="iso-compliance">
                              ISO Compliance
                            </SelectItem>
                            <SelectItem value="fire-safety">
                              Fire Safety
                            </SelectItem>
                            <SelectItem value="environmental">
                              Environmental Management
                            </SelectItem>
                            <SelectItem value="training">
                              Training Courses
                            </SelectItem>
                            <SelectItem value="incident-investigation">
                              Incident Investigation
                            </SelectItem>
                            <SelectItem value="retainer">
                              Retainer Services
                            </SelectItem>
                            <SelectItem value="other">
                              Other / General Enquiry
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          required
                          rows={5}
                          className="mt-2"
                          placeholder="Tell us about your HSEQ requirements..."
                          data-testid="textarea-message"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full font-semibold group"
                        data-testid="button-submit-enquiry"
                      >
                        Send Enquiry
                        <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By submitting this form, you agree to our Privacy
                        Policy. We'll use your information to respond to your
                        enquiry.
                      </p>
                    </form>
                  )}
                </div>
              </SectionReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <SectionReveal className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">
                  Office Location
                </p>
                <p className="text-sm text-muted-foreground">
                  123 Business Park, London, EC1A 1BB
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </div>
  );
}
