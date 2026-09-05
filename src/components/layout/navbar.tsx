import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { LiquidGlass } from "../ui/liquid-glass";
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
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500 ease-out",
        isScrolled ? "py-2" : "py-3 sm:py-5"
      )}
    >
      <Container className="px-3 sm:px-6 lg:px-8">
        <LiquidGlass
          variant="nav"
          interactive={false}
          className={cn(
            "flex items-center justify-between gap-3 sm:gap-4 px-3 sm:px-5 py-2 sm:py-3"
          )}
        >
          <Link to="/" className="flex items-center space-x-2 z-50 relative group shrink-0">
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-evolw-black dark:text-white uppercase flex items-baseline">
              EVOLW
              <span className="text-evolw-accent text-2xl sm:text-3xl leading-none transition-transform duration-300 group-hover:scale-125 inline-block">
                .
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-all duration-300 rounded-full px-3 py-1.5",
                  location.pathname === link.href
                    ? "text-evolw-black dark:text-white bg-white/45 dark:bg-white/10 shadow-sm"
                    : "text-evolw-gray-600 dark:text-evolw-gray-400 hover:text-evolw-black dark:hover:text-white hover:bg-white/25 dark:hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="default" size="sm" className="rounded-full shadow-sm">
              <Link to="/contact">Let's Talk</Link>
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2 z-50 relative">
            <ThemeToggle />
            <button
              className="p-2 -mr-1 rounded-full text-evolw-black dark:text-white transition-transform active:scale-95 hover:bg-white/30 dark:hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </LiquidGlass>
      </Container>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(12px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            className="fixed inset-0 z-40 liquid-glass liquid-glass--dense pt-28 px-6 md:hidden flex flex-col h-screen rounded-none border-0"
          >
            <nav className="flex flex-col space-y-5 text-2xl font-display font-medium tracking-tight">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.04 + 0.08,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "block pb-4 border-b border-white/30 dark:border-white/10 transition-colors",
                      location.pathname === link.href
                        ? "text-evolw-black dark:text-white"
                        : "text-evolw-gray-600 dark:text-evolw-gray-400"
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
              transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
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
