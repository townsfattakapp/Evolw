import { SEO } from "../components/common/seo";
import { Container } from "../components/ui/container";
import { Section } from "../components/ui/section";

export function Privacy() {
  return (
    <>
      <SEO title="Privacy Policy | EVOLW" />
      <Section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-white dark:bg-evolw-black min-h-screen">
        <Container>
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h1>Privacy Policy</h1>
            <p className="text-evolw-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Introduction</h2>
            <p>
              Welcome to EVOLW. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our software products, including the Fattakse platform.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We may collect personal identification information from Users in a variety of ways, including, but not limited to:</p>
            <ul>
              <li><strong>Personal Data:</strong> Name, email address, phone number, and company details when you fill out a contact form or register for an account.</li>
              <li><strong>Usage Data:</strong> Information on how the Service is accessed and used, including your IP address, browser type, device information, and pages visited.</li>
              <li><strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve your user experience.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>EVOLW uses the collected data for various purposes:</p>
            <ul>
              <li>To provide and maintain our services.</li>
              <li>To notify you about changes to our services or platforms.</li>
              <li>To provide customer support and respond to inquiries.</li>
              <li>To gather analysis or valuable information so that we can improve our technology solutions.</li>
              <li>To monitor the usage of our platforms and detect, prevent, and address technical issues.</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              The security of your data is extremely important to us. We implement a variety of security measures to maintain the safety of your personal information. However, please be aware that no method of transmission over the internet or method of electronic storage is 100% secure, and we cannot guarantee its absolute security.
            </p>

            <h2>5. Sharing of Your Information</h2>
            <p>
              We do not sell, trade, or rent Users' personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers for the purposes outlined above.
            </p>

            <h2>6. Your Data Rights</h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal data:
              The right to access, update or delete the information we have on you. 
              The right of rectification if your information is inaccurate or incomplete.
              The right to object to our processing of your Personal Data.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at: <strong>+91 92092 50725</strong>
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
