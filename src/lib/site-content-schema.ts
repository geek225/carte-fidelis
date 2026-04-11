import { z } from "zod";

const stringField = z.string().trim().min(1);
const idField = z.string().trim().min(1).max(80);

export const navItemSchema = z
  .object({
    id: idField,
    label: stringField.max(100),
    href: stringField.max(500),
    enabled: z.boolean(),
  })
  .strict();

export const socialLinkSchema = z
  .object({
    id: idField,
    label: stringField.max(80),
    url: stringField.max(1000),
  })
  .strict();

export const statItemSchema = z
  .object({
    id: idField,
    value: stringField.max(120),
    label: stringField.max(240),
  })
  .strict();

export const featureItemSchema = z
  .object({
    id: idField,
    title: stringField.max(180),
    description: stringField.max(2000),
  })
  .strict();

export const stepItemSchema = z
  .object({
    id: idField,
    title: stringField.max(180),
    description: stringField.max(2000),
  })
  .strict();

export const ctaItemSchema = z
  .object({
    id: idField,
    text: stringField.max(1000),
  })
  .strict();

export const siteContentSchema = z
  .object({
    site: z
      .object({
        brandName: stringField.max(120),
        metaTitle: stringField.max(180),
        metaDescription: stringField.max(320),
        footerText: stringField.max(500),
      })
      .strict(),
    theme: z
      .object({
        background: stringField.max(100),
        foreground: stringField.max(100),
        muted: stringField.max(100),
        accent: stringField.max(100),
        accentText: stringField.max(100),
        surface: stringField.max(100),
        surfaceSoft: stringField.max(100),
        border: stringField.max(100),
        menuBackground: stringField.max(100),
      })
      .strict(),
    animation: z
      .object({
        heroCard: z.enum(["float", "tilt", "none"]),
        reveal: z.enum(["fade-up", "fade", "none"]),
        media: z.enum(["parallax", "static"]),
      })
      .strict(),
    sizing: z
      .object({
        heroTitle: stringField.max(100),
        sectionTitle: stringField.max(100),
        bodyText: stringField.max(100),
        heroCardWidth: stringField.max(100),
        benefitsImageHeight: stringField.max(100),
        processImageHeight: stringField.max(100),
        impactImageHeight: stringField.max(100),
      })
      .strict(),
    menu: z.array(navItemSchema).min(1).max(20),
    socials: z.array(socialLinkSchema).max(20),
    hero: z
      .object({
        eyebrow: stringField.max(200),
        title: stringField.max(220),
        description: stringField.max(3000),
        primaryCtaLabel: stringField.max(120),
        primaryCtaHref: stringField.max(1000),
        secondaryCtaLabel: stringField.max(120),
        secondaryCtaHref: stringField.max(1000),
        cardImage: stringField.max(2000),
        partnerBadge: stringField.max(180),
        savingsLabel: stringField.max(240),
        stats: z.array(statItemSchema).min(1).max(10),
      })
      .strict(),
    benefits: z
      .object({
        eyebrow: stringField.max(200),
        title: stringField.max(220),
        description: stringField.max(3000),
        image: stringField.max(2000),
        imageTitle: stringField.max(180),
        imageDescription: stringField.max(1000),
        items: z.array(featureItemSchema).min(1).max(20),
      })
      .strict(),
    process: z
      .object({
        eyebrow: stringField.max(200),
        title: stringField.max(220),
        description: stringField.max(3000),
        image: stringField.max(2000),
        imageTitle: stringField.max(180),
        imageDescription: stringField.max(1000),
        steps: z.array(stepItemSchema).min(1).max(20),
      })
      .strict(),
    impact: z
      .object({
        image: stringField.max(2000),
        imageTitle: stringField.max(180),
        imageDescription: stringField.max(1000),
        quote: stringField.max(2000),
        quoteAuthor: stringField.max(240),
        stats: z.array(statItemSchema).min(1).max(20),
      })
      .strict(),
    cta: z
      .object({
        eyebrow: stringField.max(200),
        title: stringField.max(220),
        description: stringField.max(3000),
        primaryLabel: stringField.max(120),
        primaryHref: stringField.max(1000),
        secondaryLabel: stringField.max(120),
        secondaryHref: stringField.max(1000),
        items: z.array(ctaItemSchema).min(1).max(20),
      })
      .strict(),
  })
  .strict();

export type NavItem = z.infer<typeof navItemSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type StatItem = z.infer<typeof statItemSchema>;
export type FeatureItem = z.infer<typeof featureItemSchema>;
export type StepItem = z.infer<typeof stepItemSchema>;
export type CTAItem = z.infer<typeof ctaItemSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
