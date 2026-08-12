import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { cn } from "../../lib/utils";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
  { name: "Community", href: "/community" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500 ease-out",
        isScrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-evolw-gray-200/50 py-3 dark:bg-evolw-black/70 dark:border-evolw-gray-800/50"
          : "bg-transparent py-6"
      )}
    >
      <Container>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 z-50 relative group">
            <span className="font-display text-2xl font-bold tracking-tight text-evolw-black dark:text-white uppercase flex items-baseline">
              EVOLW<span className="text-evolw-accent text-3xl leading-none transition-transform duration-300 group-hover:scale-125 inline-block">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-evolw-black dark:hover:text-white",
                  location.pathname === link.href
                    ? "text-evolw-black dark:text-white"
                    : "text-evolw-gray-500 dark:text-evolw-gray-400"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button asChild variant="default" size="sm" className="rounded-full">
              <Link to="/contact">Let's Talk</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle & Theme */}
          <div className="md:hidden flex items-center space-x-4 z-50 relative">
            <ThemeToggle />
            <button
              className="p-2 -mr-2 text-evolw-black dark:text-white transition-transform active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl dark:bg-evolw-black/95 pt-28 px-6 md:hidden flex flex-col h-screen"
          >
            <nav className="flex flex-col space-y-6 text-2xl font-display font-medium tracking-tight">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "block pb-4 border-b border-evolw-gray-100 dark:border-evolw-gray-900 transition-colors",
                      location.pathname === link.href
                        ? "text-evolw-black dark:text-white"
                        : "text-evolw-gray-500 dark:text-evolw-gray-400"
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="mt-12"
            >
              <Button asChild variant="default" className="w-full h-14 text-lg rounded-full">
                <Link to="/contact">Let's Talk</Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
