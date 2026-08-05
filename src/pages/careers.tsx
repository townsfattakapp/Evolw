import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../lib/animations";

export function Careers() {
  return (
    <>
      <SEO title="Careers | EVOLW" description="Join our engineering team and build technology that matters." />
      
      {/* Hyper-Minimalist Hero */}
      <section className="pt-32 pb-24 md:pt-72 md:pb-48 bg-white dark:bg-evolw-black overflow-hidden">
        <Container>
          <motion.div 
            className="max-w-5xl text-center mx-auto"
            initial="initial"
            animate="whileInView"
            variants={staggerContainer}
          >
            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter mb-8 md:mb-12 text-evolw-black dark:text-white leading-[1.1] md:leading-[1.05]">
              Build technology that matters.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-xl sm:text-2xl md:text-3xl text-evolw-gray-500 dark:text-evolw-gray-400 font-medium tracking-tight max-w-3xl mx-auto leading-relaxed text-balance">
              We are a team of engineers, designers, and problem solvers building scalable platforms for modern businesses.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Culture Bento Grid */}
      <Section className="bg-evolw-black text-white py-24 md:py-40 border-t border-white/5">
        <Container>
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            <motion.div variants={fadeInUp} className="p-8 md:p-14 rounded-[2rem] bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 group">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white text-evolw-black flex items-center justify-center mb-8 md:mb-10 transition-transform duration-500 group-hover:scale-110">
                <span className="font-display font-bold text-xl md:text-2xl tracking-tighter">1</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tighter">Autonomy</h3>
              <p className="text-lg md:text-xl text-white/70 font-medium leading-relaxed">
                We hire smart people and get out of their way. You own your work from architecture to deployment.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="p-8 md:p-14 rounded-[2rem] bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 group">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white text-evolw-black flex items-center justify-center mb-8 md:mb-10 transition-transform duration-500 group-hover:scale-110">
                <span className="font-display font-bold text-xl md:text-2xl tracking-tighter">2</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tighter">Craftsmanship</h3>
              <p className="text-lg md:text-xl text-white/70 font-medium leading-relaxed">
                We care about code quality, performance, and the small details that make a product great.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="p-8 md:p-14 rounded-[2rem] bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 group">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white text-evolw-black flex items-center justify-center mb-8 md:mb-10 transition-transform duration-500 group-hover:scale-110">
                <span className="font-display font-bold text-xl md:text-2xl tracking-tighter">3</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tighter">Growth</h3>
              <p className="text-lg md:text-xl text-white/70 font-medium leading-relaxed">
                Technology moves fast. We provide the time and resources needed to learn new stacks and methodologies.
              </p>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Open Positions */}
      <Section className="bg-evolw-gray-50 dark:bg-evolw-gray-900 py-24 md:py-40 border-t border-evolw-gray-200 dark:border-white/5">
        <Container>
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-7xl font-bold mb-12 md:mb-20 text-center tracking-tighter text-evolw-black dark:text-white">Open Positions</motion.h2>
            <motion.div variants={fadeInUp}>
              <JobsList />
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </>
  );
}

function JobsList() {
  const { content } = useContent();
  const jobs = content.jobs || [];

  if (jobs.length === 0) {
    return (
      <div className="bg-white dark:bg-evolw-black rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-24 text-center border border-evolw-gray-200 dark:border-white/5 shadow-sm">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-evolw-gray-100 dark:bg-white/5 mx-auto mb-8 md:mb-10 flex items-center justify-center">
          <svg className="w-8 h-8 md:w-10 md:h-10 text-evolw-gray-500 dark:text-evolw-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-2xl sm:text-3xl md:text-4xl text-evolw-black dark:text-white font-bold mb-4 md:mb-6 tracking-tighter">
          We don't have an open role right now.
        </p>
        <p className="text-lg md:text-xl text-evolw-gray-500 dark:text-evolw-gray-400 font-medium mb-10 md:mb-12 max-w-lg mx-auto leading-relaxed text-balance">
          If you're an engineer, designer, or product manager who aligns with our principles, we'd still love to hear from you.
        </p>
        <Button asChild size="lg" className="h-14 md:h-16 px-8 md:px-12 text-base md:text-lg rounded-full w-full sm:w-auto">
          <Link to="/contact">Introduce Yourself</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {jobs.map((job: any) => (
        <div key={job.id} className="bg-white dark:bg-evolw-black rounded-[2rem] md:rounded-[2.5rem] border border-evolw-gray-200 dark:border-white/5 p-8 md:p-14 hover:shadow-xl hover:border-evolw-gray-300 dark:hover:border-white/10 transition-all duration-500 group">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-10">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-6 md:mb-8">
                <span className="px-4 py-1.5 bg-evolw-accent/10 text-evolw-accent-dark dark:text-evolw-accent rounded-full text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                  {job.department}
                </span>
                <span className="text-xs md:text-sm font-bold tracking-wider text-evolw-gray-500 dark:text-evolw-gray-400 uppercase">
                  {job.location} • {job.type}
                </span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tighter text-evolw-black dark:text-white group-hover:text-evolw-accent transition-colors">{job.title}</h3>
              <p className="text-lg md:text-xl font-medium text-evolw-gray-500 dark:text-evolw-gray-400 leading-relaxed max-w-2xl">
                {job.description}
              </p>
            </div>
            <div className="shrink-0 mt-4 md:mt-0 flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
              <Button asChild size="lg" variant="outline" className="h-12 md:h-14 px-8 rounded-full border-evolw-gray-200 dark:border-white/10 hover:bg-evolw-gray-50 dark:hover:bg-white/5 bg-transparent w-full sm:w-auto">
                <Link to={`/careers/${job.id}`}>View Details</Link>
              </Button>
              <Button asChild size="lg" className="h-12 md:h-14 px-8 rounded-full w-full sm:w-auto">
                <Link to={`/careers/${job.id}#apply`}>Apply Now</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
