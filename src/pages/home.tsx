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
import {
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
  faqSchema,
  serviceSchemas,
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
          faqSchema(HOME_FAQS),
          ...serviceSchemas(),
          breadcrumbSchema([{ name: "Home", path: "/" }]),
        ]}
      />
      
      {/* Hyper-Minimalist Hero Section */}
      <section className="relative pt-48 pb-32 md:pt-72 md:pb-56 overflow-hidden bg-white dark:bg-evolw-black">
        <Container className="relative z-10 flex flex-col items-center">
          <motion.div 
            className="w-full max-w-6xl text-center"
            initial="initial"
            animate="whileInView"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-12 flex justify-center">
              <span className="inline-flex items-center px-4 py-1.5 text-[11px] font-bold tracking-[0.25em] text-evolw-gray-500 dark:text-evolw-gray-400 uppercase bg-evolw-gray-50 dark:bg-white/5 rounded-full border border-evolw-gray-200 dark:border-white/10">
                {hero.badge}
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter mb-10 text-evolw-black dark:text-white leading-[1.05]">
              {hero.titleLine1} <br className="hidden md:block" />
              {hero.titleLine2} <span className="text-evolw-accent italic pr-2">{hero.titleHighlight}</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-evolw-gray-500 dark:text-evolw-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed font-medium tracking-tight text-balance">
              {hero.subtitle}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/products">Explore Products</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                <Link to="/contact">Talk to Engineering</Link>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Bento Box Layout - High Contrast */}
      <Section className="bg-evolw-gray-50 dark:bg-evolw-gray-900 border-y border-evolw-gray-200 dark:border-white/5">
        <Container>
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="mb-24 md:mb-32 text-center max-w-4xl mx-auto"
          >
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-evolw-black dark:text-white leading-[1.1]">
              Technology built for <br/>real business.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-2xl text-evolw-gray-500 dark:text-evolw-gray-400 font-medium tracking-tight text-balance mx-auto">
              Solving complex operational challenges with scalable, reliable, and user-centric software.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {/* Bento Box 1 - Spans 2 columns */}
            <motion.div variants={fadeInUp} className="md:col-span-2 p-12 md:p-16 rounded-[2rem] bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/5 group hover:shadow-2xl transition-all duration-700 relative overflow-hidden flex flex-col justify-end min-h-[450px]">
              <div className="absolute top-12 left-12">
                <AppWindow className="w-12 h-12 text-evolw-gray-900 dark:text-white transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
              </div>
              <div className="relative z-10 mt-auto pt-32">
                <h3 className="text-4xl font-bold mb-6 tracking-tighter text-evolw-black dark:text-white">Software Products</h3>
                <p className="text-xl text-evolw-gray-500 dark:text-evolw-gray-400 max-w-lg leading-relaxed font-medium">Build highly scalable, reliable software designed entirely around your real-world business workflows.</p>
              </div>
            </motion.div>
            
            {/* Bento Box 2 - Tall Box */}
            <motion.div variants={fadeInUp} className="md:col-span-1 md:row-span-2 p-12 md:p-16 rounded-[2rem] bg-evolw-black text-white flex flex-col justify-between group overflow-hidden relative min-h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-b from-evolw-black to-evolw-gray-900"></div>
              <div className="relative z-10">
                <Code className="w-12 h-12 mb-10 text-white/50 transition-transform duration-500 group-hover:rotate-6" strokeWidth={1.5} />
                <h3 className="text-4xl font-bold mb-6 tracking-tighter leading-tight text-white">Modern Web Platforms</h3>
                <p className="text-xl text-white/70 font-medium leading-relaxed">Modern, responsive, and high-performance web applications built on cutting-edge stacks like React and Node.</p>
              </div>
              <Link to="/products" className="relative z-10 flex items-center text-white/90 font-semibold group-hover:translate-x-2 transition-transform duration-500 mt-12 w-fit cursor-pointer">
                Learn more <ArrowRight className="ml-3 w-5 h-5" />
              </Link>
            </motion.div>
            
            {/* Bento Box 3 */}
            <motion.div variants={fadeInUp} className="md:col-span-1 p-10 md:p-12 rounded-[2rem] bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/5 min-h-[320px] group hover:shadow-xl transition-all duration-500">
              <Server className="w-10 h-10 mb-8 text-evolw-accent transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
              <h3 className="text-3xl font-bold mb-4 tracking-tighter text-evolw-black dark:text-white">Business Systems</h3>
              <p className="text-lg text-evolw-gray-500 dark:text-evolw-gray-400 font-medium leading-relaxed">Technology that helps businesses manage massive operations securely.</p>
            </motion.div>
            
            {/* Bento Box 4 */}
            <motion.div variants={fadeInUp} className="md:col-span-1 p-10 md:p-12 rounded-[2rem] bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/5 min-h-[320px] group hover:shadow-xl transition-all duration-500">
              <Shield className="w-10 h-10 mb-8 text-evolw-accent transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
              <h3 className="text-3xl font-bold mb-4 tracking-tighter text-evolw-black dark:text-white">Software Support</h3>
              <p className="text-lg text-evolw-gray-500 dark:text-evolw-gray-400 font-medium leading-relaxed">Long-term engineering, maintenance and rigorous platform improvement.</p>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Full-Width Product Showcase */}
      <Section className="bg-evolw-black text-white overflow-hidden py-40 md:py-56 relative">
        <Container className="relative z-10">
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="text-center mb-24"
          >
            <motion.span variants={fadeInUp} className="inline-block text-xs font-bold tracking-[0.25em] text-white/50 uppercase mb-8">
              Featured Product
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-7xl md:text-[9rem] font-bold tracking-tighter mb-10 leading-none">
              Fattakse
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-white/70 font-medium tracking-tight max-w-3xl mx-auto mb-16 leading-relaxed text-balance">
              A connected commerce platform designed to bring local businesses and digital infrastructure together.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button asChild size="lg" className="bg-white text-evolw-black hover:bg-evolw-gray-200 hover:text-evolw-black h-16 px-12 text-lg">
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

      {/* AI / SEO FAQ — semantic answers for search & AI overviews */}
      <Section className="bg-white dark:bg-evolw-black border-t border-evolw-gray-200 dark:border-white/5 py-24 md:py-32">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-10 text-evolw-black dark:text-white text-center">
              Frequently asked questions
            </h2>
            <dl className="space-y-8">
              {HOME_FAQS.map((faq) => (
                <div key={faq.question}>
                  <dt className="text-xl font-semibold text-evolw-black dark:text-white mb-2">
                    {faq.question}
                  </dt>
                  <dd className="text-lg text-evolw-gray-500 dark:text-evolw-gray-400 leading-relaxed">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm font-semibold">
              <Link to="/services" className="text-evolw-accent hover:underline">
                Our services
              </Link>
              <Link to="/products" className="text-evolw-accent hover:underline">
                Products
              </Link>
              <Link to="/about" className="text-evolw-accent hover:underline">
                About EVOLW
              </Link>
              <Link to="/contact" className="text-evolw-accent hover:underline">
                Contact us
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
