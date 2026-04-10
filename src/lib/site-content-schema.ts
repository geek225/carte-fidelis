export type NavItem = {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
};

export type StatItem = {
  id: string;
  value: string;
  label: string;
};

export type FeatureItem = {
  id: string;
  title: string;
  description: string;
};

export type StepItem = {
  id: string;
  title: string;
  description: string;
};

export type CTAItem = {
  id: string;
  text: string;
};

export type SiteContent = {
  site: {
    brandName: string;
    metaTitle: string;
    metaDescription: string;
    footerText: string;
  };
  theme: {
    background: string;
    foreground: string;
    muted: string;
    accent: string;
    accentText: string;
    surface: string;
    surfaceSoft: string;
    border: string;
    menuBackground: string;
  };
  animation: {
    heroCard: "float" | "tilt" | "none";
    reveal: "fade-up" | "fade" | "none";
    media: "parallax" | "static";
  };
  sizing: {
    heroTitle: string;
    sectionTitle: string;
    bodyText: string;
    heroCardWidth: string;
    benefitsImageHeight: string;
    processImageHeight: string;
    impactImageHeight: string;
  };
  menu: NavItem[];
  socials: SocialLink[];
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    cardImage: string;
    partnerBadge: string;
    savingsLabel: string;
    stats: StatItem[];
  };
  benefits: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    imageTitle: string;
    imageDescription: string;
    items: FeatureItem[];
  };
  process: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    imageTitle: string;
    imageDescription: string;
    steps: StepItem[];
  };
  impact: {
    image: string;
    imageTitle: string;
    imageDescription: string;
    quote: string;
    quoteAuthor: string;
    stats: StatItem[];
  };
  cta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    items: CTAItem[];
  };
};
