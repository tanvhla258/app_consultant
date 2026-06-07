export type ServiceFrontmatter = {
  slug: string;
  title: string;
  summary: string;
  bullets: string[];
  order: number;
  whoFor?: string[];
  delivers?: string[];
};

export type PartnerFrontmatter = {
  slug: string;
  name: string;
  role: string;
  credentials: string[];
  email: string;
  phone: string;
  alumniOf: string[];
  notableEngagements: string[];
  order: number;
};
