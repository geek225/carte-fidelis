"use client";

import React, { CSSProperties, useState } from "react";
import styles from "./modern-landing.module.css";
import type { SiteContent } from "@/lib/site-content-schema";

const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const IconPhone = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
);
const IconGlobe = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const IconSupport = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);

const getIcon = (name: string) => {
  switch(name) {
    case "check": return <IconCheck />;
    case "phone": return <IconPhone />;
    case "globe": return <IconGlobe />;
    case "support": return <IconSupport />;
    case "arrow": return <IconArrowRight />;
    default: return <IconCheck />;
  }
}

type ModernLandingProps = {
  content: SiteContent;
};

export function ModernLanding({ content }: ModernLandingProps) {
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
            <a href={content.header.ctaHref} className="btn btn-primary">{content.header.ctaLabel}</a>
          )}
        </div>
      </header>

      {/* HERO */}
      {content.hero.enabled && (
        <section className={styles.heroBg}>
          <div className={`container ${styles.hero} fade-in`}>
            <div className={styles.heroContent}>
              <div className={styles.heroKicker}>
                <span className={styles.kickerNum}>{content.hero.kickerNum}</span>
                <span className={styles.kickerText} style={{ whiteSpace: 'pre-line' }}>{content.hero.kickerText}</span>
              </div>
              <h1 style={{ whiteSpace: 'pre-line' }}>{content.hero.title}</h1>
              <p className={styles.heroSub}>{content.hero.subtitle}</p>
              <a href={content.hero.btnHref} className="btn btn-primary" style={{ padding: "16px 32px", fontSize: "16px" }}>
                {content.hero.btnLabel}
              </a>
            </div>
            
            <div className={styles.heroImage}>
              <img src={content.hero.mainImage} alt={content.site.brandName} />
            </div>
          </div>
        </section>
      )}

      {/* GRID FEATURES */}
      {content.gridFeatures.enabled && (
        <section className="section-padding container">
          <div className="text-center">
            <h2 style={{ whiteSpace: 'pre-line' }}>{content.gridFeatures.title}<span className="dot">_</span></h2>
          </div>
          <div className={styles.gridFeatures}>
            {content.gridFeatures.items.filter(i => i.enabled).map((feature) => (
              <div key={feature.id} className={styles.featureSmall}>
                <div className={styles.featureIcon}>{getIcon(feature.icon)}</div>
                <p>{feature.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CARD SPLIT SECTION */}
      {content.splitCards.enabled && (
        <section className="section-padding container">
          <div className="text-center">
            <h2>{content.splitCards.title}<span className="dot">_</span></h2>
          </div>
          <div className={styles.splitCards}>
            {content.splitCards.cardPhysical.enabled && (
              <div className={styles.cardItem}>
                <div className={styles.cardHead}>
                  <h3>{content.splitCards.cardPhysical.title}</h3>
                  <p>{content.splitCards.cardPhysical.description}</p>
                </div>
                <div className={styles.cardVisual}>
                  <img src={content.splitCards.cardPhysical.image} alt={content.splitCards.cardPhysical.title} />
                </div>
                <a href={content.splitCards.cardPhysical.btnHref} className="btn btn-primary">{content.splitCards.cardPhysical.btnLabel}</a>
              </div>
            )}

            {content.splitCards.cardVirtual.enabled && (
              <div className={styles.cardItem}>
                <div className={styles.cardHead}>
                  <h3>{content.splitCards.cardVirtual.title}</h3>
                  <p>{content.splitCards.cardVirtual.description}</p>
                </div>
                <div className={styles.cardVisual}>
                  <img src={content.splitCards.cardVirtual.image} alt={content.splitCards.cardVirtual.title} style={{ transform: "scale(0.8) translateY(20px)" }} />
                </div>
                <a href={content.splitCards.cardVirtual.btnHref} className="btn btn-primary">{content.splitCards.cardVirtual.btnLabel}</a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SUPER APP CHECKLIST */}
      {content.superApp.enabled && (
        <section className="section-padding container">
          <div className={styles.superApp}>
            <div className={styles.superAppContent}>
              <h2 style={{ textAlign: "left" }}>{content.superApp.title}<span className="dot">_</span></h2>
              <div className={styles.checklist}>
                {content.superApp.checklist.filter(c => c.enabled).map((item) => (
                  <div className={styles.checkItem} key={item.id}>
                    <span className={styles.checkCircle}><IconCheck /></span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <a href={content.superApp.btnHref} className="btn btn-primary" style={{ marginTop: "32px" }}>{content.superApp.btnLabel}</a>
            </div>
            
            <div className={styles.superAppVisual}>
               <img src={content.superApp.image} className={styles.floatingPhone} alt="App Visual" />
            </div>
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

      {/* PARTNERS SECTION */}
      {content.partners && content.partners.enabled && (
        <PartnersSection partners={content.partners} />
      )}

      {/* FAQ SECTION */}
      {content.faq.enabled && (
        <FaqAccordion faq={content.faq} />
      )}

      {/* FOOTER CTA */}
      {content.footerCta.enabled && (
        <section className="container">
          <div className={styles.footerCta}>
            <div className={styles.ctaPhones}>
               <img src={content.footerCta.image} alt="Footer graphic" style={{maxWidth: "200px", margin: "0 auto", display: "block"}} />
            </div>
            <div className={styles.footerCtaContent}>
              <h2>{content.footerCta.title}<span className="dot">_</span></h2>
              <p style={{marginBottom: "24px"}}>{content.footerCta.description}</p>
              <div className={styles.footerSocials}>
                {content.footerCta.socials.filter(s => s.enabled).map(social => (
                   <a key={social.id} href={social.url} className={styles.socialIcon} target="_blank" rel="noreferrer">{social.label}</a>
                ))}
              </div>
            </div>
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
    </div>
  );
}

function FaqAccordion({ faq }: { faq: SiteContent["faq"] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="section-padding container">
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
                color: "var(--dark-light)",
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

  // Guard against activeCatId no longer existing in categories list
  const activeTabId = activeCats.some(c => c.id === activeCatId) 
    ? activeCatId 
    : initialCatId;

  const filteredItems = (partners.items || []).filter(
    item => item.enabled && item.categoryId === activeTabId
  );

  if (activeCats.length === 0) return null;

  return (
    <section id="partenaires" className="section-padding container">
      <div className="text-center" style={{ marginBottom: "20px" }}>
        <h2 style={{ whiteSpace: 'pre-line' }}>{partners.title}<span className="dot">_</span></h2>
      </div>

      {/* Filter Tabs */}
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

      {/* Partners list */}
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
