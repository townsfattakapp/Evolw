import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../lib/animations";
import { PAGE_SEO } from "../lib/seo/site";
import { aboutPageSchema, breadcrumbSchema, organizationSchema } from "../lib/seo/schema";

export function About() {
  return (
    <>
      <SEO
        title={PAGE_SEO.about.title}
        description={PAGE_SEO.about.description}
        path={PAGE_SEO.about.path}
        keywords={PAGE_SEO.about.keywords}
        jsonLd={[
          aboutPageSchema(),
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />
      
      {/* Hyper-Minimalist Hero */}
      <section className="pt-48 pb-32 md:pt-72 md:pb-48 bg-white dark:bg-evolw-black overflow-hidden">
        <Container>
          <motion.div 
            className="max-w-5xl mx-auto"
            initial="initial"
            animate="whileInView"
            variants={staggerContainer}
          >
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter mb-12 text-evolw-black dark:text-white leading-[1.05]">
              Technology should make business simpler, not more complicated.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-evolw-gray-500 dark:text-evolw-gray-400 font-medium tracking-tight max-w-3xl leading-relaxed text-balance">
              We are an engineering-first organization focused on designing scalable platforms that solve real operational bottlenecks.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Story & Mission - High Contrast */}
      <Section className="bg-evolw-black text-white py-40 border-t border-white/5">
        <Container>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-20 lg:gap-32"
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-5xl font-bold tracking-tighter mb-10 text-white">Our Story</h2>
              <div className="prose prose-xl prose-invert max-w-none text-white/70 font-medium leading-relaxed tracking-tight">
                <p>
                  EVOLW is an Indian MSME / Udyam-registered Micro enterprise focused on building modern digital products, business software, web platforms, and scalable technology solutions.
                </p>
                <p>
                  We recognized that many businesses struggle with complex, bloated software that hinders rather than helps their operations. Our goal was to create a technology company that prioritizes clean engineering, scalable architecture, and genuine business value.
                </p>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <h2 className="text-5xl font-bold tracking-tighter mb-10 text-white">Our Mission</h2>
              <div className="prose prose-xl prose-invert max-w-none text-white/70 font-medium leading-relaxed tracking-tight">
                <p>
                  <strong className="text-white">Mission:</strong> To engineer software platforms that solve real-world operational challenges, enabling businesses to scale efficiently.
                </p>
                <p className="mt-10">
                  <strong className="text-white">Vision:</strong> To become a foundational technology partner for businesses looking to modernize their digital infrastructure through high-quality products.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Principles - Bento Grid */}
      <Section className="bg-evolw-gray-50 dark:bg-evolw-gray-900 border-t border-evolw-gray-200 dark:border-white/5 py-40">
        <Container>
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="mb-24 max-w-3xl mx-auto text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-6xl md:text-7xl font-bold tracking-tighter mb-8 text-evolw-black dark:text-white">
              Our Principles
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-2xl text-evolw-gray-500 dark:text-evolw-gray-400 font-medium tracking-tight">
              The architectural standards we hold ourselves to.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Engineering First",
                desc: "We don't take shortcuts. We build software on solid architectural foundations designed to last."
              },
              {
                title: "Designed for Users",
                desc: "Complex systems don't have to be complicated to use. We prioritize intuitive design."
              },
              {
                title: "Performance Matters",
                desc: "Speed is a feature. We optimize for fast loading times, quick interactions, and efficient processing."
              },
              {
                title: "Long-term Thinking",
                desc: "We build systems that accommodate future growth, avoiding technical debt wherever possible."
              },
              {
                title: "Transparency",
                desc: "We communicate clearly about timelines, technical constraints, and architectural decisions."
              },
              {
                title: "Reliability",
                desc: "Our platforms are designed to be highly available and resilient because businesses depend on them."
              }
            ].map((principle, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="p-12 rounded-[2rem] bg-white dark:bg-evolw-black border border-evolw-gray-200 dark:border-white/5 hover:shadow-xl transition-all duration-500 min-h-[320px] flex flex-col justify-end group"
              >
                <h3 className="text-3xl font-bold mb-6 tracking-tighter text-evolw-black dark:text-white">{principle.title}</h3>
                <p className="text-lg text-evolw-gray-500 dark:text-evolw-gray-400 font-medium leading-relaxed">{principle.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
