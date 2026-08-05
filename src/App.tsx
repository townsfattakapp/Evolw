import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { PageWrapper } from "./components/layout/page-wrapper";
import { ScrollToTop } from "./components/layout/scroll-to-top";
import { Home } from "./pages/home";
import { Products } from "./pages/products";
import { Services } from "./pages/services";
import { About } from "./pages/about";
import { Careers } from "./pages/careers";
import { Contact } from "./pages/contact";
import { Privacy } from "./pages/privacy";
import { Terms } from "./pages/terms";
import { VerifyCertificate } from "./pages/verify";

import { AdminLogin } from "./pages/admin/Login";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminContacts } from "./pages/admin/Contacts";
import { AdminContent } from "./pages/admin/Content";
import { AdminJobs } from "./pages/admin/Jobs";
import { AdminApplications } from "./pages/admin/Applications";
import { AdminOfferLetters } from "./pages/admin/OfferLetters";
import { AdminCertificates } from "./pages/admin/Certificates";
import { JobDetails } from "./pages/JobDetails";

import { ThemeProvider } from "./components/theme-provider";
import { ContentProvider } from "./context/ContentContext";

function App() {
  return (
    <ContentProvider>
      <HelmetProvider>
      <ThemeProvider defaultTheme="system" storageKey="evolw-theme">
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
          <Route path="/" element={<PageWrapper />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="services" element={<Services />} />
            <Route path="about" element={<About />} />
            <Route path="careers" element={<Careers />} />
            <Route path="careers/:id" element={<JobDetails />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
          </Route>

          <Route path="/verify" element={<VerifyCertificate />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="offer-letters" element={<AdminOfferLetters />} />
            <Route path="certificates" element={<AdminCertificates />} />
            {/* Catch-all redirect for missing admin routes (e.g. /admin/users) */}
            <Route path="*" element={<AdminDashboard />} />
          </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
      </HelmetProvider>
    </ContentProvider>
  );
}

export default App;
