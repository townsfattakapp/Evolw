/**
 * Canonical site configuration for EVOLW SEO.
 * Single source of truth for domain, org identity, and default meta.
 */

export const SITE_URL = 'https://www.evolw.in';

/** Flagship product — a unit of EVOLW */
export const FATTAKSE = {
  name: 'Fattakse',
  alternateName: 'Fattakse — A Unit of EVOLW',
  tagline: 'A Unit of EVOLW',
  description:
    'Fattakse is a unit of EVOLW — a connected commerce platform that brings local businesses, customers, and commerce infrastructure together with ordering, inventory, POS, and real-time operations.',
  url: 'https://fattakse.in',
  pagePath: '/products',
  appStoreUrl: 'https://apps.apple.com/in/app/fattakse/id6785628271',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.fattakse.user&hl=en_IN',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'iOS, Android, Web',
} as const;

export const SITE = {
  name: 'EVOLW',
  legalName: 'EVOLW',
  tagline: 'Technology built to move businesses forward',
  description:
    'EVOLW is a technology engineering company specializing in custom software development, web platforms, mobile apps, cloud solutions, and AI-powered products. Maker of Fattakse — A Unit of EVOLW — a connected commerce platform for local businesses.',
  url: SITE_URL,
  locale: 'en_IN',
  language: 'en',
  themeColor: '#09090b',
  themeColorLight: '#ffffff',
  email: 'hello@evolw.in',
  phone: '+919209250725',
  phoneDisplay: '+91 92092 50725',
  foundingDate: '2024',
  address: {
    streetAddress: 'Waraseoni',
    addressLocality: 'Balaghat',
    addressRegion: 'Madhya Pradesh',
    postalCode: '481331',
    addressCountry: 'IN',
  },
  sameAs: [
    FATTAKSE.url,
  ] as string[],
  ogImage: `${SITE_URL}/og-default.png`,
  logo: `${SITE_URL}/favicon.svg`,
  keywords: [
    'software development',
    'custom software solutions',
    'web development',
    'mobile app development',
    'cloud engineering',
    'AI software',
    'enterprise software',
    'digital transformation',
    'technology consulting',
    'product engineering',
    'EVOLW',
    'Fattakse',
    'Fattakse A Unit of EVOLW',
    'local commerce platform',
    'India software company',
  ],
} as const;

export type SeoPageKey =
  | 'home'
  | 'products'
  | 'services'
  | 'about'
  | 'careers'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'verify';

export const PAGE_SEO: Record<
  SeoPageKey,
  {
    path: string;
    title: string;
    description: string;
    keywords?: string[];
    type?: 'website' | 'article' | 'profile';
    schemaType?: string;
  }
> = {
  home: {
    path: '/',
    title: 'EVOLW | Custom Software, Web & Mobile App Development Company',
    description:
      'EVOLW designs and builds modern software products, web platforms, mobile apps, and AI solutions. Home of Fattakse — A Unit of EVOLW — a connected commerce platform for local businesses.',
    keywords: [
      'software development company',
      'custom software',
      'web development',
      'mobile app development',
      'digital transformation',
      'Fattakse',
      'Fattakse A Unit of EVOLW',
    ],
  },
  products: {
    path: '/products',
    title: 'Fattakse — A Unit of EVOLW | Products',
    description:
      'Fattakse — A Unit of EVOLW. Connected commerce for local businesses: ordering, inventory, POS, and real-time operations. Explore EVOLW products built for real-world scale.',
    keywords: [
      'Fattakse',
      'Fattakse A Unit of EVOLW',
      'local commerce platform',
      'business software',
      'SaaS products',
      'commerce app India',
      'EVOLW products',
    ],
  },
  services: {
    path: '/services',
    title: 'Software Development & Engineering Services | EVOLW',
    description:
      'EVOLW engineering services: custom software, web platforms, AI-integrated products, product design, tech consulting, and continuous support. Enterprise-grade technology for complex scale.',
    keywords: [
      'software engineering services',
      'custom software development',
      'web application development',
      'AI integrated products',
      'AI software development',
      'tech consulting',
      'product engineering',
    ],
  },
  about: {
    path: '/about',
    title: 'About EVOLW | Engineering-First Technology Company',
    description:
      'EVOLW is an Indian MSME focused on building scalable digital products, business software, and technology infrastructure — including Fattakse, a unit of EVOLW. Learn our mission, vision, and engineering principles.',
    keywords: [
      'about EVOLW',
      'technology company India',
      'software engineering firm',
      'Fattakse A Unit of EVOLW',
    ],
  },
  careers: {
    path: '/careers',
    title: 'Careers at EVOLW | Engineering Jobs & Internships',
    description:
      'Join EVOLW — careers in software engineering, product, and design. Build technology that matters with an autonomy-driven, craftsmanship-focused team. View open positions.',
    keywords: ['software engineer jobs', 'tech careers India', 'engineering internships'],
  },
  contact: {
    path: '/contact',
    title: 'Contact EVOLW | Talk to Our Engineering Team',
    description:
      'Contact EVOLW for custom software, web and mobile development, and digital transformation. Email hello@evolw.in or call +91 92092 50725. Office in Waraseoni, Madhya Pradesh.',
    keywords: ['contact software company', 'hire developers', 'EVOLW contact'],
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy | EVOLW',
    description:
      'Read how EVOLW collects, uses, and protects personal data across our websites, products, and services. Privacy practices for visitors and customers.',
  },
  terms: {
    path: '/terms',
    title: 'Terms of Service | EVOLW',
    description:
      'Terms of Service governing use of EVOLW websites, products, and technology services. Rights, responsibilities, and legal terms.',
  },
  verify: {
    path: '/verify',
    title: 'Verify Certificate | EVOLW Credential Portal',
    description:
      'Verify the authenticity of an EVOLW internship or training certificate. Enter your Certificate ID to confirm a valid EVOLW credential.',
  },
};

export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized === '/' ? '' : normalized}` || SITE_URL;
}
