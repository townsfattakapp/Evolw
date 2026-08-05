import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { Code2, MonitorPlay, Box, HeadphonesIcon, Cpu, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../lib/animations";
import { PAGE_SEO } from "../lib/seo/site";
import { serviceSchemas, breadcrumbSchema } from "../lib/seo/schema";

const SERVICES = [
  {
    id: "software",
    title: "Software Engineering",
    icon: Code2,
    description: "End-to-end engineering of bespoke software systems.",
    span: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    bg: "bg-white dark:bg-evolw-black"
  },
  {
    id: "web",
    title: "Web Platforms",
    icon: MonitorPlay,
    description: "High-performance, responsive web platforms built on modern stacks.",
    span: "col-span-1 lg:col-span-1 row-span-2",
    bg: "bg-evolw-black text-white"
  },
  {
    id: "product",
    title: "Product Design",
    icon: Box,
    description: "Transforming concepts into market-ready products with scalable architecture.",
    span: "col-span-1 lg:col-span-1 row-span-1",
    bg: "bg-white dark:bg-evolw-black"
  },
  {
    id: "consulting",
    title: "Tech Consulting",
    icon: Cpu,
    description: "Strategic planning, stack selection, and architecture design.",
    span: "col-span-1 lg:col-span-1 row-span-1",
    bg: "bg-white dark:bg-evolw-black"
  },
  {
    id: "support",
    title: "Continuous Support",
    icon: HeadphonesIcon,
    description: "Long-term maintenance, security updates, and performance tuning.",
    span: "col-span-1 md:col-span-2 lg:col-span-3 row-span-1",
    bg: "bg-evolw-gray-50 dark:bg-evolw-gray-900"
  }
];

export function Services() {
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
      
      {/* Hyper-Minimalist Hero */}
      <section className="pt-32 pb-20 md:pt-72 md:pb-48 bg-white dark:bg-evolw-black overflow-hidden">
        <Container>
          <motion.div 
            className="max-w-5xl mx-auto text-center md:text-left"
            initial="initial"
            animate="whileInView"
            variants={staggerContainer}
          >
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter mb-6 md:mb-12 text-evolw-black dark:text-white leading-[1.1] md:leading-[1.05] text-balance">
              Engineering for complex scale.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg sm:text-xl md:text-3xl text-evolw-gray-500 dark:text-evolw-gray-400 font-medium tracking-tight max-w-3xl mx-auto md:mx-0 leading-relaxed text-balance">
              We partner with businesses to provide deep technical expertise, from initial architecture to ongoing platform support.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Services Bento Grid */}
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
                {/* For black box, add gradient */}
                {service.bg.includes('bg-evolw-black text-white') && (
                  <div className="absolute inset-0 bg-gradient-to-b from-evolw-gray-900 to-transparent opacity-30"></div>
                )}
                
                <div className="relative z-10">
                  <service.icon className={`w-10 h-10 md:w-12 md:h-12 mb-6 md:mb-10 transition-transform duration-500 group-hover:scale-110 ${service.bg.includes('text-white') ? 'text-white' : 'text-evolw-gray-900 dark:text-white'}`} strokeWidth={1.5} />
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tighter leading-tight">{service.title}</h3>
                  <p className={`text-base sm:text-lg md:text-xl font-medium max-w-md leading-relaxed ${service.bg.includes('text-white') ? 'text-white/70' : 'text-evolw-gray-500 dark:text-evolw-gray-400'}`}>
                    {service.description}
                  </p>
                </div>
                
                <Link to="/contact" className={`relative z-10 inline-flex items-center font-semibold mt-8 md:mt-12 group-hover:translate-x-2 transition-transform duration-500 ${service.bg.includes('text-white') ? 'text-white' : 'text-evolw-accent'}`}>
                  Discover <ArrowRight className="ml-3 w-5 h-5" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>
      
      {/* High Contrast CTA */}
      <Section className="bg-white dark:bg-evolw-black py-20 md:py-40">
        <Container>
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="bg-evolw-black text-white rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[3rem] px-6 py-12 sm:px-10 sm:py-16 md:p-32 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-evolw-gray-900 via-evolw-black to-evolw-black opacity-50"></div>
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-7xl font-bold mb-6 md:mb-10 tracking-tighter leading-[1.1] text-balance">
                Ready to build?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-2xl text-white/70 font-medium tracking-tight mb-8 md:mb-16 max-w-2xl mx-auto leading-relaxed text-balance">
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
    </>
  );
}
