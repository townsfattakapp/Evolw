import { useEffect, useState } from "react";
import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import {
  Code2,
  MonitorPlay,
  Box,
  HeadphonesIcon,
  Cpu,
  Sparkles,
  ArrowRight,
  X,
  Check,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { fadeInUp, spring, staggerContainer } from "../lib/animations";
import { PAGE_SEO } from "../lib/seo/site";
import { serviceSchemas, breadcrumbSchema } from "../lib/seo/schema";

type ServiceDetail = {
  id: string;
  title: string;
  icon: typeof Code2;
  description: string;
  span: string;
  bg: string;
  contactValue: string;
  tagline: string;
  longDescription: string;
  deliverables: string[];
  process: { title: string; detail: string }[];
  fitFor: string;
};

const SERVICES: ServiceDetail[] = [
  {
    id: "software",
    title: "Software Engineering",
    icon: Code2,
    description: "End-to-end engineering of bespoke software systems.",
    span: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    bg: "bg-white dark:bg-evolw-black",
    contactValue: "Software Development",
    tagline: "Custom systems built for reliability at scale.",
    longDescription:
      "We design and ship production-grade software — from core business platforms to internal tools — with clean architecture, strong testing, and deployment pipelines you can trust.",
    deliverables: [
      "Domain modeling & system architecture",
      "Backend APIs, services, and data layers",
      "CI/CD, observability, and release hygiene",
      "Performance, security, and maintainability reviews",
    ],
    process: [
      { title: "Discover", detail: "Map goals, constraints, and success metrics with your team." },
      { title: "Architect", detail: "Define stack, boundaries, and a phased delivery plan." },
      { title: "Build", detail: "Ship in tight iterations with demos and measurable progress." },
      { title: "Harden", detail: "Load, security, and operational readiness before go-live." },
    ],
    fitFor: "Teams that need bespoke software — not a template — and care about long-term ownership.",
  },
  {
    id: "web",
    title: "Web Platforms",
    icon: MonitorPlay,
    description: "High-performance, responsive web platforms built on modern stacks.",
    span: "col-span-1 lg:col-span-1 row-span-2",
    bg: "bg-evolw-black text-white",
    contactValue: "Web Applications",
    tagline: "Fast, accessible interfaces that convert and scale.",
    longDescription:
      "We build web platforms that feel instant on mobile and rock-solid under growth — marketing sites, product dashboards, and customer-facing apps with SEO and analytics baked in.",
    deliverables: [
      "Responsive product & marketing experiences",
      "Design systems that stay consistent as you grow",
      "SEO, Core Web Vitals, and analytics foundations",
      "Auth, dashboards, and content workflows when needed",
    ],
    process: [
      { title: "Frame", detail: "Clarify journeys, content, and conversion goals." },
      { title: "Prototype", detail: "Validate structure and interaction before heavy build." },
      { title: "Ship", detail: "Launch a polished MVP with room to expand." },
      { title: "Optimize", detail: "Tune speed, SEO, and conversion with real usage data." },
    ],
    fitFor: "Brands and products that need a web surface people trust and return to.",
  },
  {
    id: "product",
    title: "Product Design",
    icon: Box,
    description: "Transforming concepts into market-ready products with scalable architecture.",
    span: "col-span-1 lg:col-span-1 row-span-1",
    bg: "bg-white dark:bg-evolw-black",
    contactValue: "Product Engineering",
    tagline: "From concept to a product users actually adopt.",
    longDescription:
      "We turn ambiguous ideas into shippable product slices — clarifying scope, UX, and technical foundations so you can learn from the market without rebuilding from scratch later.",
    deliverables: [
      "Product discovery & prioritization",
      "UX flows and interaction design",
      "MVP architecture ready for iteration",
      "Launch plan with clear success metrics",
    ],
    process: [
      { title: "Clarify", detail: "Pressure-test the problem, audience, and must-haves." },
      { title: "Shape", detail: "Define UX and technical boundaries for a credible MVP." },
      { title: "Build", detail: "Deliver a focused release that real users can try." },
      { title: "Learn", detail: "Instrument usage and decide what to double down on." },
    ],
    fitFor: "Founders and teams with a strong idea who need a disciplined path to launch.",
  },
  {
    id: "consulting",
    title: "Tech Consulting",
    icon: Cpu,
    description: "Strategic planning, stack selection, and architecture design.",
    span: "col-span-1 lg:col-span-1 row-span-1",
    bg: "bg-white dark:bg-evolw-black",
    contactValue: "Tech Consulting",
    tagline: "Clear technical decisions before expensive mistakes.",
    longDescription:
      "We help you choose stacks, redesign architecture, and sequence delivery so engineering investment compounds — whether you're starting fresh or modernizing a legacy system.",
    deliverables: [
      "Architecture & stack recommendations",
      "Technical due diligence and risk maps",
      "Roadmaps with effort and dependency clarity",
      "Team process and delivery coaching",
    ],
    process: [
      { title: "Audit", detail: "Review current systems, team, and constraints." },
      { title: "Decide", detail: "Align on architecture and trade-offs in plain language." },
      { title: "Plan", detail: "Sequence work into a realistic, fundable roadmap." },
      { title: "Guide", detail: "Stay close during execution as a technical partner." },
    ],
    fitFor: "Leaders who need confident technical direction before or during a major build.",
  },
  {
    id: "ai",
    title: "AI Integrated Products",
    icon: Sparkles,
    description:
      "Intelligent features woven into real products — assistants, automation, and decision support that ship.",
    span: "col-span-1 md:col-span-2 lg:col-span-3 row-span-1",
    bg: "bg-evolw-black text-white",
    contactValue: "AI Integrated Products",
    tagline: "AI that serves the product — not the other way around.",
    longDescription:
      "We build AI into software people already use: copilots, document intelligence, search, recommendations, and workflow automation. Models are selected for fit, cost, and reliability, with guardrails so outputs stay useful and trustworthy in production.",
    deliverables: [
      "AI feature discovery mapped to real business workflows",
      "LLM / vision / speech integrations with clear cost controls",
      "RAG, tools, and agents grounded in your data",
      "Evaluation, safety rails, and human-in-the-loop flows",
    ],
    process: [
      { title: "Identify", detail: "Find high-leverage tasks where AI saves time or unlocks new capability." },
      { title: "Prototype", detail: "Validate quality and economics with a thin, measurable spike." },
      { title: "Integrate", detail: "Ship into the product with auth, logging, and fallbacks." },
      { title: "Govern", detail: "Monitor quality, cost, and risk — then iterate with confidence." },
    ],
    fitFor: "Teams that want AI features inside a real product, not a disconnected chatbot experiment.",
  },
  {
    id: "support",
    title: "Continuous Support",
    icon: HeadphonesIcon,
    description: "Long-term maintenance, security updates, and performance tuning.",
    span: "col-span-1 md:col-span-2 lg:col-span-3 row-span-1",
    bg: "bg-evolw-gray-50 dark:bg-evolw-gray-900",
    contactValue: "Other",
    tagline: "Keep what you shipped healthy, secure, and fast.",
    longDescription:
      "After launch, we stay with your product — monitoring health, shipping fixes and improvements, and keeping dependencies and security posture current so your team can focus on growth.",
    deliverables: [
      "Proactive monitoring and incident response",
      "Security patches and dependency updates",
      "Performance tuning and reliability work",
      "Feature iteration on a predictable cadence",
    ],
    process: [
      { title: "Baseline", detail: "Establish health metrics, ownership, and SLAs." },
      { title: "Stabilize", detail: "Clear backlog of risk and reliability issues." },
      { title: "Improve", detail: "Ship continuous upgrades without disrupting users." },
      { title: "Report", detail: "Transparent updates on health, risk, and next priorities." },
    ],
    fitFor: "Teams that want a trusted engineering partner after the first release.",
  },
];

export function Services() {
  const [active, setActive] = useState<ServiceDetail | null>(null);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <>
      <SEO
        title={PAGE_SEO.services.title}
        description={PAGE_SEO.services.description}
        path={PAGE_SEO.services.path}
        keywords={PAGE_SEO.services.keywords}
        jsonLd={[
          ...serviceSchemas(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
        ]}
      />

      <section className="pt-32 pb-20 md:pt-72 md:pb-48 bg-white dark:bg-evolw-black overflow-hidden">
        <Container>
          <motion.div
            className="max-w-5xl mx-auto text-center md:text-left"
            initial="initial"
            animate="whileInView"
            variants={staggerContainer}
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter mb-6 md:mb-12 text-evolw-black dark:text-white leading-[1.1] md:leading-[1.05] text-balance"
            >
              Engineering for complex scale.
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl md:text-3xl text-evolw-gray-500 dark:text-evolw-gray-400 font-medium tracking-tight max-w-3xl mx-auto md:mx-0 leading-relaxed text-balance"
            >
              We partner with businesses to provide deep technical expertise, from initial architecture to ongoing platform support.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      <Section className="bg-evolw-gray-50 dark:bg-[#050505] py-20 md:py-40 border-t border-evolw-gray-200 dark:border-white/5">
        <Container>
          <motion.div
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr"
          >
            {SERVICES.map((service) => (
              <motion.div
                key={service.id}
                variants={fadeInUp}
                className={`${service.span} p-8 sm:p-10 md:p-16 rounded-[1.5rem] md:rounded-[2rem] border border-evolw-gray-200 dark:border-white/5 hover:border-evolw-gray-300 dark:hover:border-white/20 hover:shadow-2xl transition-all duration-700 relative overflow-hidden group flex flex-col justify-between min-h-[280px] md:min-h-[350px] ${service.bg}`}
                id={service.id}
              >
                {service.bg.includes("bg-evolw-black text-white") && (
                  <div className="absolute inset-0 bg-gradient-to-b from-evolw-gray-900 to-transparent opacity-30" />
                )}

                <div className="relative z-10">
                  <service.icon
                    className={`w-10 h-10 md:w-12 md:h-12 mb-6 md:mb-10 transition-transform duration-500 group-hover:scale-110 ${
                      service.bg.includes("text-white")
                        ? "text-white"
                        : "text-evolw-gray-900 dark:text-white"
                    }`}
                    strokeWidth={1.5}
                  />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tighter leading-tight">
                    {service.title}
                  </h3>
                  <p
                    className={`text-base sm:text-lg md:text-xl font-medium max-w-md leading-relaxed ${
                      service.bg.includes("text-white")
                        ? "text-white/70"
                        : "text-evolw-gray-500 dark:text-evolw-gray-400"
                    }`}
                  >
                    {service.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActive(service)}
                  className={`relative z-10 inline-flex items-center font-semibold mt-8 md:mt-12 group-hover:translate-x-2 transition-transform duration-500 text-left cursor-pointer ${
                    service.bg.includes("text-white") ? "text-white" : "text-evolw-accent"
                  }`}
                >
                  Discover <ArrowRight className="ml-3 w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      <Section className="bg-white dark:bg-evolw-black py-20 md:py-40">
        <Container>
          <motion.div
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="bg-evolw-black text-white rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] px-6 py-12 sm:px-10 sm:py-16 md:p-32 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-evolw-gray-900 via-evolw-black to-evolw-black opacity-50" />
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-7xl font-bold mb-6 md:mb-10 tracking-tighter leading-[1.1] text-balance"
              >
                Ready to build?
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg md:text-2xl text-white/70 font-medium tracking-tight mb-8 md:mb-16 max-w-2xl mx-auto leading-relaxed text-balance"
              >
                Let's discuss how our engineering team can architect your next major platform.
              </motion.p>
              <motion.div variants={fadeInUp} className="w-full flex justify-center">
                <Button
                  asChild
                  size="lg"
                  className="h-12 sm:h-14 md:h-16 w-full sm:w-auto px-8 sm:px-12 text-base md:text-lg rounded-full bg-white text-evolw-black hover:bg-evolw-gray-200"
                >
                  <Link to="/contact">Contact Engineering</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </Container>
      </Section>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              aria-label="Close service details"
              className="absolute inset-0 bg-evolw-black/70 backdrop-blur-md"
              onClick={() => setActive(null)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`service-title-${active.id}`}
              className="relative z-10 w-full sm:max-w-3xl lg:max-w-4xl max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto bg-white dark:bg-evolw-slate text-evolw-black dark:text-white rounded-t-[1.75rem] sm:rounded-[2rem] shadow-2xl border border-evolw-gray-200 dark:border-white/10"
              initial={{ y: 80, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.98 }}
              transition={spring.smooth}
            >
              <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 sm:px-8 py-4 bg-white/90 dark:bg-evolw-slate/90 backdrop-blur-md border-b border-evolw-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <active.icon className="w-6 h-6 shrink-0 text-evolw-accent" strokeWidth={1.5} />
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-evolw-gray-500 truncate">
                    Service deep dive
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="p-2 rounded-full hover:bg-evolw-gray-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 sm:px-8 md:px-10 pt-6 sm:pt-8 pb-10 sm:pb-12">
                <motion.div
                  initial="initial"
                  animate="whileInView"
                  variants={staggerContainer}
                >
                  <motion.p
                    variants={fadeInUp}
                    className="text-sm font-medium text-evolw-accent mb-3 tracking-tight"
                  >
                    {active.tagline}
                  </motion.p>
                  <motion.h2
                    id={`service-title-${active.id}`}
                    variants={fadeInUp}
                    className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter leading-[1.1] mb-5 text-balance"
                  >
                    {active.title}
                  </motion.h2>
                  <motion.p
                    variants={fadeInUp}
                    className="text-base sm:text-lg md:text-xl text-evolw-gray-500 dark:text-evolw-gray-400 font-medium leading-relaxed max-w-2xl mb-10"
                  >
                    {active.longDescription}
                  </motion.p>

                  <motion.div variants={fadeInUp} className="mb-10">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-evolw-gray-500 mb-4">
                      What you get
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {active.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-sm sm:text-base font-medium leading-snug"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-evolw-accent/10 text-evolw-accent">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="mb-10">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-evolw-gray-500 mb-5">
                      How we work
                    </h3>
                    <ol className="relative space-y-0 border-l border-evolw-gray-200 dark:border-white/10 ml-2.5">
                      {active.process.map((step, i) => (
                        <li key={step.title} className="relative pl-6 sm:pl-8 pb-6 last:pb-0">
                          <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-evolw-accent ring-4 ring-white dark:ring-evolw-slate" />
                          <p className="text-xs font-semibold uppercase tracking-widest text-evolw-gray-400 mb-1">
                            0{i + 1}
                          </p>
                          <p className="text-lg font-bold tracking-tight mb-1">{step.title}</p>
                          <p className="text-sm sm:text-base text-evolw-gray-500 dark:text-evolw-gray-400 leading-relaxed">
                            {step.detail}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    className="rounded-2xl bg-evolw-gray-50 dark:bg-white/[0.04] border border-evolw-gray-100 dark:border-white/5 p-5 sm:p-6 mb-8"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-evolw-gray-500 mb-2">
                      Best fit
                    </p>
                    <p className="text-base sm:text-lg font-medium leading-relaxed text-balance">
                      {active.fitFor}
                    </p>
                  </motion.div>

                  <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row gap-3 sm:items-center"
                  >
                    <Button
                      asChild
                      size="lg"
                      className="h-12 sm:h-14 rounded-full px-8 text-base bg-evolw-black dark:bg-white text-white dark:text-evolw-black hover:opacity-90"
                    >
                      <Link
                        to={`/contact?help=${encodeURIComponent(active.contactValue)}`}
                        onClick={() => setActive(null)}
                      >
                        Start this conversation
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                    <button
                      type="button"
                      onClick={() => setActive(null)}
                      className="h-12 sm:h-14 px-6 text-sm font-semibold text-evolw-gray-500 hover:text-evolw-black dark:hover:text-white transition-colors"
                    >
                      Keep browsing
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
