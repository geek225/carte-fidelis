"use client";

import React, { CSSProperties, useState, useEffect, useRef, ReactNode } from "react";
import styles from "./modern-landing.module.css";
import type { SiteContent } from "@/lib/site-content-schema";
import { AntigravityCanvas } from "./AntigravityCanvas";
import { Fidelis3DCard } from "./Fidelis3DCard";
import { Virtual3DPhone } from "./Virtual3DPhone";
import { Fidelis3DLogo } from "./Fidelis3DLogo";
import { FinancingModal } from "./FinancingModal";

const IconBank = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h18M6 18v-7m5 7v-7m5 7v-7m-9-4 8-5 8 5" /></svg>
);
const IconCard = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /><rect x="6" y="14" width="3" height="2" /></svg>
);
const IconVirtual = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01M9 6h6M9 10h6" /></svg>
);
const IconPhoneDevice = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
);
const IconSwap = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4M3 18l4 4 4-4" /><path d="M21 6H9a4 4 0 0 0-4 4v3M3 18h12a4 4 0 0 0 4-4v-3" /></svg>
);
const IconWorldGlobe = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);
const IconBill = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);
const IconHeadset = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8a9 9 0 0 0-18 0v2" /><rect x="21" y="10" width="2" height="4" rx="1" /><rect x="1" y="10" width="2" height="4" rx="1" /><path d="M21 14v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1" /></svg>
);
const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

const getIcon = (name: string) => {
  switch(name) {
    case "bank": return <IconBank />;
    case "card": return <IconCard />;
    case "virtual": return <IconVirtual />;
    case "phone": return <IconPhoneDevice />;
    case "swap": return <IconSwap />;
    case "globe": return <IconWorldGlobe />;
    case "bill": return <IconBill />;
    case "support": return <IconHeadset />;
    default: return <IconCheck />;
  }
}

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

function Reveal({ children, delay = 0, direction = "up", duration = 0.8, style, ...props }: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case "up": return "translateY(30px)";
        case "down": return "translateY(-30px)";
        case "left": return "translateX(30px)";
        case "right": return "translateX(-30px)";
        default: return "none";
      }
    }
    return "translate(0)";
  };

  const animatedStyle: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: getTransform(),
    transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: "transform, opacity",
    ...style,
  };

  return (
    <div ref={ref} style={animatedStyle} {...props}>
      {children}
    </div>
  );
}

const AVATARS = [
  {
    name: "Mariam Koné",
    points: "Membre Fidelis depuis 2024 • Certifiée en E-commerce",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Koffi Mensah",
    points: "Membre Fidelis depuis 2023 • Certifié en IA",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Awa Diop",
    points: "Membre Fidelis depuis 2025 • Certifiée en Marketing",
    img: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Koffi Junior",
    points: "Membre Fidelis depuis 2024 • Certifié en Design",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  }
];

type ModernLandingProps = {
  content: SiteContent;
};

