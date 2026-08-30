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
import { Community } from "./pages/community";
import { OpenSource } from "./pages/community/OpenSource";
import { GoodFirstIssues } from "./pages/community/GoodFirstIssues";
import { ProjectListing } from "./pages/community/ProjectListing";
import { ProjectDetail } from "./pages/community/ProjectDetail";
import { Hackathons } from "./pages/community/Hackathons";
import { Events } from "./pages/community/Events";

import { AdminLogin } from "./pages/admin/Login";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminContacts } from "./pages/admin/Contacts";
import { AdminContent } from "./pages/admin/Content";
import { AdminJobs } from "./pages/admin/Jobs";
import { AdminApplications } from "./pages/admin/Applications";
import { AdminApplicationDetail } from "./pages/admin/ApplicationDetail";
import { AdminOfferLetters } from "./pages/admin/OfferLetters";
import { AdminCertificates } from "./pages/admin/Certificates";
import { AdminProducts } from "./pages/admin/Products";
import { AdminCommunityProjects } from "./pages/admin/community/Projects";
import { AdminCommunityHackathons } from "./pages/admin/community/Hackathons";
import { AdminCommunityEvents } from "./pages/admin/community/Events";
import { BillingDashboard } from "./pages/admin/BillingDashboard";
import { BillingSettings } from "./pages/admin/BillingSettings";
import { Clients } from "./pages/admin/Clients";
import { ClientDetail } from "./pages/admin/ClientDetail";
import { Quotations } from "./pages/admin/Quotations";
import { QuotationEditor } from "./pages/admin/QuotationEditor";
import { Invoices } from "./pages/admin/Invoices";
import { InvoiceEditor } from "./pages/admin/InvoiceEditor";
import { Payments } from "./pages/admin/Payments";
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
            <Route path="community" element={<Community />} />
            <Route path="community/open-source" element={<OpenSource />} />
            <Route path="community/good-first-issues" element={<GoodFirstIssues />} />
            <Route path="community/projects" element={<ProjectListing />} />
            <Route path="community/projects/:slug" element={<ProjectDetail />} />
            <Route path="community/hackathons" element={<Hackathons />} />
            <Route path="community/events" element={<Events />} />
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
            <Route path="applications/:id" element={<AdminApplicationDetail />} />
            <Route path="offer-letters" element={<AdminOfferLetters />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="community/projects" element={<AdminCommunityProjects />} />
            <Route path="community/hackathons" element={<AdminCommunityHackathons />} />
            <Route path="community/events" element={<AdminCommunityEvents />} />
            
            {/* Billing & Finance Routes */}
            <Route path="billing" element={<BillingDashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="quotations/new" element={<QuotationEditor />} />
            <Route path="quotations/:id" element={<QuotationEditor />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceEditor />} />
            <Route path="invoices/:id" element={<InvoiceEditor />} />
            <Route path="payments" element={<Payments />} />
            <Route path="billing-settings" element={<BillingSettings />} />
            
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
