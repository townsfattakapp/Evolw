import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";

export function Terms() {
  return (
    <>
      <SEO title="Terms of Service | EVOLW" />
      <Section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-white dark:bg-evolw-black min-h-screen">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h1>Terms of Service</h1>
            <p className="text-evolw-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and EVOLW ("Company", "we", "us", or "our"), concerning your access to and use of the EVOLW website as well as any other media form, media channel, mobile website, or related software platforms (including Fattakse) connected thereto.
            </p>
            <p>
              By accessing the Site, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these terms, then you are expressly prohibited from using the Site and must discontinue use immediately.
            </p>

            <h2>2. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site and our software products are our proprietary property. All source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>

            <h2>3. User Representations</h2>
            <p>
              By using the Site, you represent and warrant that:
            </p>
            <ul>
              <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
              <li>You are not a minor in the jurisdiction in which you reside.</li>
              <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li>
              <li>You will not use the Site for any illegal or unauthorized purpose.</li>
            </ul>

            <h2>4. Prohibited Activities</h2>
            <p>
              You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. You agree not to circumvent, disable, or otherwise interfere with security-related features of the Site.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
            </p>

            <h2>6. Governing Law</h2>
            <p>
              These Terms shall be governed by and defined following the laws of India. EVOLW and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <strong>+91 92092 50725</strong>
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