export function ModernLanding({ content }: ModernLandingProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardTransform, setCardTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
  const [isFinancingOpen, setIsFinancingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const bento = content.heroBento || {
    enabled: true,
    card1Val: "50+",
    card1Label: "Partenaires Affiliés \n & Commerces",
    card1Brands: "Orange, MTN, Moov, Fidelis, Wave",
    card2Label: "Points Cumulés",
    card2Val: "12 450 PTS",
    card2Number: "4321 8654 **** 6547",
    card2Expiry: "08/28",
    card3Image: "/assets/yellow-hoodie-man.png",
    card4Trend: "▲ 24%",
    card4Label: "Points Gagnés",
    card4Val: "3 420 pts",
    card5Val: "2M+",
    card5Label: "Membres Actifs \n Globalement"
  };

  const getBrandWithIcon = (brand: string) => {
    const lower = brand.toLowerCase();
    if (lower.includes("orange")) return `🟠 ${brand}`;
    if (lower.includes("mtn")) return `🟡 ${brand}`;
    if (lower.includes("moov")) return `🔴 ${brand}`;
    if (lower.includes("fidelis")) return `🟢 ${brand}`;
    if (lower.includes("wave")) return `🔵 ${brand}`;
    return `✨ ${brand}`;
  };

  const brandsList = (bento.card1Brands || "Orange, MTN, Moov, Fidelis, Wave").split(",").map(b => b.trim());

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -(y - centerY) / 8;
    const rotateY = (x - centerX) / 8;
    setCardTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`);
  };

  const handleCardMouseLeave = () => {
    setCardTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
  };

  return (
    <div 
      className={styles.wrapper}
      style={{
        "--primary": content.theme.primary,
        "--primary-hover": content.theme.primaryHover,
        "--dark": content.theme.dark,
        "--dark-light": content.theme.darkLight,
        "--light-bg": content.theme.lightBg,
        "--gray-bg": content.theme.grayBg,
        "--white": content.theme.white,
        "--border-color": content.theme.borderColor,
      } as CSSProperties}
    >
      {/* NAVBAR */}
      <header className="navbar">
        <div className={`container ${styles.navbar}`}>
          <div className={styles.logo}>
            {content.site.logoImage ? (
               <img src={content.site.logoImage} alt={content.site.brandName} style={{ maxHeight: "40px", objectFit: "contain" }} />
            ) : (
               content.site.brandName
            )}
          </div>
          <nav className={styles.navLinks}>
            {content.header.menu.filter(m => m.enabled).map(item => (
              <a key={item.id} href={item.href} className={styles.navLink}>{item.label}</a>
            ))}
          </nav>
          {content.header.ctaEnabled && (
            <button 
              onClick={() => setIsFinancingOpen(true)} 
              className={`btn btn-primary ${styles.navbarCta}`}
            >
              {content.header.ctaLabel}
            </button>
          )}

          {/* HAMBURGER BUTTON FOR MOBILE */}
          <button 
            className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerActive : ""}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
          </button>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ""}`}>
        <nav className={styles.mobileNavLinks}>
          {content.header.menu.filter(m => m.enabled).map(item => (
            <a 
              key={item.id} 
              href={item.href} 
              className={styles.mobileNavLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {content.header.ctaEnabled && (
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsFinancingOpen(true);
              }} 
              className={`btn btn-primary ${styles.mobileCta}`}
            >
              {content.header.ctaLabel}
            </button>
          )}
        </nav>
      </div>

      {/* HERO */}
      {content.hero.enabled && (
        <section className={styles.heroBg}>
          <AntigravityCanvas />
          <div className={`container ${styles.hero} fade-in`}>
            <div className={styles.heroContent}>
              <h1 style={{ whiteSpace: "pre-line" }}>
                Au-delà des Limites <br />
                Redéfinir la <br />
                <span className={styles.serifItalic}>Fidélité Client</span>
              </h1>
              <p className={styles.heroSub}>
                {content.hero.subtitle}
              </p>
              
              <div className={styles.ctaGroup}>
                <button 
                  onClick={() => setIsFinancingOpen(true)} 
                  className={`btn btn-primary ${styles.heroPrimaryBtn}`}
                >
                  {content.hero.btnLabel}
                </button>
                <a 
                  href={content.hero.secondaryBtnHref || "#cards"} 
                  className={`btn btn-outline ${styles.heroSecondaryBtn}`}
                >
                  {content.hero.secondaryBtnLabel || "Découvrir les avantages de FIDELIS"} <span style={{ fontSize: "16px", fontWeight: "bold" }}>↗</span>
                </a>
              </div>

              {/* Social Proof Avatar stack with dynamic interactive tooltips */}
              {content.rating?.enabled !== false && (
                <div className={styles.socialProof}>
                  <div className={styles.avatarGroup}>
                    {(content.rating?.avatars || AVATARS).map((av, idx) => (
                      <div key={av.id || idx} className={styles.avatarContainer}>
                        <img src={av.img} alt={av.name} className={styles.avatarImg} />
                        <div className={styles.avatarTooltip}>
                          <strong>{av.name}</strong>
                          <span>{av.points}</span>
                        </div>
                      </div>
                    ))}
                    <div className={styles.avatarMore}>{content.rating?.moreLabel || "+15k"}</div>
                  </div>
                  <div className={styles.ratingInfo}>
                    <div className={styles.ratingStars}>
                      {Array.from({ length: content.rating?.score || 5 }).map((_, idx) => (
                        <span key={idx} className={styles.star}>★</span>
                      ))}
                    </div>
                    <div className={styles.ratingText}>{content.rating?.text || "Rejoint par +15 000 clients privilèges"}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bento Grid */}
            {bento.enabled && (
              <div className={styles.bentoGrid}>
                {/* Card 1: Partenaires Affiliés */}
                <div className={styles.bentoCard1}>
                  <div>
                    <div className={styles.bentoCard1Val}>{bento.card1Val}</div>
                    <div className={styles.bentoCard1Label} style={{ whiteSpace: "pre-line" }}>{bento.card1Label}</div>
                  </div>
                  <div className={styles.logoMarquee}>
                    <div className={styles.logoTrack}>
                      {brandsList.map((brand, idx) => (
                        <span key={idx} className={styles.marqueeLogo}>{getBrandWithIcon(brand)}</span>
                      ))}
                      {/* Duplicate track for loop */}
                      {brandsList.map((brand, idx) => (
                        <span key={`dup-${idx}`} className={styles.marqueeLogo}>{getBrandWithIcon(brand)}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card 2: Credit Card (3D Tilt) */}
                <div 
                  ref={cardRef}
                  className={styles.creditCard}
                  style={{ transform: cardTransform }}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                >
                  <div className={styles.ccHeader}>
                    <div>
                      <div className={styles.ccHeaderLabel}>{bento.card2Label}</div>
                      <div className={styles.ccBalance}>{bento.card2Val}</div>
                    </div>
                    <div className={styles.ccLogo}>
                      <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
                        <rect x="10" y="10" width="80" height="80" rx="20" fill="rgba(0, 168, 107, 0.15)" />
                        <circle cx="50" cy="50" r="20" stroke="#00A86B" strokeWidth="6" />
                        <circle cx="50" cy="50" r="10" stroke="#9b51e0" strokeWidth="4" />
                      </svg>
                    </div>
                  </div>
                  <div className={styles.ccFooter}>
                    <span className={styles.ccNumber}>{bento.card2Number}</span>
                    <span className={styles.ccExpiry}>{bento.card2Expiry}</span>
                  </div>
                </div>

                {/* Card 3: Smile customer */}
                <div className={styles.bentoCard3}>
                  <img src={bento.card3Image} alt="Client Fidelis" />
                </div>

                {/* Card 4: Spend statistics */}
                <div className={styles.bentoCard4}>
                  <div className={styles.bentoCard4Header}>
                    <span className={styles.trendBadge}>{bento.card4Trend}</span>
                    <div className={styles.spendIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                  </div>
                  <div className={styles.bentoCard4Content}>
                    <div className={styles.bentoCard4Label}>{bento.card4Label}</div>
                    <div className={styles.bentoCard4Val}>{bento.card4Val}</div>
                  </div>
                  
                  {/* Animated spending line graph */}
                  <div className={styles.miniGraph}>
                    <svg viewBox="0 0 100 30" className={styles.graphSvg}>
                      <defs>
                        <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00A86B" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#00A86B" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M0,25 Q15,10 30,18 T60,5 T90,12 T100,2" 
                        fill="none" 
                        stroke="#00A86B" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                        className={styles.graphPath}
                      />
                      <path 
                        d="M0,25 Q15,10 30,18 T60,5 T90,12 T100,2 L100,30 L0,30 Z" 
                        fill="url(#graphGradient)"
                      />
                    </svg>
                  </div>
                </div>

                {/* Card 5: Emerald Green Global clients badge */}
                <div className={styles.bentoCard5}>
                  <div className={styles.bentoCard5Val}>{bento.card5Val}</div>
                  <div className={styles.bentoCard5Label} style={{ whiteSpace: "pre-line" }}>{bento.card5Label}</div>
                  <div className={styles.bentoCard5Pattern}>
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" opacity="0.15">
                      <circle cx="80" cy="80" r="40" stroke="white" strokeWidth="6" strokeDasharray="12 12" />
                      <circle cx="80" cy="80" r="20" stroke="white" strokeWidth="4" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* GRID FEATURES (FORMATIONS DIGITALES) */}
      {content.gridFeatures.enabled && (
        <section className="section-padding container" id="formations">
          <Reveal className="text-center">
            <h2 style={{ whiteSpace: 'pre-line' }}>{content.gridFeatures.title}<span className="dot">_</span></h2>
            {content.gridFeatures.subtitle && (
              <p className={styles.featureSubtitle}>{content.gridFeatures.subtitle}</p>
            )}
          </Reveal>
          
          <div className={styles.gridFeatures}>
            {content.gridFeatures.items.filter(i => i.enabled).map((feature, idx) => (
              <Reveal key={feature.id} className={styles.trainingCard} delay={idx * 100} duration={0.8} direction="up">
                {feature.imageUrl && (
                  <div className={styles.cardImageContainer}>
                    <img src={feature.imageUrl} alt={feature.title} className={styles.cardImage} />
                    {feature.badge && (
                      <span className={styles.cardBadge}>{feature.badge}</span>
                    )}
                  </div>
                )}
                <div className={styles.cardContent}>
                  <h4 className={styles.cardTitle}>{feature.title}</h4>
                  {feature.description && (
                    <p className={styles.cardDesc}>{feature.description}</p>
                  )}
                  
                  <div className={styles.cardMeta}>
                    <div style={{ display: "flex", gap: "16px" }}>
                      {feature.level && (
                        <div className={styles.metaItem}>
                          <span className={styles.metaCircle} />
                          <span>{feature.level}</span>
                        </div>
                      )}
                      {feature.duration && (
                        <div className={styles.metaItem}>
                          <span>⏱ {feature.duration}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.cardArrowBtn}>
                      <IconArrowRight />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* BANDEAU DE CONCLUSION PREMIUM */}
          {content.gridFeatures.bannerText && (
            <Reveal className={styles.bottomBanner} delay={300} duration={0.8} direction="up">
              <div className={styles.bannerLeft}>
                {/* Stack d'avatars animés avec info-bulles */}
                <div className={styles.bannerAvatarGroup}>
                  {AVATARS.map((av, idx) => (
                    <div key={idx} className={styles.bannerAvatarContainer}>
                      <img src={av.img} alt={av.name} className={styles.bannerAvatar} />
                      <div className={styles.bannerAvatarTooltip}>
                        <strong>{av.name}</strong>
                        <span>{av.points}</span>
                      </div>
                    </div>
                  ))}
                  <div className={styles.bannerAvatarMore}>+50</div>
                </div>
                
                <div className={styles.bannerTextContainer}>
                  <h3 className={styles.bannerTitle}>{content.gridFeatures.bannerText}</h3>
                  <div className={styles.bannerSub}>
                    <span className={styles.bannerDot} />
                    <span>Formations interactives et certifiantes</span>
                  </div>
                </div>
              </div>

              {content.gridFeatures.bannerBtnLabel && (
                <a 
                  href={content.gridFeatures.bannerBtnHref || "#"} 
                  className={`btn btn-primary ${styles.bannerBtn}`}
                >
                  {content.gridFeatures.bannerBtnLabel}
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>↗</span>
                </a>
              )}
            </Reveal>
          )}
        </section>
      )}

      {/* SECTION AVANTAGES FIDELIS */}
      {content.advantagesSection?.enabled && (
        <section className="section-padding container" id="advantages">
          <Reveal className="text-center">
            <h2>{content.advantagesSection.title}<span className="dot">_</span></h2>
            {content.advantagesSection.subtitle && (
              <p className={styles.featureSubtitle}>{content.advantagesSection.subtitle}</p>
            )}
          </Reveal>
          
          <div className={styles.advantagesGrid}>
            {content.advantagesSection.items.filter(item => item.enabled).map((advantage, idx) => {
              const getAdvantageIcon = (iconName: string) => {
                switch(iconName) {
                  case "assurance": return "🏥";
                  case "immobilier": return "🏠";
                  case "scolarite": return "🎓";
                  case "emploi": return "💼";
                  case "finance": return "💰";
                  case "alimentation": return "🛒";
                  case "reseau": return "🤝";
                  default: return "✨";
                }
              };

              return (
                <Reveal 
                  key={advantage.id} 
                  className={styles.advantageCard} 
                  delay={idx * 100} 
                  duration={0.8} 
                  direction="up"
                >
                  <div className={styles.advantageIconWrapper}>
                    {getAdvantageIcon(advantage.icon)}
                  </div>
                  <h4 className={styles.advantageTitle}>{advantage.title}</h4>
                  {advantage.description && (
                    <p className={styles.advantageDesc}>{advantage.description}</p>
                  )}
                  {advantage.cities && advantage.cities.length > 0 && (
                    <div className={styles.cityBadgesContainer}>
                      {advantage.cities.map((city, cIdx) => (
                        <span key={cIdx} className={styles.cityBadge}>
                          📍 {city}
                        </span>
                      ))}
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION SYNTHÈSE "POURQUOI CHOISIR FIDELIS ?" */}
      {content.whyFidelis?.enabled && (
        <section className="section-padding container" id="why">
          <Reveal className={styles.whySection} direction="up" duration={0.9} delay={100}>
            <div className={styles.whyGrid}>
              <div className={styles.whyLeft}>
                <h2 className={styles.whyTitle}>{content.whyFidelis.title}</h2>
                <p className={styles.whyDesc}>{content.whyFidelis.description}</p>
                
                <div className={styles.whyAvatarBlock}>
                  <div className={styles.bannerAvatarGroup}>
                    {AVATARS.map((av, idx) => (
                      <div key={idx} className={styles.bannerAvatarContainer}>
                        <img src={av.img} alt={av.name} className={styles.bannerAvatar} />
                        <div className={styles.bannerAvatarTooltip}>
                          <strong>{av.name}</strong>
                          <span>{av.points}</span>
                        </div>
                      </div>
                    ))}
                    <div className={styles.bannerAvatarMore}>+5k</div>
                  </div>
                  <div className={styles.whyAvatarText}>
                    <strong>Rejoignez notre communauté</strong>
                    Des milliers de membres évoluent avec nous
                  </div>
                </div>
              </div>

              <div className={styles.whyStatsGrid}>
                <div className={styles.whyStatCard}>
                  <span className={styles.whyStatNum}>{content.whyFidelis.statFormations}</span>
                  <span className={styles.whyStatLabel}>Formations</span>
                </div>
                <div className={styles.whyStatCard}>
                  <span className={styles.whyStatNum}>{content.whyFidelis.statPartenaires}</span>
                  <span className={styles.whyStatLabel}>Partenaires</span>
                </div>
                <div className={styles.whyStatCard}>
                  <span className={styles.whyStatNum}>{content.whyFidelis.statMembres}</span>
                  <span className={styles.whyStatLabel}>Membres</span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* SUPER APP CHECKLIST */}
      {content.superApp.enabled && (
        <section className="section-padding container" id="super-app">
          <div className={styles.superApp}>
            <Reveal className={styles.superAppContent} direction="right" duration={1}>
              <h2 style={{ textAlign: "left" }}>{content.superApp.title}<span className="dot">_</span></h2>
              <div className={styles.checklist}>
                {content.superApp.checklist.filter(c => c.enabled).map((item) => (
                  <div className={styles.checkItem} key={item.id}>
                    <span className={styles.checkCircle}><IconCheck /></span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setIsFinancingOpen(true)} className="btn btn-primary" style={{ marginTop: "32px" }}>
                {content.superApp.btnLabel}
              </button>
            </Reveal>
            
            <Reveal className={styles.superAppVisual} direction="left" duration={1} delay={200}>
               <img src={content.superApp.image} className={styles.floatingPhone} alt="App Visual" />
            </Reveal>
          </div>
        </section>
      )}

      {/* AGENT OVERLAY */}
      {content.agentBanner.enabled && (
        <section className="section-padding container">
          <div className="text-center" style={{ marginBottom: "32px" }}>
            <h2>{content.agentBanner.title}<span className="dot">_</span></h2>
          </div>
          <div className={styles.agentBanner}>
            <div className={styles.agentBg}>
               <img src={content.agentBanner.backgroundImage} alt="Agent Context" />
            </div>
            <div className={styles.agentOverlay}>
              <h3>{content.agentBanner.overlayTitle}</h3>
              <p>{content.agentBanner.overlayDesc}</p>
              <div className={styles.agentStats}>
                <div>
                  <div className={styles.statNum}>{content.agentBanner.stat1Num}</div>
                  <div style={{fontSize: "12px", opacity: 0.8}}>{content.agentBanner.stat1Label}</div>
                </div>
                <div>
                  <div className={styles.statNum}>{content.agentBanner.stat2Num}</div>
                  <div style={{fontSize: "12px", opacity: 0.8}}>{content.agentBanner.stat2Label}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3D BRAND SHOWCASE (REPLACED SKILLS CONSTELLATION) */}
      {(!content.splitCards || content.splitCards.enabled) && (
        <section className="section-padding container" id="cards" style={{ borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
          <Reveal className="text-center" style={{ marginBottom: "48px" }} direction="up">
            <h2>{content.splitCards?.title || "Votre Univers Fidelis"}<span className="dot">_</span></h2>
            <p style={{ color: "rgba(15, 23, 42, 0.6)", marginTop: "12px", fontSize: "16.5px", maxWidth: "620px", margin: "12px auto 0", lineHeight: "1.6" }}>
              Explorez notre écosystème de fidélité 3D. Découvrez l'alliance parfaite entre le design physique premium de notre carte et la puissance de nos outils digitaux.
            </p>
          </Reveal>
          <div className={styles.brandUniverseGrid}>
            {(!content.splitCards || content.splitCards.cardPhysical?.enabled) && (
              <Reveal className={styles.brandUniverseImageCard} direction="right" duration={0.8}>
                <div className={styles.brandUniverseFrame}>
                  <img src={content.splitCards?.cardPhysical?.image || "/carte-fidelis.jpeg"} alt="Carte Fidelis Officielle" className={styles.brandLogoImage} />
                </div>
                <div style={{ marginTop: "24px" }}>
                  <h4>{content.splitCards?.cardPhysical?.title || "Identité de Marque Fidelis"}</h4>
                  <p style={{ fontSize: "14px", color: "rgba(15,23,42,0.7)", marginTop: "8px" }}>
                    {content.splitCards?.cardPhysical?.description || "Un design épuré, aux finitions or et émeraude, sculpté pour offrir à vos clients une expérience d'achat haut de gamme inédite."}
                  </p>
                </div>
              </Reveal>
            )}
            {(!content.splitCards || content.splitCards.cardVirtual?.enabled) && (
              <Reveal className={styles.brandUniverse3DCard} direction="left" duration={0.8} delay={200}>
                <Fidelis3DLogo />
                <div style={{ marginTop: "24px" }}>
                  <h4>{content.splitCards?.cardVirtual?.title || "Écosystème Numérique Interactif"}</h4>
                  <p style={{ fontSize: "14px", color: "rgba(15,23,42,0.7)", marginTop: "8px" }}>
                    {content.splitCards?.cardVirtual?.description || "Faites tourner et pivoter notre logo 3D orbital. Fidelis est un univers vivant et interconnecté, alliant transactions fluides et récompenses immédiates."}
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* PARTNERS SECTION */}
      {content.partners && content.partners.enabled && (
        <PartnersSection partners={content.partners} />
      )}

      {/* FAQ SECTION */}
      {content.faq.enabled && (
        <FaqAccordion faq={content.faq} />
      )}

      {/* CONTACT FORM */}
      <section className="section-padding container" style={{ borderBottom: "1px solid var(--border-color)" }}>
        <div className={styles.contactFormContainer}>
          <Reveal className="text-center" style={{ marginBottom: "32px" }}>
            <h2>Contactez-nous<span className="dot">_</span></h2>
            <p style={{ color: "rgba(15,23,42,0.6)", marginTop: "8px" }}>
              Une question, un partenariat ou besoin d'une démonstration ? Notre équipe vous répond sous 24h.
            </p>
          </Reveal>
          <Reveal className={styles.contactFormCard} direction="up" duration={0.8}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* FOOTER CTA */}
      {content.footerCta.enabled && (
        <section className="container" style={{ marginTop: "60px" }}>
          <div className={styles.footerCta}>
            <Reveal className={styles.ctaPhones} direction="right" duration={1}>
               <img src={content.footerCta.image} alt="Footer graphic" style={{maxWidth: "200px", margin: "0 auto", display: "block"}} />
            </Reveal>
            <Reveal className={styles.footerCtaContent} direction="left" duration={1} delay={200}>
              <h2>{content.footerCta.title}<span className="dot">_</span></h2>
              <p style={{marginBottom: "24px"}}>{content.footerCta.description}</p>
              <div className={styles.footerSocials}>
                {content.footerCta.socials.filter(s => s.enabled).map(social => (
                   <a key={social.id} href={social.url} className={styles.socialIcon} target="_blank" rel="noreferrer">{social.label}</a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* SITE FOOTER */}
      <footer className="container">
        <div className={styles.siteFooter}>
          <div>{content.site.footerText}</div>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="#">Mentions légales</a>
            <a href="#">CGU</a>
            <a href="#">Confidentialité</a>
          </div>
        </div>
      </footer>

      {/* FINANCING SYSTEM MODAL POPUP */}
      <FinancingModal isOpen={isFinancingOpen} onClose={() => setIsFinancingOpen(false)} financingConfig={content.financing} />
    </div>
  );
}

function ContactForm() {
  const [contactData, setContactData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/submissions/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      if (res.ok) {
        setIsSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue lors de l'envoi.");
      }
    } catch {
      setError("Erreur de réseau ou de connexion.");
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(0, 168, 107, 0.1)",
          color: "#00A86B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px auto"
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h4 style={{ fontWeight: 700, fontSize: "18px" }}>Message Envoyé !</h4>
        <p style={{ color: "rgba(15,23,42,0.7)", fontSize: "14px", marginTop: "8px", lineHeight: 1.5 }}>
          Merci pour votre message. Notre service commercial ou financier reviendra vers vous très rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {error && (
        <div style={{
          padding: "12px 16px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "8px",
          color: "#dc2626",
          fontSize: "14px",
          textAlign: "center"
        }}>
          ⚠️ {error}
        </div>
      )}
      <div className={styles.formRow}>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block" }}>Nom Complet *</label>
          <input 
            type="text" 
            required 
            placeholder="Votre nom" 
            value={contactData.name} 
            onChange={(e) => setContactData({ ...contactData, name: e.target.value })} 
            style={{
              width: "100%",
              padding: "14px 18px",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: "10px",
              outline: "none",
              fontSize: "14px",
              color: "#0F172A"
            }}
          />
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block" }}>Adresse E-mail *</label>
          <input 
            type="email" 
            required 
            placeholder="nom@exemple.com" 
            value={contactData.email} 
            onChange={(e) => setContactData({ ...contactData, email: e.target.value })} 
            style={{
              width: "100%",
              padding: "14px 18px",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: "10px",
              outline: "none",
              fontSize: "14px",
              color: "#0F172A"
            }}
          />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block" }}>Sujet *</label>
        <input 
          type="text" 
          required 
          placeholder="Sujet de votre message" 
          value={contactData.subject} 
          onChange={(e) => setContactData({ ...contactData, subject: e.target.value })} 
          style={{
            width: "100%",
            padding: "14px 18px",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: "10px",
            outline: "none",
            fontSize: "14px",
            color: "#0F172A"
          }}
        />
      </div>
      <div className={styles.formGroup}>
        <label style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px", display: "block" }}>Message *</label>
        <textarea 
          required 
          rows={4}
          placeholder="Comment pouvons-nous vous aider ?" 
          value={contactData.message} 
          onChange={(e) => setContactData({ ...contactData, message: e.target.value })} 
          style={{
            width: "100%",
            padding: "14px 18px",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: "10px",
            outline: "none",
            fontSize: "14px",
            color: "#0F172A",
            resize: "vertical",
            fontFamily: "inherit"
          }}
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="btn btn-primary" 
        style={{ padding: "14px 28px", alignSelf: "flex-end", opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
      >
        {loading ? "Envoi en cours..." : "Envoyer le message ✉"}
      </button>
    </form>
  );
}

function FaqAccordion({ faq }: { faq: SiteContent["faq"] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="section-padding container">
      <div className="text-center">
        <h2>{faq.title}<span className="dot">_</span></h2>
      </div>
      <div className={styles.faqContainer}>
        {faq.items.filter(i => i.enabled).map((q) => {
          const isOpen = openId === q.id;
          return (
            <div 
              key={q.id} 
              className={styles.faqItemWrapper}
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <div 
                onClick={() => toggle(q.id)}
                style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0" }}
              >
                <h4 style={{ margin: 0, fontWeight: 600 }}>{q.question}</h4>
                <div style={{ 
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  color: isOpen ? "var(--primary)" : "inherit"
                }}>
                  <IconArrowRight />
                </div>
              </div>
              <div style={{
                maxHeight: isOpen ? "500px" : "0px",
                overflow: "hidden",
                transition: "all 0.3s ease",
                opacity: isOpen ? 1 : 0,
                fontSize: "15px",
                color: "rgba(15, 23, 42, 0.7)",
                lineHeight: "1.6",
                paddingBottom: isOpen ? "24px" : "0px",
                whiteSpace: "pre-line"
              }}>
                {q.answer || "Réponse en cours de rédaction..."}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PartnersSection({ partners }: { partners: SiteContent["partners"] }) {
  const activeCats = (partners.categories || []).filter(c => c.enabled);
  const initialCatId = activeCats.length > 0 ? activeCats[0].id : "";
  
  const [activeCatId, setActiveCatId] = useState<string>(initialCatId);

  const activeTabId = activeCats.some(c => c.id === activeCatId) 
    ? activeCatId 
    : initialCatId;

  const filteredItems = (partners.items || []).filter(
    item => item.enabled && item.categoryId === activeTabId
  );

  if (activeCats.length === 0) return null;

  return (
    <section id="partners" className="section-padding container">
      <div className="text-center" style={{ marginBottom: "20px" }}>
        <h2 style={{ whiteSpace: 'pre-line' }}>{partners.title}<span className="dot">_</span></h2>
      </div>

      <div className={styles.partnersTabs}>
        {activeCats.map((cat) => {
          const isActive = cat.id === activeTabId;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCatId(cat.id)}
              className={styles.partnerTab}
              style={{
                backgroundColor: isActive ? partners.tabActiveBgColor : partners.tabBgColor,
                color: isActive ? partners.tabActiveTextColor : partners.tabTextColor,
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                fontWeight: isActive ? '700' : '600',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className={styles.partnersGrid}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className={styles.partnerCard}>
              <div style={{ width: "100%" }}>
                <div className={styles.partnerLogoWrapper}>
                  {item.logo ? (
                    <img src={item.logo} alt={item.name} className={styles.partnerLogo} />
                  ) : (
                    <div className={styles.partnerPlaceholderLogo}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      {item.name}
                    </div>
                  )}
                </div>
                {item.logo && <h4 className={styles.partnerName}>{item.name}</h4>}
                <p className={styles.partnerDesc} style={{ whiteSpace: 'pre-line' }}>{item.description}</p>
              </div>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className={styles.partnerImg} />
                )}
                
                {(item.videoUrl || item.pdfUrl) && (
                  <div className={styles.partnerActions}>
                    {item.videoUrl && (
                      <a href={item.videoUrl} className={styles.actionLink} target="_blank" rel="noreferrer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        Vidéo
                      </a>
                    )}
                    {item.pdfUrl && (
                      <a href={item.pdfUrl} className={styles.actionLink} download target="_blank" rel="noreferrer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Fichier PDF
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 0", color: "var(--dark-light)", border: "2px dashed var(--border-color)", borderRadius: "20px" }}>
            Aucun partenaire enregistré dans cette catégorie pour le moment.
          </div>
        )}
      </div>
    </section>
  );
}
