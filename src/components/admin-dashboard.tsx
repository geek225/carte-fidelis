"use client";

import { useState, useTransition } from "react";

import type {
  CTAItem,
  FeatureItem,
  NavItem,
  SiteContent,
  SocialLink,
  StatItem,
  StepItem,
} from "@/lib/site-content-schema";

type AdminDashboardProps = {
  initialContent: SiteContent;
};

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function updateItemById<T extends { id: string }>(items: T[], id: string, patch: Partial<T>) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function removeItemById<T extends { id: string }>(items: T[], id: string) {
  return items.filter((item) => item.id !== id);
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-panel">
      <div className="admin-panel__head">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="admin-panel__body">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="admin-field admin-field--full">
      <span>{label}</span>
      <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <div className="admin-image-field">
      <Field label={label} value={value} onChange={onChange} />
      <label className="button button-secondary admin-upload-button">
        Uploader une image
        <input
          accept="image/*"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            await onUpload(file);
            event.target.value = "";
          }}
          type="file"
        />
      </label>
    </div>
  );
}

export function AdminDashboard({ initialContent }: AdminDashboardProps) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState("Aucune modification sauvegardee.");
  const [isPending, startTransition] = useTransition();

  function setMenu(items: NavItem[]) {
    setContent((current) => ({ ...current, menu: items }));
  }

  function setSocials(items: SocialLink[]) {
    setContent((current) => ({ ...current, socials: items }));
  }

  function setHeroStats(items: StatItem[]) {
    setContent((current) => ({ ...current, hero: { ...current.hero, stats: items } }));
  }

  function setBenefitItems(items: FeatureItem[]) {
    setContent((current) => ({ ...current, benefits: { ...current.benefits, items } }));
  }

  function setProcessSteps(items: StepItem[]) {
    setContent((current) => ({ ...current, process: { ...current.process, steps: items } }));
  }

  function setImpactStats(items: StatItem[]) {
    setContent((current) => ({ ...current, impact: { ...current.impact, stats: items } }));
  }

  function setCtaItems(items: CTAItem[]) {
    setContent((current) => ({ ...current, cta: { ...current.cta, items } }));
  }

  async function uploadImage(file: File, applyPath: (path: string) => void) {
    setStatus(`Upload de ${file.name}...`);
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(payload?.error ?? "Upload impossible.");
      return;
    }

    const payload = (await response.json()) as { path: string };
    applyPath(payload.path);
    setStatus(`Image importee: ${payload.path}`);
  }

  async function saveAllChanges() {
    setStatus("Sauvegarde en cours...");

    const response = await fetch("/api/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(payload?.error ?? "La sauvegarde a echoue.");
      return;
    }

    const payload = (await response.json()) as { mode: string };
    setStatus(
      payload.mode === "supabase"
        ? "Toutes les modifications ont ete sauvegardees dans Supabase."
        : "Toutes les modifications ont ete sauvegardees localement.",
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-kicker">CMS global</p>
          <h1>{content.site.brandName}</h1>
          <p>
            Gere le menu, les textes, les images, les couleurs, les reseaux sociaux et les animations
            du site one-page.
          </p>
        </div>
        <div className="admin-sidebar__actions">
          <button
            className="button button-primary"
            disabled={isPending}
            onClick={() => startTransition(saveAllChanges)}
            type="button"
          >
            {isPending ? "Sauvegarde..." : "Sauvegarder toutes les modifications"}
          </button>
          <a className="button button-secondary" href="/" rel="noreferrer" target="_blank">
            Ouvrir le site public
          </a>
          <p className="admin-status">{status}</p>
        </div>
      </aside>

      <div className="admin-main">
        <Panel title="Parametres generaux">
          <div className="admin-grid admin-grid--two">
            <Field label="Nom de marque" value={content.site.brandName} onChange={(value) => setContent((current) => ({ ...current, site: { ...current.site, brandName: value } }))} />
            <Field label="Titre SEO" value={content.site.metaTitle} onChange={(value) => setContent((current) => ({ ...current, site: { ...current.site, metaTitle: value } }))} />
            <TextAreaField label="Description SEO" value={content.site.metaDescription} onChange={(value) => setContent((current) => ({ ...current, site: { ...current.site, metaDescription: value } }))} />
            <Field label="Texte footer" value={content.site.footerText} onChange={(value) => setContent((current) => ({ ...current, site: { ...current.site, footerText: value } }))} />
          </div>
        </Panel>

        <Panel title="Theme et couleurs">
          <div className="admin-grid admin-grid--three">
            <Field label="Fond principal" type="color" value={content.theme.background} onChange={(value) => setContent((current) => ({ ...current, theme: { ...current.theme, background: value } }))} />
            <Field label="Texte principal" type="color" value={content.theme.foreground} onChange={(value) => setContent((current) => ({ ...current, theme: { ...current.theme, foreground: value } }))} />
            <Field label="Accent" type="color" value={content.theme.accent} onChange={(value) => setContent((current) => ({ ...current, theme: { ...current.theme, accent: value } }))} />
            <Field label="Texte accent" type="color" value={content.theme.accentText} onChange={(value) => setContent((current) => ({ ...current, theme: { ...current.theme, accentText: value } }))} />
            <Field label="Texte secondaire" value={content.theme.muted} onChange={(value) => setContent((current) => ({ ...current, theme: { ...current.theme, muted: value } }))} />
            <Field label="Fond menu" value={content.theme.menuBackground} onChange={(value) => setContent((current) => ({ ...current, theme: { ...current.theme, menuBackground: value } }))} />
            <Field label="Surface" value={content.theme.surface} onChange={(value) => setContent((current) => ({ ...current, theme: { ...current.theme, surface: value } }))} />
            <Field label="Surface douce" value={content.theme.surfaceSoft} onChange={(value) => setContent((current) => ({ ...current, theme: { ...current.theme, surfaceSoft: value } }))} />
            <Field label="Bordures" value={content.theme.border} onChange={(value) => setContent((current) => ({ ...current, theme: { ...current.theme, border: value } }))} />
          </div>
        </Panel>

        <Panel title="Animations">
          <div className="admin-grid admin-grid--three">
            <label className="admin-field">
              <span>Animation carte hero</span>
              <select value={content.animation.heroCard} onChange={(event) => setContent((current) => ({ ...current, animation: { ...current.animation, heroCard: event.target.value as SiteContent["animation"]["heroCard"] } }))}>
                <option value="float">Float</option>
                <option value="tilt">Tilt</option>
                <option value="none">None</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Reveal sections</span>
              <select value={content.animation.reveal} onChange={(event) => setContent((current) => ({ ...current, animation: { ...current.animation, reveal: event.target.value as SiteContent["animation"]["reveal"] } }))}>
                <option value="fade-up">Fade up</option>
                <option value="fade">Fade</option>
                <option value="none">None</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Animation medias</span>
              <select value={content.animation.media} onChange={(event) => setContent((current) => ({ ...current, animation: { ...current.animation, media: event.target.value as SiteContent["animation"]["media"] } }))}>
                <option value="parallax">Parallax</option>
                <option value="static">Static</option>
              </select>
            </label>
          </div>
        </Panel>

        <Panel title="Tailles" description="Regle les tailles principales sans toucher au code CSS.">
          <div className="admin-grid admin-grid--three">
            <Field label="Titre hero" value={content.sizing.heroTitle} onChange={(value) => setContent((current) => ({ ...current, sizing: { ...current.sizing, heroTitle: value } }))} />
            <Field label="Titres de section" value={content.sizing.sectionTitle} onChange={(value) => setContent((current) => ({ ...current, sizing: { ...current.sizing, sectionTitle: value } }))} />
            <Field label="Texte courant" value={content.sizing.bodyText} onChange={(value) => setContent((current) => ({ ...current, sizing: { ...current.sizing, bodyText: value } }))} />
            <Field label="Largeur carte hero" value={content.sizing.heroCardWidth} onChange={(value) => setContent((current) => ({ ...current, sizing: { ...current.sizing, heroCardWidth: value } }))} />
            <Field label="Hauteur image avantages" value={content.sizing.benefitsImageHeight} onChange={(value) => setContent((current) => ({ ...current, sizing: { ...current.sizing, benefitsImageHeight: value } }))} />
            <Field label="Hauteur image parcours" value={content.sizing.processImageHeight} onChange={(value) => setContent((current) => ({ ...current, sizing: { ...current.sizing, processImageHeight: value } }))} />
            <Field label="Hauteur image impact" value={content.sizing.impactImageHeight} onChange={(value) => setContent((current) => ({ ...current, sizing: { ...current.sizing, impactImageHeight: value } }))} />
          </div>
        </Panel>

        <Panel title="Menu">
          <div className="admin-stack">
            {content.menu.map((item) => (
              <div className="admin-row-card" key={item.id}>
                <div className="admin-grid admin-grid--menu">
                  <Field label="Libelle" value={item.label} onChange={(value) => setMenu(updateItemById(content.menu, item.id, { label: value }))} />
                  <Field label="Lien" value={item.href} onChange={(value) => setMenu(updateItemById(content.menu, item.id, { href: value }))} />
                  <label className="admin-check">
                    <input checked={item.enabled} onChange={(event) => setMenu(updateItemById(content.menu, item.id, { enabled: event.target.checked }))} type="checkbox" />
                    <span>Afficher</span>
                  </label>
                </div>
                <button className="button button-secondary" onClick={() => setMenu(removeItemById(content.menu, item.id))} type="button">Supprimer</button>
              </div>
            ))}
            <button className="button button-secondary" onClick={() => setMenu([...content.menu, { id: makeId("menu"), label: "Nouvel item", href: "#nouvelle-section", enabled: true }])} type="button">Ajouter un item de menu</button>
          </div>
        </Panel>

        <Panel title="Hero">
          <div className="admin-grid admin-grid--two">
            <Field label="Eyebrow" value={content.hero.eyebrow} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, eyebrow: value } }))} />
            <Field label="Titre" value={content.hero.title} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, title: value } }))} />
            <TextAreaField label="Description" value={content.hero.description} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, description: value } }))} />
            <ImageField label="Image carte" value={content.hero.cardImage} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, cardImage: value } }))} onUpload={(file) => uploadImage(file, (path) => setContent((current) => ({ ...current, hero: { ...current.hero, cardImage: path } })))} />
            <Field label="Badge partenaires" value={content.hero.partnerBadge} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, partnerBadge: value } }))} />
            <Field label="Label economies" value={content.hero.savingsLabel} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, savingsLabel: value } }))} />
            <Field label="CTA principal libelle" value={content.hero.primaryCtaLabel} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, primaryCtaLabel: value } }))} />
            <Field label="CTA principal lien" value={content.hero.primaryCtaHref} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, primaryCtaHref: value } }))} />
            <Field label="CTA secondaire libelle" value={content.hero.secondaryCtaLabel} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, secondaryCtaLabel: value } }))} />
            <Field label="CTA secondaire lien" value={content.hero.secondaryCtaHref} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, secondaryCtaHref: value } }))} />
          </div>
          <div className="admin-stack">
            <h3>Stats hero</h3>
            {content.hero.stats.map((stat) => (
              <div className="admin-row-card" key={stat.id}>
                <div className="admin-grid admin-grid--two">
                  <Field label="Valeur" value={stat.value} onChange={(value) => setHeroStats(updateItemById(content.hero.stats, stat.id, { value }))} />
                  <Field label="Libelle" value={stat.label} onChange={(value) => setHeroStats(updateItemById(content.hero.stats, stat.id, { label: value }))} />
                </div>
                <button className="button button-secondary" onClick={() => setHeroStats(removeItemById(content.hero.stats, stat.id))} type="button">Supprimer</button>
              </div>
            ))}
            <button className="button button-secondary" onClick={() => setHeroStats([...content.hero.stats, { id: makeId("hero-stat"), value: "0", label: "Nouvelle stat" }])} type="button">Ajouter une stat</button>
          </div>
        </Panel>

        <Panel title="Section avantages">
          <div className="admin-grid admin-grid--two">
            <Field label="Eyebrow" value={content.benefits.eyebrow} onChange={(value) => setContent((current) => ({ ...current, benefits: { ...current.benefits, eyebrow: value } }))} />
            <Field label="Titre" value={content.benefits.title} onChange={(value) => setContent((current) => ({ ...current, benefits: { ...current.benefits, title: value } }))} />
            <TextAreaField label="Description" value={content.benefits.description} onChange={(value) => setContent((current) => ({ ...current, benefits: { ...current.benefits, description: value } }))} />
            <ImageField label="Image" value={content.benefits.image} onChange={(value) => setContent((current) => ({ ...current, benefits: { ...current.benefits, image: value } }))} onUpload={(file) => uploadImage(file, (path) => setContent((current) => ({ ...current, benefits: { ...current.benefits, image: path } })))} />
            <Field label="Titre image" value={content.benefits.imageTitle} onChange={(value) => setContent((current) => ({ ...current, benefits: { ...current.benefits, imageTitle: value } }))} />
            <TextAreaField label="Description image" value={content.benefits.imageDescription} onChange={(value) => setContent((current) => ({ ...current, benefits: { ...current.benefits, imageDescription: value } }))} />
          </div>
          <div className="admin-stack">
            <h3>Blocs avantages</h3>
            {content.benefits.items.map((item) => (
              <div className="admin-row-card" key={item.id}>
                <div className="admin-grid admin-grid--two">
                  <Field label="Titre" value={item.title} onChange={(value) => setBenefitItems(updateItemById(content.benefits.items, item.id, { title: value }))} />
                  <TextAreaField label="Description" value={item.description} onChange={(value) => setBenefitItems(updateItemById(content.benefits.items, item.id, { description: value }))} />
                </div>
                <button className="button button-secondary" onClick={() => setBenefitItems(removeItemById(content.benefits.items, item.id))} type="button">Supprimer</button>
              </div>
            ))}
            <button className="button button-secondary" onClick={() => setBenefitItems([...content.benefits.items, { id: makeId("benefit"), title: "Nouvel avantage", description: "Description du bloc." }])} type="button">Ajouter un bloc</button>
          </div>
        </Panel>

        <Panel title="Section parcours">
          <div className="admin-grid admin-grid--two">
            <Field label="Eyebrow" value={content.process.eyebrow} onChange={(value) => setContent((current) => ({ ...current, process: { ...current.process, eyebrow: value } }))} />
            <Field label="Titre" value={content.process.title} onChange={(value) => setContent((current) => ({ ...current, process: { ...current.process, title: value } }))} />
            <TextAreaField label="Description" value={content.process.description} onChange={(value) => setContent((current) => ({ ...current, process: { ...current.process, description: value } }))} />
            <ImageField label="Image" value={content.process.image} onChange={(value) => setContent((current) => ({ ...current, process: { ...current.process, image: value } }))} onUpload={(file) => uploadImage(file, (path) => setContent((current) => ({ ...current, process: { ...current.process, image: path } })))} />
            <Field label="Titre image" value={content.process.imageTitle} onChange={(value) => setContent((current) => ({ ...current, process: { ...current.process, imageTitle: value } }))} />
            <TextAreaField label="Description image" value={content.process.imageDescription} onChange={(value) => setContent((current) => ({ ...current, process: { ...current.process, imageDescription: value } }))} />
          </div>
          <div className="admin-stack">
            <h3>Etapes</h3>
            {content.process.steps.map((item) => (
              <div className="admin-row-card" key={item.id}>
                <div className="admin-grid admin-grid--two">
                  <Field label="Titre" value={item.title} onChange={(value) => setProcessSteps(updateItemById(content.process.steps, item.id, { title: value }))} />
                  <TextAreaField label="Description" value={item.description} onChange={(value) => setProcessSteps(updateItemById(content.process.steps, item.id, { description: value }))} />
                </div>
                <button className="button button-secondary" onClick={() => setProcessSteps(removeItemById(content.process.steps, item.id))} type="button">Supprimer</button>
              </div>
            ))}
            <button className="button button-secondary" onClick={() => setProcessSteps([...content.process.steps, { id: makeId("step"), title: "Nouvelle etape", description: "Description de l'etape." }])} type="button">Ajouter une etape</button>
          </div>
        </Panel>

        <Panel title="Section impact">
          <div className="admin-grid admin-grid--two">
            <ImageField label="Image" value={content.impact.image} onChange={(value) => setContent((current) => ({ ...current, impact: { ...current.impact, image: value } }))} onUpload={(file) => uploadImage(file, (path) => setContent((current) => ({ ...current, impact: { ...current.impact, image: path } })))} />
            <Field label="Titre image" value={content.impact.imageTitle} onChange={(value) => setContent((current) => ({ ...current, impact: { ...current.impact, imageTitle: value } }))} />
            <TextAreaField label="Description image" value={content.impact.imageDescription} onChange={(value) => setContent((current) => ({ ...current, impact: { ...current.impact, imageDescription: value } }))} />
            <TextAreaField label="Citation" value={content.impact.quote} onChange={(value) => setContent((current) => ({ ...current, impact: { ...current.impact, quote: value } }))} />
            <Field label="Auteur citation" value={content.impact.quoteAuthor} onChange={(value) => setContent((current) => ({ ...current, impact: { ...current.impact, quoteAuthor: value } }))} />
          </div>
          <div className="admin-stack">
            <h3>Stats impact</h3>
            {content.impact.stats.map((stat) => (
              <div className="admin-row-card" key={stat.id}>
                <div className="admin-grid admin-grid--two">
                  <Field label="Valeur" value={stat.value} onChange={(value) => setImpactStats(updateItemById(content.impact.stats, stat.id, { value }))} />
                  <TextAreaField label="Libelle" value={stat.label} onChange={(value) => setImpactStats(updateItemById(content.impact.stats, stat.id, { label: value }))} />
                </div>
                <button className="button button-secondary" onClick={() => setImpactStats(removeItemById(content.impact.stats, stat.id))} type="button">Supprimer</button>
              </div>
            ))}
            <button className="button button-secondary" onClick={() => setImpactStats([...content.impact.stats, { id: makeId("impact"), value: "0", label: "Nouvelle stat impact" }])} type="button">Ajouter une stat impact</button>
          </div>
        </Panel>

        <Panel title="CTA final et contact">
          <div className="admin-grid admin-grid--two">
            <Field label="Eyebrow" value={content.cta.eyebrow} onChange={(value) => setContent((current) => ({ ...current, cta: { ...current.cta, eyebrow: value } }))} />
            <Field label="Titre" value={content.cta.title} onChange={(value) => setContent((current) => ({ ...current, cta: { ...current.cta, title: value } }))} />
            <TextAreaField label="Description" value={content.cta.description} onChange={(value) => setContent((current) => ({ ...current, cta: { ...current.cta, description: value } }))} />
            <Field label="Bouton principal" value={content.cta.primaryLabel} onChange={(value) => setContent((current) => ({ ...current, cta: { ...current.cta, primaryLabel: value } }))} />
            <Field label="Lien principal" value={content.cta.primaryHref} onChange={(value) => setContent((current) => ({ ...current, cta: { ...current.cta, primaryHref: value } }))} />
            <Field label="Bouton secondaire" value={content.cta.secondaryLabel} onChange={(value) => setContent((current) => ({ ...current, cta: { ...current.cta, secondaryLabel: value } }))} />
            <Field label="Lien secondaire" value={content.cta.secondaryHref} onChange={(value) => setContent((current) => ({ ...current, cta: { ...current.cta, secondaryHref: value } }))} />
          </div>
          <div className="admin-stack">
            <h3>Liste CTA</h3>
            {content.cta.items.map((item) => (
              <div className="admin-row-card" key={item.id}>
                <TextAreaField label="Texte" value={item.text} onChange={(value) => setCtaItems(updateItemById(content.cta.items, item.id, { text: value }))} />
                <button className="button button-secondary" onClick={() => setCtaItems(removeItemById(content.cta.items, item.id))} type="button">Supprimer</button>
              </div>
            ))}
            <button className="button button-secondary" onClick={() => setCtaItems([...content.cta.items, { id: makeId("cta"), text: "Nouvelle ligne de checklist" }])} type="button">Ajouter une ligne</button>
          </div>
        </Panel>

        <Panel title="Reseaux sociaux">
          <div className="admin-stack">
            {content.socials.map((item) => (
              <div className="admin-row-card" key={item.id}>
                <div className="admin-grid admin-grid--two">
                  <Field label="Nom" value={item.label} onChange={(value) => setSocials(updateItemById(content.socials, item.id, { label: value }))} />
                  <Field label="URL" value={item.url} onChange={(value) => setSocials(updateItemById(content.socials, item.id, { url: value }))} />
                </div>
                <button className="button button-secondary" onClick={() => setSocials(removeItemById(content.socials, item.id))} type="button">Supprimer</button>
              </div>
            ))}
            <button className="button button-secondary" onClick={() => setSocials([...content.socials, { id: makeId("social"), label: "Reseau", url: "https://" }])} type="button">Ajouter un reseau social</button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
