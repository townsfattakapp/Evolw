import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";
import { Button } from "../components/ui/button";
import { ShoppingCart, Store, Box, LineChart, AppWindow, Smartphone } from "lucide-react";
import appHome from "../assets/fattakse_home.jpg";
import appSuccess from "../assets/fattakse_success.jpg";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../lib/animations";

export function Products() {
  return (
    <>
      <SEO title="Products | EVOLW" description="Technology products built around real-world problems." />
      
      {/* Hyper-Minimalist Hero */}
      <section className="pt-48 pb-32 md:pt-72 md:pb-48 bg-white dark:bg-evolw-black overflow-hidden">
        <Container>
          <motion.div 
            className="max-w-5xl mx-auto"
            initial="initial"
            animate="whileInView"
            variants={staggerContainer}
          >
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter mb-12 text-evolw-black dark:text-white leading-[1.05]">
              Products built for real-world impact.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-2xl md:text-3xl text-evolw-gray-500 dark:text-evolw-gray-400 font-medium tracking-tight max-w-3xl leading-relaxed text-balance">
              We engineer platforms that connect businesses, modernize operations, and create unprecedented opportunities for scale.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Edge-to-Edge Fattakse Showcase */}
      <Section className="bg-evolw-black text-white py-40 md:py-56 border-y border-white/5 overflow-hidden">
        <Container>
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="flex flex-col lg:flex-row gap-24 lg:gap-32 items-center"
          >
            <div className="lg:w-1/2 relative z-10">
              <motion.div variants={fadeInUp} className="inline-flex items-center space-x-4 mb-10">
                <span className="text-[11px] font-bold tracking-[0.25em] text-white/50 uppercase bg-white/5 border border-white/10 px-5 py-2 rounded-full">Featured Unit</span>
              </motion.div>
              
              <motion.h2 variants={fadeInUp} className="text-7xl md:text-[7rem] font-bold tracking-tighter mb-6 leading-none">Fattakse</motion.h2>
              <motion.p variants={fadeInUp} className="text-2xl font-bold tracking-tight text-evolw-accent mb-12">A Unit of Evolw</motion.p>
              
              <motion.p variants={fadeInUp} className="text-2xl text-white/70 mb-16 leading-relaxed font-medium tracking-tight max-w-xl text-balance">
                A connected commerce platform designed to bring local businesses, customers and commerce infrastructure together natively.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12 mb-16">
                {[
                  { icon: Store, text: "Local Commerce" },
                  { icon: AppWindow, text: "Business OS" },
                  { icon: ShoppingCart, text: "Smart Ordering" },
                  { icon: Box, text: "Live Inventory" },
                  { icon: Smartphone, text: "Mobile POS" },
                  { icon: LineChart, text: "Real-time Data" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                      <item.icon className="w-6 h-6 text-white/80" strokeWidth={1.5} />
                    </div>
                    <span className="font-semibold tracking-tight text-xl">{item.text}</span>
                  </div>
                ))}
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6">
                <Button asChild size="lg" className="h-16 px-12 text-lg rounded-full bg-white text-evolw-black hover:bg-evolw-gray-200 shadow-2xl">
                  <a href="https://fattakse.in" target="_blank" rel="noopener noreferrer">
                    Visit fattakse.in
                  </a>
                </Button>
                <div className="flex gap-4">
                  <Button asChild size="icon" className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border-white/10 transition-all">
                    <a href="https://apps.apple.com/in/app/fattakse/id6785628271" target="_blank" rel="noopener noreferrer">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-6 h-6 fill-current"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                    </a>
                  </Button>
                  <Button asChild size="icon" className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border-white/10 transition-all">
                    <a href="https://play.google.com/store/apps/details?id=com.fattakse.user&hl=en_IN" target="_blank" rel="noopener noreferrer">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 fill-current"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>
            
            <motion.div variants={fadeInUp} className="lg:w-1/2 w-full relative h-[600px] flex items-center justify-center mt-20 lg:mt-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-evolw-accent/10 rounded-full blur-[100px] opacity-70"></div>
              
              {/* Product Devices */}
              <div className="absolute left-1/2 -translate-x-2/3 top-1/2 -translate-y-1/2 w-[280px] h-[580px] rounded-[3rem] border-[16px] border-[#222] overflow-hidden shadow-2xl z-10 bg-white transform -rotate-6 hover:rotate-0 transition-all duration-700">
                <img src={appHome} alt="Fattakse Home Screen" className="object-cover w-full h-full" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/3 top-1/2 -translate-y-1/2 w-[280px] h-[580px] rounded-[3rem] border-[16px] border-[#222] overflow-hidden shadow-2xl z-20 bg-white transform rotate-6 translate-y-10 hover:rotate-0 hover:translate-y-0 transition-all duration-700">
                <img src={appSuccess} alt="Fattakse Success Screen" className="object-cover w-full h-full" />
              </div>
            </motion.div>
            
          </motion.div>
        </Container>
      </Section>
      
      {/* Future Products */}
      <Section className="bg-evolw-gray-50 dark:bg-evolw-gray-900 py-40 border-t border-evolw-gray-200 dark:border-white/5">
        <Container className="text-center">
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            variants={staggerContainer}
            className="max-w-3xl mx-auto"
          >
            <motion.h3 variants={fadeInUp} className="text-6xl md:text-7xl font-bold tracking-tighter mb-8 text-evolw-black dark:text-white">More platforms incoming.</motion.h3>
            <motion.p variants={fadeInUp} className="text-2xl text-evolw-gray-500 dark:text-evolw-gray-400 font-medium tracking-tight mb-16 leading-relaxed text-balance">
              Our engineering team is continuously working on new tools and systems to expand our enterprise ecosystem.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Button asChild variant="outline" size="lg" className="h-16 px-12 text-lg rounded-full bg-transparent border-evolw-gray-200 dark:border-white/10">
                <Link to="/contact">Partner with us</Link>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
