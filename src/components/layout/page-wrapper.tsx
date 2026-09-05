import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { PageScene, sceneVariantForPath } from "../sections/HeroCanvas";

export function PageWrapper() {
  const { pathname } = useLocation();
  const variant = sceneVariantForPath(pathname);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f4f6fa] dark:bg-transparent">
      {/* Full-page 3D — quieter on small light screens for readability */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden max-md:opacity-[0.32] md:opacity-100 dark:max-md:opacity-[0.55] dark:md:opacity-100"
        aria-hidden="true"
      >
        <PageScene variant={variant} intensity={0.85} />
        {/* Desktop light veil */}
        <div
          className="absolute inset-0 hidden md:block dark:hidden"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% 25%, rgba(244,246,250,0.72) 0%, rgba(244,246,250,0.32) 48%, rgba(244,246,250,0.1) 100%)',
          }}
        />
        {/* Mobile light: soft solid wash so copy stays crisp */}
        <div className="absolute inset-0 md:hidden dark:hidden bg-[#f4f6fa]/88" />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 35%, rgba(9,9,11,0.72) 0%, rgba(9,9,11,0.35) 45%, rgba(9,9,11,0.08) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow pt-[68px] sm:pt-[72px]">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
