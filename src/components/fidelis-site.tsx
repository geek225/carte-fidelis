/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from "react";

import type { SiteContent, StatItem } from "@/lib/site-content-schema";

type FidelisSiteProps = {
  content: SiteContent;
};

function animationClass(reveal: SiteContent["animation"]["reveal"]) {
  if (reveal === "fade") return "reveal-fade";
  if (reveal === "none") return "reveal-none";
  return "reveal-up";
}

function heroCardClass(heroCard: SiteContent["animation"]["heroCard"]) {
  if (heroCard === "tilt") return "hero-card--tilt";
  if (heroCard === "none") return "hero-card--none";
  return "hero-card--float";
}

function mediaClass(media: SiteContent["animation"]["media"]) {
  return media === "parallax" ? "media--parallax" : "media--static";
}

function renderStats(stats: StatItem[]) {
  return stats.map((stat) => (
    <div className="metric" key={stat.id}>
      <strong>{stat.value}</strong>
      <span>{stat.label}</span>
    </div>
  ));
}

export function FidelisSite({ content }: FidelisSiteProps) {
  const activeMenu = content.menu.filter((item) => item.enabled);
  const revealClass = animationClass(content.animation.reveal);
  const cardClass = heroCardClass(content.animation.heroCard);
  const mediaMotionClass = mediaClass(content.animation.media);

  return (
    <div
      className="site-shell"
      id="top"
      style={
        {
          "--site-bg": content.theme.background,
          "--site-fg": content.theme.foreground,
          "--site-muted": content.theme.muted,
          "--site-accent": content.theme.accent,
          "--site-accent-text": content.theme.accentText,
          "--site-surface": content.theme.surface,
          "--site-surface-soft": content.theme.surfaceSoft,
          "--site-border": content.theme.border,
          "--site-menu-bg": content.theme.menuBackground,
          "--site-hero-title": content.sizing.heroTitle,
          "--site-section-title": content.sizing.sectionTitle,
          "--site-body-text": content.sizing.bodyText,
          "--site-hero-card-width": content.sizing.heroCardWidth,
          "--site-benefits-image-height": content.sizing.benefitsImageHeight,
          "--site-process-image-height": content.sizing.processImageHeight,
          "--site-impact-image-height": content.sizing.impactImageHeight,
        } as CSSProperties
      }
    >
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">F</span>
          <span>{content.site.brandName}</span>
        </a>
        <nav className="topnav">
          {activeMenu.map((item) => (
            <a href={item.href} key={item.id}>
              {item.label}
            </a>
          ))}
          <a className="nav-cta" href={content.hero.primaryCtaHref}>
            {content.hero.primaryCtaLabel}
          </a>
        </nav>
      </header>

      <main>
        <section className="hero section">
          <div className={`hero-copy ${revealClass}`}>
            <span className="eyebrow">{content.hero.eyebrow}</span>
            <h1>{content.hero.title}</h1>
            <p className="lead">{content.hero.description}</p>
            <div className="hero-actions">
              <a className="button button-primary" href={content.hero.primaryCtaHref}>
                {content.hero.primaryCtaLabel}
              </a>
              <a className="button button-secondary" href={content.hero.secondaryCtaHref}>
                {content.hero.secondaryCtaLabel}
              </a>
            </div>
            <div className="metric-grid">{renderStats(content.hero.stats)}</div>
          </div>

          <div className={`hero-visual ${revealClass}`}>
            <div className="orbital-ring" />
            <div className={`hero-card ${cardClass}`}>
              <img alt="Carte Fidelis" src={content.hero.cardImage} />
            </div>
            <div className="floating-chip">{content.hero.partnerBadge}</div>
            <div className="floating-panel">
              <span>Economies observees</span>
              <strong>{content.hero.stats[1]?.value ?? ""}</strong>
              <span>{content.hero.savingsLabel}</span>
            </div>
          </div>
        </section>

        <section className="section" id="avantages">
          <div className="section-grid">
            <div className={`section-copy ${revealClass}`}>
              <span className="eyebrow">{content.benefits.eyebrow}</span>
              <h2>{content.benefits.title}</h2>
              <p>{content.benefits.description}</p>
            </div>
            <figure className={`photo-card photo-card--tall ${revealClass} ${mediaMotionClass}`}>
              <img alt={content.benefits.imageTitle} src={content.benefits.image} />
              <figcaption className="photo-overlay">
                <strong>{content.benefits.imageTitle}</strong>
                <span>{content.benefits.imageDescription}</span>
              </figcaption>
            </figure>
          </div>

          <div className="feature-grid">
            {content.benefits.items.map((item, index) => (
              <article className={`info-card ${revealClass}`} key={item.id}>
                <strong className="index-pill">{String(index + 1).padStart(2, "0")}</strong>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="parcours">
          <div className={`section-copy ${revealClass}`}>
            <span className="eyebrow">{content.process.eyebrow}</span>
            <h2>{content.process.title}</h2>
            <p>{content.process.description}</p>
          </div>

          <div className="split-grid">
            <div className="steps-grid">
              {content.process.steps.map((step, index) => (
                <article className={`info-card ${revealClass}`} key={step.id}>
                  <strong className="index-pill">{index + 1}</strong>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
            <figure className={`photo-card ${revealClass} ${mediaMotionClass}`}>
              <img alt={content.process.imageTitle} src={content.process.image} />
              <figcaption className="photo-overlay">
                <strong>{content.process.imageTitle}</strong>
                <span>{content.process.imageDescription}</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="section" id="impact">
          <div className="impact-grid">
            <figure className={`photo-card ${revealClass} ${mediaMotionClass}`}>
              <img alt={content.impact.imageTitle} src={content.impact.image} />
              <figcaption className="photo-overlay">
                <strong>{content.impact.imageTitle}</strong>
                <span>{content.impact.imageDescription}</span>
              </figcaption>
            </figure>

            <div className="impact-stack">
              <article className={`quote-card ${revealClass}`}>
                <blockquote>{content.impact.quote}</blockquote>
                <footer>{content.impact.quoteAuthor}</footer>
              </article>

              {content.impact.stats.map((stat) => (
                <article className={`info-card ${revealClass}`} key={stat.id}>
                  <strong className="stat-highlight">{stat.value}</strong>
                  <p>{stat.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className={`cta-panel ${revealClass}`}>
            <div className="section-copy">
              <span className="eyebrow">{content.cta.eyebrow}</span>
              <h2>{content.cta.title}</h2>
              <p>{content.cta.description}</p>
              <div className="hero-actions">
                <a className="button button-primary" href={content.cta.primaryHref}>
                  {content.cta.primaryLabel}
                </a>
                <a className="button button-secondary" href={content.cta.secondaryHref}>
                  {content.cta.secondaryLabel}
                </a>
              </div>
            </div>

            <div className="checklist">
              {content.cta.items.map((item) => (
                <div className="check-item" key={item.id}>
                  <span className="check-dot" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>{content.site.footerText}</p>
        <div className="social-links">
          {content.socials.map((social) => (
            <a href={social.url} key={social.id} rel="noreferrer" target="_blank">
              {social.label}
            </a>
          ))}
          <a href="/admin">Dashboard CMS</a>
        </div>
      </footer>
    </div>
  );
}
