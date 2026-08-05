import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  url?: string;
}

export function SEO({
  title = "EVOLW | Technology built to move businesses forward",
  description = "EVOLW designs and builds modern software products, digital platforms and technology infrastructure for businesses ready to grow.",
  type = "website",
  url = "https://evolw.com",
}: SEOProps) {
  const fullTitle = title.includes("EVOLW") ? title : `${title} | EVOLW`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
    </Helmet>
  );
}
