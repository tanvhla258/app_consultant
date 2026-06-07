const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.com';

export function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'APP Consulting',
    url: SITE_URL,
    logo: `${SITE_URL}/icon`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14th Floor, HM Town Building, 412 Nguyen Thi Minh Khai',
      addressLocality: 'Ho Chi Minh City',
      addressRegion: 'District 3',
      addressCountry: 'VN',
    },
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+84909121045',
      email: 'toandhnh@gmail.com',
      areaServed: 'VN',
      availableLanguage: ['English', 'Vietnamese'],
    }],
  } as const;
}

export function localBusiness() {
  return {
    ...organization(),
    '@type': 'ProfessionalService',
    priceRange: '$$$',
  };
}

export function person(args: {
  name: string;
  jobTitle: string;
  email: string;
  telephone: string;
  credentials: string[];
  alumniOf: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: args.name,
    jobTitle: args.jobTitle,
    email: args.email,
    telephone: args.telephone,
    worksFor: { '@type': 'Organization', name: 'APP Consulting' },
    hasCredential: args.credentials,
    alumniOf: args.alumniOf.map(name => ({ '@type': 'Organization', name })),
  };
}

export function service(args: { name: string; description: string; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: args.name,
    description: args.description,
    serviceType: args.name,
    areaServed: 'Vietnam',
    provider: { '@type': 'Organization', name: 'APP Consulting', url: SITE_URL },
    url: `${SITE_URL}/en/services/${args.slug}`,
  };
}

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
