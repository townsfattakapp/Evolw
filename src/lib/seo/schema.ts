import { SITE, absoluteUrl } from './site';

export type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Corporation', 'ProfessionalService'],
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: {
      '@type': 'ImageObject',
      url: SITE.logo,
    },
    image: SITE.ogImage,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone,
    foundingDate: SITE.foundingDate,
    address: {
      '@type': 'PostalAddress',
      ...SITE.address,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: SITE.email,
        telephone: SITE.phone,
        areaServed: ['IN', 'Worldwide'],
        availableLanguage: ['English', 'Hindi'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: SITE.email,
        telephone: SITE.phone,
      },
    ],
    sameAs: SITE.sameAs,
    knowsAbout: [
      'Software Development',
      'Web Development',
      'Mobile App Development',
      'Cloud Computing',
      'Artificial Intelligence',
      'Enterprise Software',
      'Digital Transformation',
      'Product Engineering',
    ],
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
  };
}

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#localbusiness`,
    name: SITE.name,
    image: SITE.ogImage,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      ...SITE.address,
    },
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '19:00',
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    publisher: { '@id': `${SITE.url}/#organization` },
    inLanguage: SITE.language,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/careers?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchemas() {
  const services = [
    {
      name: 'Software Engineering',
      description:
        'End-to-end custom software development and bespoke system engineering for businesses.',
      path: '/services#software',
    },
    {
      name: 'Web Platforms',
      description:
        'High-performance, responsive web application and platform development on modern stacks.',
      path: '/services#web',
    },
    {
      name: 'Product Design & Engineering',
      description:
        'Transforming concepts into market-ready digital products with scalable architecture.',
      path: '/services#product',
    },
    {
      name: 'Tech Consulting',
      description:
        'Strategic technology planning, stack selection, architecture design, and digital transformation advisory.',
      path: '/services#consulting',
    },
    {
      name: 'Continuous Support',
      description:
        'Long-term software maintenance, security updates, and performance tuning.',
      path: '/services#support',
    },
  ];

  return services.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.description,
    url: absoluteUrl(s.path),
    provider: { '@id': `${SITE.url}/#organization` },
    areaServed: 'Worldwide',
    serviceType: s.name,
  }));
}

export function faqSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function contactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE.url}/contact#contactpage`,
    url: absoluteUrl('/contact'),
    name: 'Contact EVOLW',
    description: 'Contact the EVOLW engineering team for software projects and partnerships.',
    isPartOf: { '@id': `${SITE.url}/#website` },
    about: { '@id': `${SITE.url}/#organization` },
  };
}

export function aboutPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE.url}/about#aboutpage`,
    url: absoluteUrl('/about'),
    name: 'About EVOLW',
    description: 'Learn about EVOLW, our mission, and engineering philosophy.',
    isPartOf: { '@id': `${SITE.url}/#website` },
    about: { '@id': `${SITE.url}/#organization` },
  };
}

export function jobPostingSchema(job: {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  department?: string;
  datePosted?: string;
}) {
  const employmentType =
    job.type.toLowerCase().includes('intern')
      ? 'INTERN'
      : job.type.toLowerCase().includes('part')
        ? 'PART_TIME'
        : job.type.toLowerCase().includes('contract')
          ? 'CONTRACTOR'
          : 'FULL_TIME';

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.datePosted || new Date().toISOString().split('T')[0],
    employmentType,
    hiringOrganization: {
      '@type': 'Organization',
      name: SITE.name,
      sameAs: SITE.url,
      logo: SITE.logo,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location || SITE.address.addressLocality,
        addressCountry: 'IN',
      },
    },
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'India',
    },
    url: absoluteUrl(`/careers/${job.id}`),
    industry: job.department || 'Software Engineering',
  };
}

export const HOME_FAQS = [
  {
    question: 'What does EVOLW specialize in?',
    answer:
      'EVOLW specializes in custom software development, web platforms, mobile applications, cloud engineering, AI-powered products, and digital transformation for businesses.',
  },
  {
    question: 'Where is EVOLW located?',
    answer:
      'EVOLW is based in Waraseoni, Balaghat, Madhya Pradesh, India, and serves clients worldwide.',
  },
  {
    question: 'How can I contact EVOLW for a project?',
    answer:
      'Email hello@evolw.in, call +91 92092 50725, or use the contact form at evolw.in/contact.',
  },
  {
    question: 'Does EVOLW build mobile apps?',
    answer:
      'Yes. EVOLW engineers web and mobile products, including platforms like Fattakse, with modern stacks and scalable architecture.',
  },
];
