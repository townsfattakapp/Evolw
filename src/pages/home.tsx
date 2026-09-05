import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Server, AppWindow, Shield } from "lucide-react";
import { motion } from "framer-motion";
import appHome from "../assets/fattakse_home.jpg";
import appSuccess from "../assets/fattakse_success.jpg";
import { useContent } from "../context/ContentContext";
import { fadeInUp, staggerContainer } from "../lib/animations";
import { PAGE_SEO } from "../lib/seo/site";
import { LiquidGlass } from "../components/ui/liquid-glass";
import {
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
  faqSchema,
  serviceSchemas,
  fattakseProductSchema,
  fattakseBrandSchema,
  HOME_FAQS,
  breadcrumbSchema,
} from "../lib/seo/schema";

export function Home() {
  const { content } = useContent();
  const { hero } = content;
  const page = PAGE_SEO.home;

  return (
    <>
      <SEO
        title={page.title}
        description={page.description}
        path={page.path}
        keywords={page.keywords}
        jsonLd={[
          organizationSchema(),
          websiteSchema(),
          localBusinessSchema(),
          fattakseBrandSchema(),
          fattakseProductSchema(),
          faqSchema(HOME_FAQS),
          ...serviceSchemas(),
          breadcrumbSchema([{ name: "Home", path: "/" }]),
        ]}
      />

      <section className="relative pt-36 pb-24 md:pt-56 md:pb-40 overflow-hidden bg-transparent">
        <Container className="relative z-10 flex flex-col items-center">
          <LiquidGlass variant="hero" className="w-full max-w-6xl text-center">
            <motion.div
              className="w-full"
              initial="initial"
              animate="whileInView"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="mb-10 flex justify-center">
                <span className="liquid-glass liquid-glass--chip liquid-glass--interactive inline-flex items-center text-[11px] font-bold tracking-[0.25em] text-evolw-gray-700 dark:text-evolw-gray-300 uppercase">
                  {hero.badge}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter mb-8 text-evolw-black dark:text-white leading-[1.05]"
              >
                {hero.titleLine1} <br className="hidden md:block" />
                {hero.titleLine2}{" "}
                <span className="text-evolw-accent italic pr-2">{hero.titleHighlight}</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-3xl text-evolw-gray-700 dark:text-evolw-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium tracking-tight text-balance"
              >
                {hero.subtitle}
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6"
              >
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/products">Explore Products</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/15 backdrop-blur-md"
                >
                  <Link to="/contact">Talk to Engineering</Link>
                </Button>
              </motion.div>
            </motion.div>
          </LiquidGlass>
        </Container>
      </section>

      <Section className="bg-transparent border-y border-white/40 dark:border-white/5">
        <Container>
          <LiquidGlass variant="hero" className="mb-16 md:mb-24 text-center max-w-4xl mx-auto">
            <motion.div initial="initial" whileInView="whileInView" variants={staggerContainer}>
              <motion.h2
                variants={fadeInUp}
                className="text-4xl md:text-7xl font-bold tracking-tighter mb-6 text-evolw-black dark:text-white leading-[1.1]"
              >
                Technology built for <br />
                real business.
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-2xl text-evolw-gray-700 dark:text-evolw-gray-300 font-medium tracking-tight text-balance mx-auto"
              >
                Solving complex operational challenges with scalable, reliable, and user-centric
                software.
              </motion.p>
            </motion.div>
          </LiquidGlass>

          <motion.div
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            <motion.div variants={fadeInUp} className="md:col-span-2">
              <LiquidGlass
                variant="panel"
                className="h-full p-10 md:p-16 group hover:shadow-2xl transition-all duration-700 flex flex-col justify-end min-h-[420px]"
              >
                <div className="absolute top-10 left-10 z-[1]">
                  <AppWindow
                    className="w-12 h-12 text-evolw-gray-900 dark:text-white transition-transform duration-500 group-hover:scale-110"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="relative z-10 mt-auto pt-28">
                  <h3 className="text-3xl md:text-4xl font-bold mb-5 tracking-tighter text-evolw-black dark:text-white">
                    Software Products
                  </h3>
                  <p className="text-lg md:text-xl text-evolw-gray-700 dark:text-evolw-gray-300 max-w-lg leading-relaxed font-medium">
                    Build highly scalable, reliable software designed entirely around your
                    real-world business workflows.
                  </p>
                </div>
              </LiquidGlass>
            </motion.div>

            <motion.div variants={fadeInUp} className="md:col-span-1 md:row-span-2">
              <div className="h-full p-10 md:p-16 rounded-[1.75rem] bg-evolw-black/90 backdrop-blur-xl border border-white/10 text-white flex flex-col justify-between group overflow-hidden relative min-h-[480px] shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40 pointer-events-none" />
                <div className="relative z-10">
                  <Code
                    className="w-12 h-12 mb-10 text-white/50 transition-transform duration-500 group-hover:rotate-6"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-3xl md:text-4xl font-bold mb-6 tracking-tighter leading-tight text-white">
                    Modern Web Platforms
                  </h3>
                  <p className="text-lg md:text-xl text-white/75 font-medium leading-relaxed">
                    Modern, responsive, and high-performance web applications built on cutting-edge
                    stacks like React and Node.
                  </p>
                </div>
                <Link
                  to="/products"
                  className="relative z-10 flex items-center text-white/90 font-semibold group-hover:translate-x-2 transition-transform duration-500 mt-12 w-fit cursor-pointer"
                >
                  Learn more <ArrowRight className="ml-3 w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <LiquidGlass
                variant="panel"
                className="h-full p-8 md:p-12 min-h-[280px] group hover:shadow-xl transition-all duration-500"
              >
                <Server
                  className="w-10 h-10 mb-8 text-evolw-accent transition-transform duration-500 group-hover:scale-110"
                  strokeWidth={1.5}
                />
                <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tighter text-evolw-black dark:text-white">
                  Business Systems
                </h3>
                <p className="text-base md:text-lg text-evolw-gray-700 dark:text-evolw-gray-300 font-medium leading-relaxed">
                  Technology that helps businesses manage massive operations securely.
                </p>
              </LiquidGlass>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <LiquidGlass
                variant="panel"
                className="h-full p-8 md:p-12 min-h-[280px] group hover:shadow-xl transition-all duration-500"
              >
                <Shield
                  className="w-10 h-10 mb-8 text-evolw-accent transition-transform duration-500 group-hover:scale-110"
                  strokeWidth={1.5}
                />
                <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tighter text-evolw-black dark:text-white">
                  Software Support
                </h3>
                <p className="text-base md:text-lg text-evolw-gray-700 dark:text-evolw-gray-300 font-medium leading-relaxed">
                  Long-term engineering, maintenance and rigorous platform improvement.
                </p>
              </LiquidGlass>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      <Section className="bg-evolw-black/92 text-white overflow-hidden py-40 md:py-56 relative backdrop-blur-xl border-y border-white/10">
        <Container className="relative z-10">
          <motion.div
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="text-center mb-24"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block text-xs font-bold tracking-[0.25em] text-white/50 uppercase mb-8"
            >
              Featured Product
            </motion.span>
            <motion.h2
              variants={fadeInUp}
              className="text-7xl md:text-[9rem] font-bold tracking-tighter mb-10 leading-none"
            >
              Fattakse
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-2xl md:text-3xl text-white/70 font-medium tracking-tight max-w-3xl mx-auto mb-16 leading-relaxed text-balance"
            >
              A connected commerce platform designed to bring local businesses and digital
              infrastructure together.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button
                asChild
                size="lg"
                className="bg-white text-evolw-black hover:bg-evolw-gray-200 hover:text-evolw-black h-16 px-12 text-lg"
              >
                <a href="https://fattakse.in" target="_blank" rel="noopener noreferrer">
                  Explore Platform
                </a>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", mass: 1.2, stiffness: 60, damping: 20 }}
            className="flex justify-center items-center gap-8 md:gap-16 mt-32"
          >
            <div className="w-[300px] md:w-[420px] h-auto rounded-[3rem] overflow-hidden border-[16px] border-evolw-gray-900 shadow-2xl relative">
              <img
                src={appHome}
                alt="Fattakse mobile app home screen for local commerce and business operations"
                className="w-full h-auto"
                loading="lazy"
                decoding="async"
                width={420}
                height={840}
              />
            </div>
            <div className="w-[280px] md:w-[380px] h-auto rounded-[3rem] overflow-hidden border-[16px] border-evolw-gray-900 shadow-2xl relative mt-40 hidden md:block">
              <img
                src={appSuccess}
                alt="Fattakse app success confirmation interface"
                className="w-full h-auto"
                loading="lazy"
                decoding="async"
                width={380}
                height={760}
              />
            </div>
          </motion.div>
        </Container>
      </Section>

      <Section className="bg-transparent border-t border-white/40 dark:border-white/5 py-24 md:py-32">
        <Container>
          <LiquidGlass variant="dense" className="max-w-3xl mx-auto p-8 md:p-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-10 text-evolw-black dark:text-white text-center">
              Frequently asked questions
            </h2>
            <dl className="space-y-8">
              {HOME_FAQS.map((faq) => (
                <div key={faq.question}>
                  <dt className="text-xl font-semibold text-evolw-black dark:text-white mb-2">
                    {faq.question}
                  </dt>
                  <dd className="text-evolw-gray-700 dark:text-evolw-gray-300 text-lg leading-relaxed">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </LiquidGlass>
        </Container>
      </Section>
    </>
  );
}
