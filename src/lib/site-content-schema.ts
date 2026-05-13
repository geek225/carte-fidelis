import { z } from "zod";

const stringField = z.string().trim();
const idField = z.string().trim().min(1).max(80);
const nullableString = z.string().trim().optional();

export const simpleItemSchema = z.object({
  id: idField,
  text: stringField,
  enabled: z.boolean().default(true),
}).strict();

export const navItemSchema = z.object({
  id: idField,
  label: stringField.max(100),
  href: stringField.max(500),
  enabled: z.boolean(),
}).strict();

export const featureItemSchema = z.object({
  id: idField,
  icon: z.enum(["check", "globe", "phone", "support", "arrow"]),
  title: stringField.max(200),
  description: nullableString,
  enabled: z.boolean().default(true),
}).strict();

export const tabItemSchema = z.object({
  id: idField,
  label: stringField.max(100),
  content: stringField.max(3000),
  enabled: z.boolean().default(true),
}).strict();

export const faqItemSchema = z.object({
  id: idField,
  question: stringField.max(300),
  answer: stringField.max(2000).optional(),
  enabled: z.boolean().default(true),
}).strict();

export const socialLinkSchema = z.object({
  id: idField,
  label: stringField.max(100),
  url: stringField.max(1000),
  enabled: z.boolean().default(true),
}).strict();

export const partnerCategorySchema = z.object({
  id: idField,
  label: stringField.max(100),
  enabled: z.boolean().default(true),
}).strict();

export const partnerItemSchema = z.object({
  id: idField,
  name: stringField.max(200),
  logo: stringField,
  description: stringField.max(2000),
  categoryId: stringField,
  imageUrl: z.string().trim().optional(),
  videoUrl: z.string().trim().optional(),
  pdfUrl: z.string().trim().optional(),
  enabled: z.boolean().default(true),
}).strict();

export const siteContentSchema = z.object({
  site: z.object({
    brandName: stringField.max(120),
    logoImage: stringField, // Added support for image logo
    metaTitle: stringField.max(180),
    metaDescription: stringField.max(500),
    footerText: stringField.max(500),
  }).strict(),
  theme: z.object({
    primary: stringField,
    primaryHover: stringField,
    dark: stringField,
    darkLight: stringField,
    lightBg: stringField,
    grayBg: stringField,
    white: stringField,
    borderColor: stringField,
  }).strict(),
  header: z.object({
    menu: z.array(navItemSchema),
    ctaLabel: stringField,
    ctaHref: stringField,
    ctaEnabled: z.boolean(),
  }).strict(),
  hero: z.object({
    enabled: z.boolean(),
    kickerNum: stringField,
    kickerText: stringField,
    title: stringField,
    subtitle: stringField,
    mainImage: stringField,
    btnLabel: stringField,
    btnHref: stringField,
  }).strict(),
  gridFeatures: z.object({
    enabled: z.boolean(),
    title: stringField,
    items: z.array(featureItemSchema),
  }).strict(),
  splitCards: z.object({
    enabled: z.boolean(),
    title: stringField,
    cardPhysical: z.object({
      enabled: z.boolean(),
      title: stringField,
      description: stringField,
      image: stringField,
      btnLabel: stringField,
      btnHref: stringField,
    }),
    cardVirtual: z.object({
      enabled: z.boolean(),
      title: stringField,
      description: stringField,
      image: stringField,
      btnLabel: stringField,
      btnHref: stringField,
    }),
  }).strict(),
  superApp: z.object({
    enabled: z.boolean(),
    title: stringField,
    checklist: z.array(simpleItemSchema),
    btnLabel: stringField,
    btnHref: stringField,
    image: stringField,
  }).strict(),
  agentBanner: z.object({
    enabled: z.boolean(),
    title: stringField,
    backgroundImage: stringField,
    overlayTitle: stringField,
    overlayDesc: stringField,
    stat1Num: stringField,
    stat1Label: stringField,
    stat2Num: stringField,
    stat2Label: stringField,
  }).strict(),
  faq: z.object({
    enabled: z.boolean(),
    title: stringField,
    items: z.array(faqItemSchema),
  }).strict(),
  partners: z.object({
    enabled: z.boolean(),
    title: stringField,
    tabBgColor: stringField,
    tabTextColor: stringField,
    tabActiveBgColor: stringField,
    tabActiveTextColor: stringField,
    categories: z.array(partnerCategorySchema),
    items: z.array(partnerItemSchema),
  }).strict(),
  footerCta: z.object({
    enabled: z.boolean(),
    title: stringField,
    description: stringField,
    image: stringField,
    socials: z.array(socialLinkSchema),
  }).strict(),
}).strict();

export type SiteContent = z.infer<typeof siteContentSchema>;
export type NavItem = z.infer<typeof navItemSchema>;
export type FeatureItem = z.infer<typeof featureItemSchema>;
export type TabItem = z.infer<typeof tabItemSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type SimpleItem = z.infer<typeof simpleItemSchema>;
export type PartnerCategory = z.infer<typeof partnerCategorySchema>;
export type PartnerItem = z.infer<typeof partnerItemSchema>;
