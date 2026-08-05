import { Link } from "react-router-dom";
import { Container } from "../ui/container";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white dark:bg-evolw-black pt-24 pb-12 overflow-hidden">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-evolw-gray-200 dark:via-white/20 to-transparent"></div>
      
      {/* Subtle background glow for dark mode */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-evolw-accent/5 rounded-full blur-3xl pointer-events-none hidden dark:block"></div>
      
      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-20">
          
          {/* Brand Column (Centered on mobile, left on desktop) */}
          <div className="lg:max-w-sm flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link to="/" className="inline-block mb-6 group">
              <span className="font-display text-4xl font-bold tracking-tight text-evolw-black dark:text-white uppercase flex items-baseline">
                EVOLW<span className="text-evolw-accent text-5xl leading-none transition-transform duration-500 group-hover:scale-125 inline-block">.</span>
              </span>
            </Link>
            <p className="text-evolw-gray-500 dark:text-evolw-gray-400 text-lg leading-relaxed mb-8 max-w-xs md:max-w-md">
              Building software, products, and digital infrastructure for modern businesses. Engineering excellence without compromise.
            </p>
            
            {/* Contact Link */}
            <div className="flex items-center space-x-6">
              <a href="mailto:hello@evolw.in" className="text-sm font-semibold text-evolw-black dark:text-white hover:text-evolw-accent transition-colors flex items-center group">
                hello@evolw.in
                <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </div>
          </div>

          {/* Links Grid - 2 columns on mobile, 3 on md */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 flex-1 lg:pl-16">
            <div className="col-span-1">
              <h4 className="font-display font-semibold text-lg tracking-tight text-evolw-black dark:text-white mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium">About Us</Link></li>
                <li><Link to="/careers" className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium flex items-center">Careers <span className="ml-2 px-2 py-0.5 rounded-full bg-evolw-accent/10 text-evolw-accent text-[10px] font-bold uppercase tracking-wider">Hiring</span></Link></li>
                <li><Link to="/contact" className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium">Contact</Link></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-display font-semibold text-lg tracking-tight text-evolw-black dark:text-white mb-6">Products</h4>
              <ul className="space-y-4">
                <li><Link to="/products" className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium">Fattakse</Link></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="font-display font-semibold text-lg tracking-tight text-evolw-black dark:text-white mb-6">Services</h4>
              <ul className="space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-y-4">
                <li><Link to="/services#software" className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium">Software Development</Link></li>
                <li><Link to="/services#web" className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium">Web Applications</Link></li>
                <li><Link to="/services#product" className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium">Product Engineering</Link></li>
                <li><Link to="/services#support" className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium">Support & Maintenance</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-evolw-gray-200 dark:border-white/10">
          <div className="flex flex-col items-center md:items-start text-sm text-evolw-gray-400 dark:text-evolw-gray-500 font-medium space-y-1">
            <p>© {currentYear} EVOLW. All rights reserved.</p>
            <p className="opacity-75">Fattakse — A Unit of EVOLW</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-evolw-gray-400 dark:text-evolw-gray-500">
            <Link to="/admin" className="hover:text-evolw-black dark:hover:text-white transition-colors">Admin Login</Link>
            <Link to="/privacy" className="hover:text-evolw-black dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-evolw-black dark:hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
