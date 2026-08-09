import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { submitContactEnquiry } from '@workspace/api-client-react';
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
import { PageShell } from '@/components/page-shell';
import { PageContainer } from '@/components/page-container';
import { contentLoader } from '@/lib/content';

interface ContactFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  serviceInterest: string;
  message: string;
}

const initialFormState: ContactFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  serviceInterest: '',
  message: '',
};

function fieldLabel(label: string, required: boolean) {
  return required ? `${label} *` : label;
}

export default function Contact() {
  const content = contentLoader.getContactPage();
  const siteConfig = contentLoader.getSiteConfig();
  const fields = content.form.fields;
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField =
    (field: keyof ContactFormState) =>
    (value: string) => {
      setForm((current) => ({ ...current, [field]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const selectedService =
      content.form.serviceOptions.find(
        (option) => option.value === form.serviceInterest,
      )?.label ?? form.serviceInterest;

    try {
      await submitContactEnquiry({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        ...(form.phone ? { phone: form.phone } : {}),
        company: form.company,
        serviceInterest: selectedService,
        message: form.message,
      });

      setSubmitted(true);
      setForm(initialFormState);
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setErrorMessage(
        'We could not send your enquiry. Please try again or contact us by phone or email.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const [disclaimerBefore, disclaimerAfter] =
    content.form.disclaimer.split('Privacy Notice');

  return (
    <PageShell seo={content.seo} path="/contact">
      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-24">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
            className="max-w-4xl"
          >
            <h1
              id="page-title"
              tabIndex={-1}
              className="font-display font-bold text-5xl md:text-6xl mb-6 outline-none"
            >
              {content.hero.title}
            </h1>
            <p className="text-xl opacity-90 leading-relaxed">
              {content.hero.description}
            </p>
          </motion.div>
        </PageContainer>
      </section>

      <section className="py-20 bg-background">
        <PageContainer>
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <SectionReveal>
                <h2 className="font-display font-bold text-3xl text-foreground mb-6">
                  {content.contactHeading}
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
                        href={siteConfig.contact.phoneHref}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-phone-contact"
                      >
                        {siteConfig.contact.phone}
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
                        href={`mailto:${siteConfig.contact.email}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        data-testid="link-email-contact"
                      >
                        {siteConfig.contact.email}
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
                        {content.office.lines.map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < content.office.lines.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-6">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    {content.officeHours.title}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {content.officeHours.schedule.map((entry, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {entry.days}
                        </span>
                        <span className="font-medium text-foreground">
                          {entry.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionReveal>
            </div>

            <div className="lg:col-span-3">
              <SectionReveal delay={0.2}>
                <div className="bg-card border border-card-border rounded-2xl p-8">
                  <h2 className="font-display font-bold text-3xl text-foreground mb-4">
                    {content.form.title}
                  </h2>
                  <div className="space-y-4 text-muted-foreground mb-8 leading-relaxed">
                    {content.form.intro.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/10 border border-primary/20 rounded-xl p-8 text-center"
                    >
                      <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="font-display font-bold text-2xl text-foreground mb-2">
                        {content.form.successTitle}
                      </h3>
                      <p className="text-muted-foreground">
                        {content.form.successMessage}
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <h3 className="font-display font-semibold text-xl text-foreground">
                        {content.form.detailsHeading}
                      </h3>

                      {errorMessage !== null && (
                        <div
                          className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 text-sm text-destructive"
                          role="alert"
                        >
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <p>{errorMessage}</p>
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="firstName">
                            {fieldLabel(
                              fields.firstName.label,
                              fields.firstName.required,
                            )}
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            required={fields.firstName.required}
                            value={form.firstName}
                            onChange={(event) =>
                              updateField('firstName')(event.target.value)
                            }
                            placeholder={fields.firstName.placeholder}
                            className="mt-2"
                            data-testid="input-first-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">
                            {fieldLabel(
                              fields.lastName.label,
                              fields.lastName.required,
                            )}
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            required={fields.lastName.required}
                            value={form.lastName}
                            onChange={(event) =>
                              updateField('lastName')(event.target.value)
                            }
                            placeholder={fields.lastName.placeholder}
                            className="mt-2"
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="email">
                            {fieldLabel(
                              fields.email.label,
                              fields.email.required,
                            )}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            required={fields.email.required}
                            value={form.email}
                            onChange={(event) =>
                              updateField('email')(event.target.value)
                            }
                            placeholder={fields.email.placeholder}
                            className="mt-2"
                            data-testid="input-email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">
                            {fieldLabel(
                              fields.phone.label,
                              fields.phone.required,
                            )}
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            required={fields.phone.required}
                            value={form.phone}
                            onChange={(event) =>
                              updateField('phone')(event.target.value)
                            }
                            placeholder={fields.phone.placeholder}
                            className="mt-2"
                            data-testid="input-phone"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="company">
                          {fieldLabel(
                            fields.company.label,
                            fields.company.required,
                          )}
                        </Label>
                        <Input
                          id="company"
                          type="text"
                          required={fields.company.required}
                          value={form.company}
                          onChange={(event) =>
                            updateField('company')(event.target.value)
                          }
                          placeholder={fields.company.placeholder}
                          className="mt-2"
                          data-testid="input-company"
                        />
                      </div>

                      <div>
                        <Label htmlFor="service">
                          {fieldLabel(
                            fields.serviceInterest.label,
                            fields.serviceInterest.required,
                          )}
                        </Label>
                        <Select
                          required={fields.serviceInterest.required}
                          value={form.serviceInterest}
                          onValueChange={updateField('serviceInterest')}
                        >
                          <SelectTrigger
                            id="service"
                            className="mt-2"
                            data-testid="select-service"
                          >
                            <SelectValue
                              placeholder={fields.serviceInterest.placeholder}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {content.form.serviceOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="message">
                          {fieldLabel(
                            fields.message.label,
                            fields.message.required,
                          )}
                        </Label>
                        <Textarea
                          id="message"
                          required={fields.message.required}
                          rows={5}
                          value={form.message}
                          onChange={(event) =>
                            updateField('message')(event.target.value)
                          }
                          className="mt-2"
                          placeholder={fields.message.placeholder}
                          data-testid="textarea-message"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full font-semibold group"
                        disabled={submitting}
                        data-testid="button-submit-enquiry"
                      >
                        {submitting
                          ? content.form.submittingLabel
                          : content.form.submitLabel}
                        <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        {disclaimerBefore}
                        <Link
                          href="/privacy-policy"
                          className="underline underline-offset-2 hover:text-foreground"
                        >
                          Privacy Notice
                        </Link>
                        {disclaimerAfter}
                      </p>
                    </form>
                  )}
                </div>
              </SectionReveal>
            </div>
          </div>
        </PageContainer>
      </section>

      <SectionReveal className="py-20 bg-muted/30">
        <PageContainer>
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">
                  {content.office.mapLabel}
                </p>
                <p className="text-sm text-muted-foreground">
                  {content.office.mapAddress}
                </p>
              </div>
            </div>
          </div>
        </PageContainer>
      </SectionReveal>
    </PageShell>
  );
}
