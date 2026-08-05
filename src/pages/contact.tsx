import React, { useState } from "react";
import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Phone, MapPin, Mail, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence, type Transition, type Variants } from "framer-motion";
import { api, ApiError } from "../lib/api";
import { PAGE_SEO } from "../lib/seo/site";
import { contactPageSchema, localBusinessSchema, breadcrumbSchema } from "../lib/seo/schema";

const ease = [0.32, 0.72, 0, 1] as const;

const fadeUpTransition: Transition = { duration: 0.9, ease };

const fadeUp: Variants = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0, transition: fadeUpTransition },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const contactInfo = [
  {
    icon: Mail,
    label: "Email Us",
    value: "hello@evolw.in",
    subtext: "We respond within 24 hours",
    href: "mailto:hello@evolw.in",
    accent: "#2563eb",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 92092 50725",
    subtext: null,
    href: "tel:+919209250725",
    accent: "#7c3aed",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Waraseoni, Balaghat\nMadhya Pradesh, India",
    subtext: null,
    href: null,
    accent: "#0891b2",
  },
];

const services = [
  "Software Development",
  "Web Applications",
  "Product Engineering",
  "Tech Consulting",
  "Careers",
  "Other",
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    help: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Required";
    if (!formData.email.trim()) {
      e.email = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "Invalid email";
    }
    if (!formData.message.trim()) e.message = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const result = await api.createLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        service: formData.help || undefined,
        subject: formData.help || undefined,
        company: "Direct Lead",
        message: formData.message,
      });

      if (!result.success) {
        throw new Error("Server did not confirm the submission");
      }

      setIsSuccess(true);
      setFormData({ name: "", email: "", phone: "", help: "", message: "" });
    } catch (err) {
      console.error("[contact] Failed to submit lead", err);
      const message =
        err instanceof ApiError
          ? err.message
          : "Failed to send. Please email us directly at hello@evolw.in";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  return (
    <>
      <SEO
        title={PAGE_SEO.contact.title}
        description={PAGE_SEO.contact.description}
        path={PAGE_SEO.contact.path}
        keywords={PAGE_SEO.contact.keywords}
        jsonLd={[
          contactPageSchema(),
          localBusinessSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />

      {/* ─── HERO ─────────────────────────────────── */}
      <section className="relative min-h-[60vh] flex items-end bg-evolw-black overflow-hidden pt-40 pb-20 md:pt-56 md:pb-32">
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-evolw-accent/20 blur-[120px] opacity-60" />
          <div className="absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] opacity-50" />
        </div>

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <Container className="relative z-10">
          <motion.div initial="initial" animate="animate" variants={stagger}>
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.3em] uppercase text-white/40 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Get In Touch
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-bold tracking-tighter text-white leading-[1.02] mb-8 max-w-5xl"
            >
              Let's build something{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-evolw-accent via-blue-400 to-violet-400">
                extraordinary.
              </span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-xl md:text-2xl text-white/50 font-medium max-w-2xl leading-relaxed tracking-tight"
            >
              Have an idea, a project, or just want to talk engineering? We're one message away.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* ─── MAIN CONTENT ─────────────────────────── */}
      <section className="bg-white dark:bg-evolw-black relative">
        <Container className="relative z-10">
          {/* Negative margin pulls the cards up over the hero */}
          <div className="relative -mt-12 pb-32 md:pb-48 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

            {/* ── Left Column: Contact Info ── */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="lg:col-span-1 space-y-4"
            >
              {contactInfo.map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  {item.href ? (
                    <a href={item.href} className="group flex items-start gap-5 p-7 rounded-2xl bg-evolw-gray-50 dark:bg-white/5 border border-evolw-gray-100 dark:border-white/5 hover:border-evolw-gray-300 dark:hover:border-white/15 hover:shadow-lg transition-all duration-500">
                      <div className="mt-0.5 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.accent}18` }}>
                        <item.icon className="w-5 h-5" style={{ color: item.accent }} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-evolw-gray-400 mb-1">{item.label}</p>
                        <p className="text-base font-bold text-evolw-black dark:text-white leading-snug whitespace-pre-line group-hover:text-evolw-accent transition-colors">
                          {item.value}
                        </p>
                        {(item as any).subtext && (
                          <p className="text-xs text-evolw-gray-400 mt-1">{(item as any).subtext}</p>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: item.accent }}>
                          Open <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-start gap-5 p-7 rounded-2xl bg-evolw-gray-50 dark:bg-white/5 border border-evolw-gray-100 dark:border-white/5">
                      <div className="mt-0.5 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.accent}18` }}>
                        <item.icon className="w-5 h-5" style={{ color: item.accent }} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-evolw-gray-400 mb-1">{item.label}</p>
                        <p className="text-base font-bold text-evolw-black dark:text-white leading-snug whitespace-pre-line">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

            </motion.div>

            {/* ── Right Column: Form ── */}
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease, delay: 0.15 } satisfies Transition}
              className="lg:col-span-2"
            >
              <div className="bg-white dark:bg-[#0d0d0d] rounded-3xl border border-evolw-gray-100 dark:border-white/8 shadow-2xl overflow-hidden">
                {/* Form Header */}
                <div className="px-8 md:px-10 pt-8 md:pt-10 pb-6 border-b border-evolw-gray-100 dark:border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-evolw-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-evolw-black dark:text-white relative z-10">
                    Send a message
                  </h2>
                  <p className="text-evolw-gray-500 mt-2 relative z-10">Fill in the details and we'll be in touch soon.</p>
                </div>

                <div className="px-8 md:px-10 py-8 md:py-10">
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-16 text-center"
                      >
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-3xl font-bold tracking-tighter text-evolw-black dark:text-white mb-3">Message received!</h3>
                        <p className="text-evolw-gray-500 text-lg mb-8 max-w-sm mx-auto leading-relaxed">
                          Our engineering team will get back to you within 24 hours.
                        </p>
                        <button
                          onClick={() => setIsSuccess(false)}
                          className="px-8 py-3 rounded-full border border-evolw-gray-200 dark:border-white/10 text-sm font-semibold hover:bg-evolw-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          Send another message
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-5"
                      >
                        {/* Name + Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Full Name" error={errors.name} required>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              onFocus={() => setFocused("name")}
                              onBlur={() => setFocused(null)}
                              placeholder="Your name"
                              className={inputClass(!!errors.name, focused === "name")}
                            />
                          </Field>
                          <Field label="Email Address" error={errors.email} required>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              onFocus={() => setFocused("email")}
                              onBlur={() => setFocused(null)}
                              placeholder="you@company.com"
                              className={inputClass(!!errors.email, focused === "email")}
                            />
                          </Field>
                        </div>

                        {/* Phone + Service */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Phone" optional>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              onFocus={() => setFocused("phone")}
                              onBlur={() => setFocused(null)}
                              placeholder="+91 00000 00000"
                              className={inputClass(false, focused === "phone")}
                            />
                          </Field>
                          <Field label="How can we help?">
                            <select
                              name="help"
                              value={formData.help}
                              onChange={handleChange}
                              className={inputClass(false, focused === "help") + " appearance-none cursor-pointer"}
                              onFocus={() => setFocused("help")}
                              onBlur={() => setFocused(null)}
                            >
                              <option value="">Select a service...</option>
                              {services.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </Field>
                        </div>

                        {/* Message */}
                        <Field label="Message" error={errors.message} required>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            onFocus={() => setFocused("message")}
                            onBlur={() => setFocused(null)}
                            rows={5}
                            placeholder="Tell us about your project, idea, or question..."
                            className={inputClass(!!errors.message, focused === "message") + " resize-none"}
                          />
                        </Field>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="group w-full relative h-14 md:h-16 rounded-2xl bg-evolw-black dark:bg-white text-white dark:text-black font-bold text-base md:text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-evolw-accent/20 disabled:opacity-60"
                        >
                          {/* Gradient overlay on hover */}
                          <span className="absolute inset-0 bg-gradient-to-r from-evolw-accent to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Sending...
                              </span>
                            ) : (
                              <>
                                Send Message
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </span>
                        </button>


                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────

function inputClass(hasError: boolean, isFocused: boolean) {
  return [
    "w-full px-5 py-4 rounded-xl text-base outline-none transition-all duration-300",
    "bg-evolw-gray-50 dark:bg-black/60",
    "text-evolw-black dark:text-white",
    "placeholder:text-evolw-gray-400 dark:placeholder:text-white/20",
    hasError
      ? "border-2 border-red-400 dark:border-red-500"
      : isFocused
      ? "border-2 border-evolw-accent ring-4 ring-evolw-accent/10"
      : "border border-evolw-gray-200 dark:border-white/8 hover:border-evolw-gray-300 dark:hover:border-white/15",
  ]
    .filter(Boolean)
    .join(" ");
}

function Field({
  label,
  error,
  required,
  optional,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-evolw-accent text-xs">*</span>}
        {optional && <span className="text-xs font-normal text-evolw-gray-400">(Optional)</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-500 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
