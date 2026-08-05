import { Link } from "react-router-dom";
import { Container } from "../ui/container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-evolw-gray-50 border-t border-evolw-gray-200 pt-24 pb-12 dark:bg-evolw-black dark:border-evolw-gray-800">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 lg:gap-12 mb-24">
          <div className="lg:col-span-2 pr-8">
            <Link to="/" className="inline-block mb-8 group">
              <span className="font-display text-3xl font-bold tracking-tight text-evolw-black dark:text-white uppercase flex items-baseline">
                EVOLW<span className="text-evolw-accent text-4xl leading-none transition-transform duration-300 group-hover:scale-125 inline-block">.</span>
              </span>
            </Link>
            <p className="text-evolw-gray-500 dark:text-evolw-gray-400 max-w-sm mb-6 text-base leading-relaxed text-balance">
              Building software, products, and digital infrastructure for modern businesses. Engineering excellence without compromise.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg tracking-tight text-evolw-black dark:text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-evolw-gray-500 dark:text-evolw-gray-400">
              <li><Link to="/about" className="hover:text-evolw-black dark:hover:text-white transition-colors">About</Link></li>
              <li><Link to="/careers" className="hover:text-evolw-black dark:hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-evolw-black dark:hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg tracking-tight text-evolw-black dark:text-white mb-6">Products</h4>
            <ul className="space-y-4 text-sm text-evolw-gray-500 dark:text-evolw-gray-400">
              <li><Link to="/products" className="hover:text-evolw-black dark:hover:text-white transition-colors">Fattakse</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg tracking-tight text-evolw-black dark:text-white mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-evolw-gray-500 dark:text-evolw-gray-400">
              <li><Link to="/services#software" className="hover:text-evolw-black dark:hover:text-white transition-colors">Software Development</Link></li>
              <li><Link to="/services#web" className="hover:text-evolw-black dark:hover:text-white transition-colors">Web Applications</Link></li>
              <li><Link to="/services#product" className="hover:text-evolw-black dark:hover:text-white transition-colors">Product Engineering</Link></li>
              <li><Link to="/services#support" className="hover:text-evolw-black dark:hover:text-white transition-colors">Support & Maintenance</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-evolw-gray-200 dark:border-evolw-gray-800 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-sm text-evolw-gray-400 dark:text-evolw-gray-500 text-center md:text-left">
            <p className="mb-1">© {currentYear} EVOLW. All rights reserved.</p>
            <p>Fattakse — A Unit of EVOLW</p>
          </div>
          
          <div className="flex space-x-8 text-sm font-medium text-evolw-gray-400 dark:text-evolw-gray-500">
            <Link to="/admin" className="hover:text-evolw-black dark:hover:text-white transition-colors">Admin Login</Link>
            <Link to="/privacy" className="hover:text-evolw-black dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-evolw-black dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
