"use client";

import { useState, useTransition, ReactNode } from "react";
import type { SiteContent, NavItem, FeatureItem, TabItem, FaqItem, SocialLink, SimpleItem, PartnerCategory, PartnerItem } from "@/lib/site-content-schema";
import s from "./admin-dashboard.module.css";

type AdminDashboardProps = { initialContent: SiteContent };

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function updateItemById<T extends { id: string }>(items: T[], id: string, patch: Partial<T>) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function removeItemById<T extends { id: string }>(items: T[], id: string) {
  return items.filter((item) => item.id !== id);
}

/* Modern Base UI Atomic components attached to CSS Module */
function Panel({ title, description, children, enabled, onToggle }: { title: string; description?: string; children: ReactNode; enabled?: boolean; onToggle?: (val: boolean) => void; }) {
  return (
    <section className={s.panel}>
      <div className={s.panelHeader}>
        <div>
          <h3 className={s.panelTitle}>{title}</h3>
          {description && <p className={s.panelDesc}>{description}</p>}
        </div>
        {onToggle !== undefined && (
          <Switch label={enabled ? "Actif" : "Inactif"} checked={!!enabled} onChange={onToggle} />
        )}
      </div>
      <div className={s.panelBody} style={{ opacity: enabled === false ? 0.4 : 1, pointerEvents: enabled === false ? "none" : "auto" }}>
        {children}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string; }) {
  const isColor = type === "color";
  return (
    <div className={s.field}>
      <span className={s.fieldLabel}>{label}</span>
      <div className={isColor ? s.colorPickerWrapper : ""}>
        <input 
          type={type} 
          className={isColor ? s.colorInput : s.input} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
        />
        {isColor && <span style={{fontSize: "13px", color: "#64748b", fontFamily: "monospace"}}>{value}</span>}
      </div>
    </div>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void; }) {
  return (
    <div className={s.field}>
      <span className={s.fieldLabel}>{label}</span>
      <textarea className={`${s.input} ${s.textarea}`} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <label className={s.switchLabel}>
      <div style={{ position: "relative" }}>
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{opacity: 0, position: "absolute"}} />
        <div className={s.toggle}>
          <div className={s.toggleBall} />
        </div>
      </div>
      <span className={s.switchText}>{label}</span>
    </label>
  );
}

function ImageField({ label, value, onChange, onUpload }: { label: string; value: string; onChange: (v: string) => void; onUpload: (f: File, cb: (p: string) => void) => void; }) {
  return (
    <div className={s.field} style={{ gridColumn: "1 / -1" }}>
      <span className={s.fieldLabel}>{label}</span>
      <div className={s.uploadArea}>
        <input type="text" className={`${s.input} ${s.uploadInput}`} value={value} onChange={(e) => onChange(e.target.value)} placeholder="URL de l'image" />
        <label className={s.uploadBtn}>
          Importer
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f, onChange);
            e.target.value = "";
          }} />
        </label>
      </div>
    </div>
  );
}

