import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../ui/container";
import { ArrowRight, ArrowUpRight } from "lucide-react";

function formatClock(now: Date) {
  const day = new Intl.DateTimeFormat("en-IN", { weekday: "long" }).format(now);
  const date = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);
  return { day, date, time };
}

export function Footer() {
  const [now, setNow] = useState(() => new Date());
  const currentYear = now.getFullYear();
  const { day, date, time } = formatClock(now);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer className="relative bg-white dark:bg-evolw-black pt-24 pb-12 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-evolw-gray-200 dark:via-white/20 to-transparent" />

      <div className="absolute -top-24 -left-24 w-96 h-96 bg-evolw-accent/5 rounded-full blur-3xl pointer-events-none hidden dark:block" />

      <Container className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16">
          <div className="lg:max-w-sm flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link to="/" className="inline-block mb-6 group">
              <span className="font-display text-4xl font-bold tracking-tight text-evolw-black dark:text-white uppercase flex items-baseline">
                EVOLW
                <span className="text-evolw-accent text-5xl leading-none transition-transform duration-500 group-hover:scale-125 inline-block">
                  .
                </span>
              </span>
            </Link>
            <p className="text-evolw-gray-500 dark:text-evolw-gray-400 text-lg leading-relaxed mb-8 max-w-xs md:max-w-md">
              Building software, products, and digital infrastructure for modern businesses. Engineering excellence without compromise.
            </p>

            <div className="flex items-center space-x-6">
              <a
                href="mailto:hello@evolw.in"
                className="text-sm font-semibold text-evolw-black dark:text-white hover:text-evolw-accent transition-colors flex items-center group"
              >
                hello@evolw.in
                <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 flex-1 lg:pl-16">
            <div className="col-span-1">
              <h4 className="font-display font-semibold text-lg tracking-tight text-evolw-black dark:text-white mb-6">
                Company
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/about"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium flex items-center"
                  >
                    Careers{" "}
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-evolw-accent/10 text-evolw-accent text-[10px] font-bold uppercase tracking-wider">
                      Hiring
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="font-display font-semibold text-lg tracking-tight text-evolw-black dark:text-white mb-6">
                Products
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/products"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    Fattakse
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="font-display font-semibold text-lg tracking-tight text-evolw-black dark:text-white mb-6">
                Services
              </h4>
              <ul className="space-y-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-y-4">
                <li>
                  <Link
                    to="/services#software"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    Software Development
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services#web"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    Web Applications
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services#product"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    Product Engineering
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services#support"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    Support & Maintenance
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-1 md:col-span-1">
              <h4 className="font-display font-semibold text-lg tracking-tight text-evolw-black dark:text-white mb-6">
                Community
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/community"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    Community Hub
                  </Link>
                </li>
                <li>
                  <Link
                    to="/community/open-source"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    Open Source
                  </Link>
                </li>
                <li>
                  <Link
                    to="/community/hackathons"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    Hackathons
                  </Link>
                </li>
                <li>
                  <Link
                    to="/community/events"
                    className="text-evolw-gray-500 dark:text-evolw-gray-400 hover:text-evolw-accent dark:hover:text-white transition-colors font-medium"
                  >
                    Events
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live clock + join message */}
        <div className="mb-10 rounded-[1.5rem] sm:rounded-[2rem] border border-evolw-gray-200 dark:border-white/10 bg-evolw-gray-50 dark:bg-white/[0.03] overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-stretch">
            <div className="flex-1 px-6 py-7 sm:px-8 sm:py-8 md:px-10 border-b lg:border-b-0 lg:border-r border-evolw-gray-200 dark:border-white/10">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-evolw-gray-500 mb-4">
                Right now
              </p>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-8">
                <div>
                  <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-evolw-black dark:text-white leading-none">
                    {day}
                  </p>
                  <p className="mt-2 text-sm sm:text-base font-medium text-evolw-gray-500 dark:text-evolw-gray-400">
                    {date}
                  </p>
                </div>
                <p
                  className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-evolw-accent tabular-nums leading-none"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {time}
                </p>
              </div>
            </div>

            <div className="flex-1 px-6 py-7 sm:px-8 sm:py-8 md:px-10 flex flex-col justify-center">
              <p className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter text-evolw-black dark:text-white leading-tight text-balance mb-2">
                Time is running.{" "}
                <span className="text-evolw-accent">Join us now.</span>
              </p>
              <p className="text-sm sm:text-base text-evolw-gray-500 dark:text-evolw-gray-400 font-medium leading-relaxed mb-5 max-w-md">
                Every second is a chance to build something that matters. Start a conversation — or step into a role where craft meets ambition.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/careers"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-evolw-black dark:bg-white text-white dark:text-evolw-black text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Join the team
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-sm font-semibold text-evolw-black dark:text-white hover:text-evolw-accent dark:hover:text-evolw-accent transition-colors"
                >
                  Start a project
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-evolw-gray-200 dark:border-white/10">
          <div className="flex flex-col items-center md:items-start text-sm text-evolw-gray-400 dark:text-evolw-gray-500 font-medium space-y-1">
            <p>© {currentYear} EVOLW. All rights reserved.</p>
            <p className="opacity-75">Fattakse — A Unit of EVOLW</p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-evolw-gray-400 dark:text-evolw-gray-500">
            <Link to="/admin" className="hover:text-evolw-black dark:hover:text-white transition-colors">
              Admin Login
            </Link>
            <Link to="/privacy" className="hover:text-evolw-black dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-evolw-black dark:hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
