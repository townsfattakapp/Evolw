import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
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

const EASE = [0.22, 1, 0.36, 1] as const;

/** Two hairlines that glide into an X — the iOS-style menu glyph. */
function MenuGlyph({ open }: { open: boolean }) {
  const bar =
    "absolute left-0 h-[1.5px] w-full origin-center rounded-full bg-current";
  const transition = { duration: 0.42, ease: EASE };

  return (
    <span className="relative block h-[14px] w-[18px]">
      <motion.span
        className={bar}
        style={{ top: "calc(50% - 0.75px)" }}
        animate={open ? { y: 0, rotate: 45 } : { y: -3.5, rotate: 0 }}
        transition={transition}
      />
      <motion.span
        className={bar}
        style={{ top: "calc(50% - 0.75px)" }}
        animate={open ? { y: 0, rotate: -45 } : { y: 3.5, rotate: 0 }}
        transition={transition}
      />
    </span>
  );
}

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

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500 ease-out",
        isScrolled ? "py-2" : "py-3 sm:py-5"
      )}
    >
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-0 bg-evolw-black/20 backdrop-blur-[2px] md:hidden dark:bg-black/50"
          />
        )}
      </AnimatePresence>

      <Container className="relative z-10 px-3 sm:px-6 lg:px-8">
        <LiquidGlass
          variant="nav"
          interactive={false}
          className="flex items-center justify-between gap-3 px-3 py-2 sm:gap-4 sm:px-5 sm:py-3"
        >
          <Link to="/" className="group relative z-50 flex shrink-0 items-center space-x-2">
            <span className="flex items-baseline font-display text-xl font-bold uppercase tracking-tight text-evolw-black sm:text-2xl dark:text-white">
              EVOLW
              <span className="inline-block text-2xl leading-none text-evolw-accent transition-transform duration-300 group-hover:scale-125 sm:text-3xl">
                .
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex xl:gap-1.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-300",
                  location.pathname === link.href
                    ? "bg-white/45 text-evolw-black shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-evolw-gray-600 hover:bg-white/25 hover:text-evolw-black dark:text-evolw-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Button asChild variant="default" size="sm" className="rounded-full shadow-sm">
              <Link to="/contact">Let's Talk</Link>
            </Button>
          </div>

          <div className="relative z-50 flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <LiquidGlass
              as="button"
              variant="control"
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className="grid h-10 w-10 shrink-0 place-items-center text-evolw-black dark:text-white"
            >
              <MenuGlyph open={isMobileMenuOpen} />
            </LiquidGlass>
          </div>
        </LiquidGlass>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.97 }}
              transition={{ duration: 0.42, ease: EASE }}
              className="liquid-glass liquid-glass--dense mt-2 md:hidden"
            >
              <div className="max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain p-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((link, i) => {
                    const active = location.pathname === link.href;
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.035, duration: 0.35, ease: EASE }}
                      >
                        <Link
                          to={link.href}
                          className={cn(
                            "flex items-center justify-between rounded-[1.15rem] px-4 py-3.5 font-display text-[17px] font-medium tracking-tight transition-colors duration-200",
                            active
                              ? "bg-white/55 text-evolw-black shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:bg-white/[0.13] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                              : "text-evolw-gray-700 active:bg-white/40 dark:text-evolw-gray-300 dark:active:bg-white/[0.08]"
                          )}
                        >
                          <span className="flex items-center gap-2.5">
                            {active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-evolw-accent" />
                            )}
                            {link.name}
                          </span>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active
                                ? "text-evolw-accent"
                                : "text-evolw-gray-400 dark:text-evolw-gray-600"
                            )}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.05 + NAV_LINKS.length * 0.035,
                    duration: 0.35,
                    ease: EASE,
                  }}
                  className="mt-3 px-1.5 pb-1"
                >
                  <Button asChild variant="default" className="h-12 w-full rounded-full text-base">
                    <Link to="/contact">Let's Talk</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </header>
  );
}