export function AdminDashboard({ initialContent }: AdminDashboardProps) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<{ tone: "info" | "success" | "error", message: string }>({
    tone: "info", message: "Dashboard prêt."
  });
  const [isPending, startTransition] = useTransition();

  const updateContent = (patch: Partial<SiteContent> | ((curr: SiteContent) => SiteContent)) => {
     if (typeof patch === "function") setContent(patch);
     else setContent(curr => ({ ...curr, ...patch }));
  };

  async function uploadImage(file: File, applyPath: (path: string) => void) {
    setStatus({ tone: "info", message: "Chargement de l'image..." });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      applyPath(data.path);
      setStatus({ tone: "success", message: "Image mise à jour." });
    } catch {
      setStatus({ tone: "error", message: "Échec de l'upload." });
    }
  }

  async function save() {
    setStatus({ tone: "info", message: "Publication en cours..." });
    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content)
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStatus({ tone: "success", message: data.mode === "supabase" ? "Publié sur le Cloud !" : "Publié localement." });
    } catch {
      setStatus({ tone: "error", message: "Erreur de connexion." });
    }
  }

  return (
    <div className={s.layout}>
      {/* STICKY SIDEBAR */}
      <aside className={s.sidebar}>
        <div className={s.brandHeader}>
          <div className={s.kicker}>Studio CMS</div>
          <h1>{content.site.brandName}</h1>
          <p className={s.sidebarDesc}>
            Bienvenue dans votre studio de gestion. Pilotez votre identité en direct.
          </p>
        </div>
        
        <div className={s.sidebarActions}>
          <button className={s.publishBtn} disabled={isPending} onClick={() => startTransition(save)}>
            {isPending ? "⏳ Patientez..." : "🚀 Publier les modifications"}
          </button>
          <a className={s.visitBtn} href="/" target="_blank" rel="noreferrer">👁 Voir le site live</a>
          <div className={`${s.statusBadge} ${s['statusBadge_'+status.tone]}`}>
            {status.message}
          </div>
        </div>
      </aside>

      {/* MAIN SCROLLABLE STREAM */}
      <main className={s.main}>
        <div className={s.header}>
          <h2>Tableau de Bord Éditorial</h2>
          <p style={{color: "#64748b"}}>Organisez et personnalisez chaque élément de votre landing page sans une ligne de code.</p>
        </div>

        {/* GENERAL */}
        <Panel title="Identité & Meta" description="Votre nom de marque, logo et vos configurations pour le référencement naturel.">
          <div className={`${s.grid} ${s.grid2}`}>
            <Field label="Nom de la Marque (Texte)" value={content.site.brandName} onChange={v => updateContent(c => ({ ...c, site: { ...c.site, brandName: v }}))} />
            <Field label="Titre du Site (SEO)" value={content.site.metaTitle} onChange={v => updateContent(c => ({ ...c, site: { ...c.site, metaTitle: v }}))} />
            <ImageField label="Logo Officiel (Remplace le texte si défini)" value={content.site.logoImage} onChange={v => updateContent(c => ({ ...c, site: { ...c.site, logoImage: v }}))} onUpload={uploadImage} />
            <div style={{ gridColumn: "1 / -1" }}>
              <TextAreaField label="Description SEO" value={content.site.metaDescription} onChange={v => updateContent(c => ({ ...c, site: { ...c.site, metaDescription: v }}))} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Texte de copyright Footer" value={content.site.footerText} onChange={v => updateContent(c => ({ ...c, site: { ...c.site, footerText: v }}))} />
            </div>
          </div>
        </Panel>

        {/* THEME */}
        <Panel title="Design System" description="Gérez la palette visuelle centrale de l'interface en temps réel.">
          <div className={`${s.grid} ${s.grid3}`}>
            <Field label="Couleur Principale" type="color" value={content.theme.primary} onChange={v => updateContent(c => ({ ...c, theme: { ...c.theme, primary: v }}))} />
            <Field label="Survol Principal" type="color" value={content.theme.primaryHover} onChange={v => updateContent(c => ({ ...c, theme: { ...c.theme, primaryHover: v }}))} />
            <Field label="Fond d'Écran" type="color" value={content.theme.white} onChange={v => updateContent(c => ({ ...c, theme: { ...c.theme, white: v }}))} />
            <Field label="Titres Foncés" type="color" value={content.theme.dark} onChange={v => updateContent(c => ({ ...c, theme: { ...c.theme, dark: v }}))} />
            <Field label="Textes Secondaires" type="color" value={content.theme.darkLight} onChange={v => updateContent(c => ({ ...c, theme: { ...c.theme, darkLight: v }}))} />
            <Field label="Bordures & Lignes" type="color" value={content.theme.borderColor} onChange={v => updateContent(c => ({ ...c, theme: { ...c.theme, borderColor: v }}))} />
          </div>
        </Panel>

        {/* NAV */}
        <Panel title="Navigation de Tête" description="Gérez les liens de votre menu et le bouton d'appel à l'action principal.">
           <div className={`${s.grid} ${s.grid3}`} style={{ alignItems: "end", marginBottom: "24px" }}>
             <Field label="Texte Bouton CTA" value={content.header.ctaLabel} onChange={v => updateContent(c => ({ ...c, header: { ...c.header, ctaLabel: v }}))} />
             <Field label="Cible / Lien (#)" value={content.header.ctaHref} onChange={v => updateContent(c => ({ ...c, header: { ...c.header, ctaHref: v }}))} />
             <div style={{paddingBottom: "12px"}}>
               <Switch label="Activer bouton" checked={content.header.ctaEnabled} onChange={v => updateContent(c => ({ ...c, header: { ...c.header, ctaEnabled: v }}))} />
             </div>
           </div>
           <div className={s.stack}>
             <div style={{fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "8px"}}>Liens du menu</div>
             {content.header.menu.map(item => (
               <div key={item.id} className={s.rowCard}>
                 <div className={`${s.grid} ${s.grid3}`} style={{alignItems: "end"}}>
                    <Field label="Libellé" value={item.label} onChange={v => updateContent(c => ({ ...c, header: { ...c.header, menu: updateItemById(c.header.menu, item.id, { label: v })}}))} />
                    <Field label="Cible" value={item.href} onChange={v => updateContent(c => ({ ...c, header: { ...c.header, menu: updateItemById(c.header.menu, item.id, { href: v })}}))} />
                    <div className={s.rowActions}>
                       <Switch label="On" checked={item.enabled} onChange={v => updateContent(c => ({ ...c, header: { ...c.header, menu: updateItemById(c.header.menu, item.id, { enabled: v })}}))} />
                       <button className={s.iconBtn} onClick={() => updateContent(c => ({ ...c, header: { ...c.header, menu: removeItemById(c.header.menu, item.id) }}))}>Supprimer</button>
                    </div>
                 </div>
               </div>
             ))}
             <button className={s.addButton} onClick={() => updateContent(c => ({ ...c, header: { ...c.header, menu: [...c.header.menu, { id: makeId("nav"), label: "Nouvel onglet", href: "#", enabled: true }] }}))}>+ Ajouter un lien</button>
           </div>
        </Panel>

        {/* HERO */}
        <Panel title="Section Héro (Entrée)" enabled={content.hero.enabled} onToggle={v => updateContent(c => ({ ...c, hero: { ...c.hero, enabled: v }}))}>
           <div className={`${s.grid} ${s.grid2}`}>
              <Field label="Chiffre Kicker (ex: 1)" value={content.hero.kickerNum} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, kickerNum: v }}))} />
              <TextAreaField label="Libellé Kicker" value={content.hero.kickerText} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, kickerText: v }}))} />
              <div style={{ gridColumn: "1/-1" }}>
                <TextAreaField label="Titre D'accroche H1" value={content.hero.title} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, title: v }}))} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <TextAreaField label="Sous-titre explicatif" value={content.hero.subtitle} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, subtitle: v }}))} />
              </div>
              <Field label="Texte du Bouton" value={content.hero.btnLabel} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, btnLabel: v }}))} />
              <Field label="Lien Cible" value={content.hero.btnHref} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, btnHref: v }}))} />
              <ImageField label="Image Visuel (Femme tenant carte)" value={content.hero.mainImage} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, mainImage: v }}))} onUpload={uploadImage} />
           </div>
        </Panel>

        {/* GRID FEATURES */}
        <Panel title="Grille Bénéfices Rapides" enabled={content.gridFeatures.enabled} onToggle={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, enabled: v }}))}>
           <TextAreaField label="Titre Principal de la Section" value={content.gridFeatures.title} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, title: v }}))} />
           
           <div className={s.stack} style={{marginTop: "24px"}}>
             <span className={s.fieldLabel}>Cartes d'Arguments</span>
             <div className={`${s.grid} ${s.grid2}`}>
               {content.gridFeatures.items.map(feat => (
                 <div key={feat.id} className={s.rowCard}>
                   <div style={{display: "flex", gap: "12px"}}>
                      <select className={s.input} style={{width: "auto"}} value={feat.icon} onChange={e => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: updateItemById(c.gridFeatures.items, feat.id, { icon: e.target.value as any }) }}))}>
                        <option value="check">Coche ✓</option>
                        <option value="globe">Globe 🌍</option>
                        <option value="phone">Téléphone 📱</option>
                        <option value="support">Micro 🎧</option>
                      </select>
                      <div style={{flex: 1}}><input className={s.input} style={{width: "100%"}} value={feat.title} onChange={e => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: updateItemById(c.gridFeatures.items, feat.id, { title: e.target.value }) }}))} /></div>
                   </div>
                   <div className={s.rowActions}>
                      <Switch label="Activé" checked={feat.enabled} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: updateItemById(c.gridFeatures.items, feat.id, { enabled: v }) }}))} />
                      <button className={s.iconBtn} onClick={() => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: removeItemById(c.gridFeatures.items, feat.id) }}))}>Retirer</button>
                   </div>
                 </div>
               ))}
             </div>
             <button className={s.addButton} onClick={() => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: [...c.gridFeatures.items, { id: makeId("f"), title: "Nouvel avantage", icon: "check", enabled: true } ] }}))}>+ Ajouter une tuile d'argument</button>
           </div>
        </Panel>

        {/* SPLIT CARDS */}
        <Panel title="Duo de Cartes Bancaires" enabled={content.splitCards.enabled} onToggle={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, enabled: v }}))}>
           <Field label="Titre du module" value={content.splitCards.title} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, title: v }}))} />
           <div className={`${s.grid} ${s.grid2}`} style={{marginTop: "24px"}}>
              
              {/* Card 1 */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px" }}>
                 <div style={{display: "flex", justifyContent: "space-between", marginBottom: "16px"}}>
                    <strong style={{color: "#1e293b"}}>Emplacement 1</strong>
                    <Switch label="Actif" checked={content.splitCards.cardPhysical.enabled} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardPhysical: { ...c.splitCards.cardPhysical, enabled: v }}}))} />
                 </div>
                 <div className={s.grid} style={{ opacity: content.splitCards.cardPhysical.enabled ? 1 : 0.5 }}>
                    <Field label="Titre de la carte" value={content.splitCards.cardPhysical.title} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardPhysical: { ...c.splitCards.cardPhysical, title: v }}}))} />
                    <TextAreaField label="Paragraphe descriptif" value={content.splitCards.cardPhysical.description} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardPhysical: { ...c.splitCards.cardPhysical, description: v }}}))} />
                    <ImageField label="Visuel Carte" value={content.splitCards.cardPhysical.image} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardPhysical: { ...c.splitCards.cardPhysical, image: v }}}))} onUpload={uploadImage} />
                    <div className={`${s.grid} ${s.grid2}`}>
                      <Field label="Texte Bouton" value={content.splitCards.cardPhysical.btnLabel} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardPhysical: { ...c.splitCards.cardPhysical, btnLabel: v }}}))} />
                      <Field label="Lien" value={content.splitCards.cardPhysical.btnHref} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardPhysical: { ...c.splitCards.cardPhysical, btnHref: v }}}))} />
                    </div>
                 </div>
              </div>

              {/* Card 2 */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px" }}>
                 <div style={{display: "flex", justifyContent: "space-between", marginBottom: "16px"}}>
                    <strong style={{color: "#1e293b"}}>Emplacement 2</strong>
                    <Switch label="Actif" checked={content.splitCards.cardVirtual.enabled} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardVirtual: { ...c.splitCards.cardVirtual, enabled: v }}}))} />
                 </div>
                 <div className={s.grid} style={{ opacity: content.splitCards.cardVirtual.enabled ? 1 : 0.5 }}>
                    <Field label="Titre de la carte" value={content.splitCards.cardVirtual.title} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardVirtual: { ...c.splitCards.cardVirtual, title: v }}}))} />
                    <TextAreaField label="Paragraphe descriptif" value={content.splitCards.cardVirtual.description} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardVirtual: { ...c.splitCards.cardVirtual, description: v }}}))} />
                    <ImageField label="Visuel Carte" value={content.splitCards.cardVirtual.image} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardVirtual: { ...c.splitCards.cardVirtual, image: v }}}))} onUpload={uploadImage} />
                    <div className={`${s.grid} ${s.grid2}`}>
                      <Field label="Texte Bouton" value={content.splitCards.cardVirtual.btnLabel} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardVirtual: { ...c.splitCards.cardVirtual, btnLabel: v }}}))} />
                      <Field label="Lien" value={content.splitCards.cardVirtual.btnHref} onChange={v => updateContent(c => ({ ...c, splitCards: { ...c.splitCards, cardVirtual: { ...c.splitCards.cardVirtual, btnHref: v }}}))} />
                    </div>
                 </div>
              </div>
           </div>
        </Panel>

        {/* SUPER APP */}
        <Panel title="Super App Ecosystem" enabled={content.superApp.enabled} onToggle={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, enabled: v }}))}>
           <div className={`${s.grid} ${s.grid2}`}>
              <Field label="Titre Block" value={content.superApp.title} onChange={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, title: v }}))} />
              <ImageField label="Image Smartphone" value={content.superApp.image} onChange={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, image: v }}))} onUpload={uploadImage} />
           </div>
           <div className={s.stack} style={{marginTop: "24px"}}>
             <span className={s.fieldLabel}>Lignes Points Forts</span>
             {content.superApp.checklist.map(item => (
               <div key={item.id} className={s.rowCard}>
                  <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
                    <span style={{color: "#10b981", fontWeight: "bold"}}>✓</span>
                    <div style={{flex: 1}}><input className={s.input} style={{width: "100%"}} value={item.text} onChange={e => updateContent(c => ({ ...c, superApp: { ...c.superApp, checklist: updateItemById(c.superApp.checklist, item.id, { text: e.target.value }) }}))} /></div>
                    <Switch label="" checked={item.enabled} onChange={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, checklist: updateItemById(c.superApp.checklist, item.id, { enabled: v }) }}))} />
                    <button className={s.iconBtn} onClick={() => updateContent(c => ({ ...c, superApp: { ...c.superApp, checklist: removeItemById(c.superApp.checklist, item.id) }}))}>Suppr.</button>
                  </div>
               </div>
             ))}
             <button className={s.addButton} onClick={() => updateContent(c => ({ ...c, superApp: { ...c.superApp, checklist: [...c.superApp.checklist, { id: makeId("sc"), text: "Nouvelle fonctionnalité", enabled: true }] }}))}>+ Ajouter un argument checklist</button>
           </div>
        </Panel>

        {/* AGENT BANNER */}
        <Panel title="Bannière Point de Retrait" enabled={content.agentBanner.enabled} onToggle={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, enabled: v }}))}>
           <div className={`${s.grid} ${s.grid2}`}>
             <Field label="Titre de la Section" value={content.agentBanner.title} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, title: v }}))} />
             <ImageField label="Photographie Arrière-plan" value={content.agentBanner.backgroundImage} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, backgroundImage: v }}))} onUpload={uploadImage} />
             <Field label="Grand Titre Cartouche" value={content.agentBanner.overlayTitle} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, overlayTitle: v }}))} />
             <TextAreaField label="Description Cartouche" value={content.agentBanner.overlayDesc} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, overlayDesc: v }}))} />
             
             <div style={{gridColumn: "1 / -1", borderTop: "1px solid #f1f5f9", marginTop: "12px", paddingTop: "20px"}}>
                <span className={s.fieldLabel} style={{marginBottom: "12px", display: "block"}}>Chiffres Clés / Tarification</span>
                <div className={`${s.grid} ${s.grid2}`}>
                   <div className={`${s.grid} ${s.grid2}`}>
                     <Field label="Statistique 1" value={content.agentBanner.stat1Num} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, stat1Num: v }}))} />
                     <Field label="Label Stat 1" value={content.agentBanner.stat1Label} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, stat1Label: v }}))} />
                   </div>
                   <div className={`${s.grid} ${s.grid2}`}>
                     <Field label="Statistique 2" value={content.agentBanner.stat2Num} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, stat2Num: v }}))} />
                     <Field label="Label Stat 2" value={content.agentBanner.stat2Label} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, stat2Label: v }}))} />
                   </div>
                </div>
             </div>
           </div>
        </Panel>

        {/* PARTNERS */}
        <Panel title="Nos Partenaires & Catégories" enabled={content.partners?.enabled} onToggle={v => updateContent(c => ({ ...c, partners: { ...c.partners, enabled: v }}))}>
           <div className={`${s.grid} ${s.grid2}`}>
              <Field label="Titre de la Section" value={content.partners?.title || ""} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, title: v }}))} />
           </div>

           {/* Onglets Couleurs */}
           <div style={{ marginTop: "20px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", background: "#f8fafc" }}>
              <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "#475569" }}>Couleurs Personnalisées des Onglets</div>
              <div className={`${s.grid} ${s.grid4}`}>
                 <Field label="Fond (Normal)" type="color" value={content.partners?.tabBgColor || "#f3faf2"} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, tabBgColor: v }}))} />
                 <Field label="Texte (Normal)" type="color" value={content.partners?.tabTextColor || "#123227"} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, tabTextColor: v }}))} />
                 <Field label="Fond (Actif)" type="color" value={content.partners?.tabActiveBgColor || "#50B848"} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, tabActiveBgColor: v }}))} />
                 <Field label="Texte (Actif)" type="color" value={content.partners?.tabActiveTextColor || "#ffffff"} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, tabActiveTextColor: v }}))} />
              </div>
           </div>

           {/* Gestion des Catégories (Onglets) */}
           <div className={s.stack} style={{ marginTop: "32px" }}>
              <span className={s.fieldLabel}>1. Définir les Catégories d'Onglets</span>
              <div className={`${s.grid} ${s.grid2}`}>
                 {(content.partners?.categories || []).map(cat => (
                    <div key={cat.id} className={s.rowCard}>
                       <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <Field label="Nom de l'onglet" value={cat.label} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, categories: updateItemById(c.partners.categories, cat.id, { label: v }) }}))} />
                          <div className={s.rowActions} style={{ marginTop: "8px", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
                             <Switch label="Activé" checked={cat.enabled} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, categories: updateItemById(c.partners.categories, cat.id, { enabled: v }) }}))} />
                             <button className={s.iconBtn} onClick={() => updateContent(c => ({ ...c, partners: { ...c.partners, categories: removeItemById(c.partners.categories, cat.id) }}))}>Retirer</button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              <button className={s.addButton} onClick={() => updateContent(c => ({ ...c, partners: { ...c.partners, categories: [...(c.partners.categories || []), { id: makeId("cat"), label: "Nouvelle catégorie", enabled: true }] }}))}>+ Ajouter une catégorie d'onglet</button>
           </div>

           {/* Gestion des Partenaires */}
           <div className={s.stack} style={{ marginTop: "32px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
              <span className={s.fieldLabel}>2. Liste des Partenaires</span>
              {(content.partners?.items || []).map(item => (
                 <div key={item.id} className={s.rowCard} style={{ background: "#ffffff", border: "1px solid #cbd5e1", padding: "20px", marginBottom: "20px" }}>
                    <div className={`${s.grid} ${s.grid2}`}>
                       <Field label="Nom du partenaire" value={item.name} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, items: updateItemById(c.partners.items, item.id, { name: v }) }}))} />
                       
                       <div className={s.field}>
                          <span className={s.fieldLabel}>Catégorie associée</span>
                          <select 
                            className={s.input} 
                            value={item.categoryId} 
                            onChange={e => updateContent(c => ({ ...c, partners: { ...c.partners, items: updateItemById(c.partners.items, item.id, { categoryId: e.target.value }) }}))}
                          >
                             <option value="">-- Choisir une catégorie --</option>
                             {(content.partners?.categories || []).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                             ))}
                          </select>
                       </div>

                       <div style={{ gridColumn: "1 / -1" }}>
                          <TextAreaField label="Description courte" value={item.description} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, items: updateItemById(c.partners.items, item.id, { description: v }) }}))} />
                       </div>

                       <ImageField label="Logo du partenaire (Requis)" value={item.logo} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, items: updateItemById(c.partners.items, item.id, { logo: v }) }}))} onUpload={uploadImage} />
                       <ImageField label="Photo de couverture (Optionnelle)" value={item.imageUrl || ""} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, items: updateItemById(c.partners.items, item.id, { imageUrl: v }) }}))} onUpload={uploadImage} />
                       
                       <Field label="Lien Vidéo (Optionnel)" value={item.videoUrl || ""} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, items: updateItemById(c.partners.items, item.id, { videoUrl: v }) }}))} />
                       <Field label="Lien Fichier PDF (Optionnel)" value={item.pdfUrl || ""} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, items: updateItemById(c.partners.items, item.id, { pdfUrl: v }) }}))} />
                    </div>

                    <div className={s.rowActions} style={{ marginTop: "16px", borderTop: "1px solid #e2e8f0", paddingTop: "12px", justifyContent: "flex-end" }}>
                       <Switch label="Visible en ligne" checked={item.enabled} onChange={v => updateContent(c => ({ ...c, partners: { ...c.partners, items: updateItemById(c.partners.items, item.id, { enabled: v }) }}))} />
                       <button className={s.iconBtn} style={{ color: "#ef4444" }} onClick={() => updateContent(c => ({ ...c, partners: { ...c.partners, items: removeItemById(c.partners.items, item.id) }}))}>❌ Retirer ce Partenaire</button>
                    </div>
                 </div>
              ))}
              <button className={s.addButton} onClick={() => updateContent(c => ({ ...c, partners: { ...c.partners, items: [...(c.partners.items || []), { id: makeId("part"), name: "Nouveau Partenaire", logo: "", description: "", categoryId: content.partners?.categories[0]?.id || "", enabled: true }] }}))}>+ Ajouter un Partenaire</button>
           </div>
        </Panel>

        {/* FAQ */}
        <Panel title="Foire Aux Questions" enabled={content.faq.enabled} onToggle={v => updateContent(c => ({ ...c, faq: { ...c.faq, enabled: v }}))}>
           <Field label="Titre Section FAQ" value={content.faq.title} onChange={v => updateContent(c => ({ ...c, faq: { ...c.faq, title: v }}))} />
           <div className={s.stack} style={{marginTop: "24px"}}>
             <span className={s.fieldLabel}>Questions & Réponses</span>
             {content.faq.items.map(q => (
               <div key={q.id} className={s.rowCard}>
                 <div className={s.grid} style={{gridTemplateColumns: "1fr auto", alignItems: "end"}}>
                    <Field label="Texte de la question" value={q.question} onChange={v => updateContent(c => ({ ...c, faq: { ...c.faq, items: updateItemById(c.faq.items, q.id, { question: v }) }}))} />
                    <div className={s.rowActions}>
                       <Switch label="On" checked={q.enabled} onChange={v => updateContent(c => ({ ...c, faq: { ...c.faq, items: updateItemById(c.faq.items, q.id, { enabled: v }) }}))} />
                       <button className={s.iconBtn} onClick={() => updateContent(c => ({ ...c, faq: { ...c.faq, items: removeItemById(c.faq.items, q.id) }}))}>X</button>
                    </div>
                 
                  <TextAreaField label="Réponse (S'affiche au clic)" value={q.answer || ""} onChange={v => updateContent(c => ({ ...c, faq: { ...c.faq, items: updateItemById(c.faq.items, q.id, { answer: v }) }}))} />
               </div>
               </div>
             ))}
             <button className={s.addButton} onClick={() => updateContent(c => ({ ...c, faq: { ...c.faq, items: [...c.faq.items, { id: makeId("q"), question: "Question type ?", enabled: true }] }}))}>+ Ajouter une question</button>
           </div>
        </Panel>

        {/* FOOTER CTA */}
        <Panel title="Final Call-to-Action & Réseaux" enabled={content.footerCta.enabled} onToggle={v => updateContent(c => ({ ...c, footerCta: { ...c.footerCta, enabled: v }}))}>
           <div className={`${s.grid} ${s.grid2}`}>
              <Field label="Titre d'appel final" value={content.footerCta.title} onChange={v => updateContent(c => ({ ...c, footerCta: { ...c.footerCta, title: v }}))} />
              <ImageField label="Image Graphique (bas de page)" value={content.footerCta.image} onChange={v => updateContent(c => ({ ...c, footerCta: { ...c.footerCta, image: v }}))} onUpload={uploadImage} />
              <div style={{gridColumn: "1/-1"}}>
                <TextAreaField label="Texte d'accroche" value={content.footerCta.description} onChange={v => updateContent(c => ({ ...c, footerCta: { ...c.footerCta, description: v }}))} />
              </div>
           </div>
           
           <div className={s.stack} style={{marginTop: "24px", borderTop: "1px solid #f1f5f9", paddingTop: "20px"}}>
              <span className={s.fieldLabel}>Liens Réseaux Sociaux</span>
              <div className={`${s.grid} ${s.grid3}`}>
                {content.footerCta.socials.map(item => (
                  <div key={item.id} className={s.rowCard}>
                    <div className={s.grid}>
                      <Field label="Initial (F, X, I)" value={item.label} onChange={v => updateContent(c => ({ ...c, footerCta: { ...c.footerCta, socials: updateItemById(c.footerCta.socials, item.id, { label: v }) }}))} />
                      <Field label="Lien URL" value={item.url} onChange={v => updateContent(c => ({ ...c, footerCta: { ...c.footerCta, socials: updateItemById(c.footerCta.socials, item.id, { url: v }) }}))} />
                    </div>
                    <div className={s.rowActions}>
                       <Switch label="Actif" checked={item.enabled} onChange={v => updateContent(c => ({ ...c, footerCta: { ...c.footerCta, socials: updateItemById(c.footerCta.socials, item.id, { enabled: v }) }}))} />
                       <button className={s.iconBtn} onClick={() => updateContent(c => ({ ...c, footerCta: { ...c.footerCta, socials: removeItemById(c.footerCta.socials, item.id) }}))}>Retirer</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className={s.addButton} onClick={() => updateContent(c => ({ ...c, footerCta: { ...c.footerCta, socials: [...c.footerCta.socials, { id: makeId("so"), label: "X", url: "#", enabled: true }] }}))}>+ Lier un nouveau réseau</button>
           </div>
        </Panel>

      </main>
    </div>
  );
}
