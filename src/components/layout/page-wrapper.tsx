import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { PageScene, sceneVariantForPath } from "../sections/HeroCanvas";

export function PageWrapper() {
  const { pathname } = useLocation();
  const variant = sceneVariantForPath(pathname);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#e9eef5] dark:bg-transparent">
      {/* Full-page 3D — glass panels handle readability */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <PageScene variant={variant} intensity={1.05} />
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 28%, rgba(233,238,245,0.55) 0%, rgba(233,238,245,0.18) 50%, rgba(226,232,240,0.05) 100%)',
          }}
        />
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
        <main className="flex-grow pt-[72px]">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
