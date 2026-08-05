import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE, absoluteUrl } from '../../lib/seo/site';
import type { JsonLd } from '../../lib/seo/schema';

export interface SEOProps {
  title?: string;
  description?: string;
  /** Path only (e.g. /services) or absolute URL */
  path?: string;
  type?: 'website' | 'article' | 'profile';
  image?: string;
  keywords?: string[] | string;
  noindex?: boolean;
  nofollow?: boolean;
  jsonLd?: JsonLd;
  children?: ReactNode;
}

function toJsonLdScript(data: JsonLd): string {
  const payload = Array.isArray(data) ? data : [data];
  return JSON.stringify(payload.length === 1 ? payload[0] : payload).replace(
    /</g,
    '\\u003c'
  );
}

export function SEO({
  title,
  description = SITE.description,
  path = '/',
  type = 'website',
  image = SITE.ogImage,
  keywords,
  noindex = false,
  nofollow = false,
  jsonLd,
  children,
}: SEOProps) {
  const fullTitle = title
    ? title.includes('EVOLW')
      ? title
      : `${title} | EVOLW`
    : `${SITE.name} | ${SITE.tagline}`;

  const canonical = absoluteUrl(path);
  const keywordContent = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords || SITE.keywords.join(', ');

  const robots = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1',
  ].join(', ');

  return (
    <Helmet>
      <html lang={SITE.language} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordContent} />
      <meta name="author" content={SITE.name} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="bingbot" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Geo / locale */}
      <meta name="geo.region" content="IN-MP" />
      <meta name="geo.placename" content="Waraseoni, Balaghat" />
      <meta property="og:locale" content={SITE.locale} />
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="en-IN" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Apple / mobile */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={SITE.name} />
      <meta name="application-name" content={SITE.name} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="theme-color" content={SITE.themeColor} media="(prefers-color-scheme: dark)" />
      <meta name="theme-color" content={SITE.themeColorLight} media="(prefers-color-scheme: light)" />
      <meta name="msapplication-TileColor" content={SITE.themeColor} />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {jsonLd ? (
        <script type="application/ld+json">{toJsonLdScript(jsonLd)}</script>
      ) : null}

      {children}
    </Helmet>
  );
}
