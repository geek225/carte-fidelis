"use client";

import { useState, useTransition, ReactNode, useEffect } from "react";
import type { SiteContent, NavItem, FeatureItem, TabItem, FaqItem, SocialLink, SimpleItem, PartnerCategory, PartnerItem } from "@/lib/site-content-schema";
import s from "./admin-dashboard.module.css";
import type { SubmissionsData } from "@/lib/submissions-store";

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

  const [activeTab, setActiveTab] = useState<"edit" | "messages">("edit");
  const [submissions, setSubmissions] = useState<SubmissionsData>({ contact: [], financing: [] });
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const updateContent = (patch: Partial<SiteContent> | ((curr: SiteContent) => SiteContent)) => {
     if (typeof patch === "function") setContent(patch);
     else setContent(curr => ({ ...curr, ...patch }));
  };

  async function loadSubmissions() {
    setLoadingSubmissions(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  }

  // Load submissions initially if messages tab active
  useEffect(() => {
    if (activeTab === "messages") {
      loadSubmissions();
    }
  }, [activeTab]);

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
      
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Impossible de lire la réponse du serveur.");
      }

      if (!res.ok) {
        let msg = data.error || "Erreur de publication.";
        if (data.details && Array.isArray(data.details)) {
          const detailMsgs = data.details.map((d: any) => `${d.path}: ${d.message}`).join(", ");
          msg += ` (${detailMsgs})`;
        }
        throw new Error(msg);
      }

      setStatus({ tone: "success", message: data.mode === "supabase" ? "🚀 Publié avec succès sur le Cloud !" : "💾 Publié localement avec succès !" });
    } catch (err: any) {
      setStatus({ tone: "error", message: err.message || "Erreur de connexion avec le serveur." });
    }
  }

  return (
    <div className={s.layout}>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div className={s.sidebarBackdrop} onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* STICKY SIDEBAR */}
      <aside className={`${s.sidebar} ${isSidebarOpen ? s.sidebarOpen : ""}`}>
        <div className={s.brandHeader}>
          {/* Close Sidebar Button for Mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className={s.closeSidebarBtn} 
            aria-label="Fermer le menu"
          >
            ✕
          </button>
          <div className={s.kicker}>Studio CMS</div>
          <h1>{content.site.brandName}</h1>
          <p className={s.sidebarDesc}>
            Bienvenue dans votre studio de gestion. Pilotez votre identité en direct.
          </p>
        </div>

        {/* Dynamic Navigation Tabs inside Sidebar */}
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid rgba(15,23,42,0.08)", paddingBottom: "24px" }}>
          <button 
            onClick={() => {
              setActiveTab("edit");
              setIsSidebarOpen(false);
            }} 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "edit" ? "rgba(0, 168, 107, 0.1)" : "transparent",
              color: activeTab === "edit" ? "#00A86B" : "#475569",
              fontWeight: "600",
              textAlign: "left",
              cursor: "pointer",
              width: "100%",
              fontSize: "14px",
              transition: "all 0.2s"
            }}
          >
            🎨 Contenu du Site
          </button>
          <button 
            onClick={() => {
              setActiveTab("messages");
              setIsSidebarOpen(false);
            }} 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "messages" ? "rgba(0, 168, 107, 0.1)" : "transparent",
              color: activeTab === "messages" ? "#00A86B" : "#475569",
              fontWeight: "600",
              textAlign: "left",
              cursor: "pointer",
              width: "100%",
              fontSize: "14px",
              transition: "all 0.2s"
            }}
          >
            📬 Formulaires Reçus ({submissions.contact.length + submissions.financing.length})
          </button>
        </div>
        
        <div className={s.sidebarActions} style={{ marginTop: "24px" }}>
          <button className={s.publishBtn} disabled={isPending} onClick={() => startTransition(save)}>
            {isPending ? "⏳ Patientez..." : "🚀 Publier les modifications"}
          </button>
          <a className={s.visitBtn} href="/" target="_blank" rel="noreferrer">👁 Voir le site live</a>
          <button 
            onClick={async () => {
              if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
                const res = await fetch("/api/admin/logout", { method: "POST" });
                if (res.ok) {
                  window.location.href = "/admin/login";
                }
              }
            }}
            className={s.visitBtn}
            style={{ 
              marginTop: "8px", 
              width: "100%", 
              background: "rgba(239, 68, 68, 0.08)", 
              color: "#ef4444", 
              border: "1px dashed rgba(239, 68, 68, 0.3)",
              fontWeight: "600",
              fontSize: "13.5px"
            }}
          >
            🚪 Se déconnecter
          </button>
          <div className={`${s.statusBadge} ${s['statusBadge_'+status.tone]}`} style={{ marginTop: "12px" }}>
            {status.message}
          </div>
        </div>
      </aside>

      {/* MAIN SCROLLABLE STREAM */}
      <main className={s.main}>
        {/* MOBILE HEADER FOR SIDEBAR TOGGLE */}
        <div className={s.mobileHeader}>
          <button onClick={() => setIsSidebarOpen(true)} className={s.hamburgerBtn} aria-label="Ouvrir le menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className={s.mobileBrandName}>{content.site.brandName}</span>
        </div>
        {activeTab === "edit" ? (
          <>
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
                  <Field label="E-mail de Réception des Formulaires (ex: llateamd@gmail.com)" value={content.site.adminEmail || ""} onChange={v => updateContent(c => ({ ...c, site: { ...c.site, adminEmail: v }}))} />
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
                  <Field label="Texte du Bouton Principal" value={content.hero.btnLabel} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, btnLabel: v }}))} />
                  <Field label="Lien Principal" value={content.hero.btnHref} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, btnHref: v }}))} />
                  <Field label="Texte du Bouton Secondaire" value={content.hero.secondaryBtnLabel || ""} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, secondaryBtnLabel: v }}))} />
                  <Field label="Lien Secondaire" value={content.hero.secondaryBtnHref || ""} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, secondaryBtnHref: v }}))} />
                  <ImageField label="Image Visuel (Femme tenant carte)" value={content.hero.mainImage} onChange={v => updateContent(c => ({ ...c, hero: { ...c.hero, mainImage: v }}))} onUpload={uploadImage} />
               </div>
            </Panel>

            {/* BENTO GRID */}
            <Panel 
              title="Grille Bento (Statistiques d'Accueil)" 
              enabled={content.heroBento?.enabled !== false} 
              onToggle={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {
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
              }), enabled: v }}))}
            >
              <div className={`${s.grid} ${s.grid2}`}>
                <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginBottom: "8px", fontWeight: "700", color: "#00A86B" }}>
                  Carte 1 : Partenaires Affiliés
                </div>
                <Field label="Chiffre / Valeur" value={content.heroBento?.card1Val || "50+"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card1Val: v } as any }))} />
                <Field label="Libellé (Saut de ligne avec \n)" value={content.heroBento?.card1Label || ""} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card1Label: v } as any }))} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Marques de la ligne défilante (Séparées par des virgules)" value={content.heroBento?.card1Brands || ""} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card1Brands: v } as any }))} />
                </div>

                <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginTop: "12px", marginBottom: "8px", fontWeight: "700", color: "#00A86B" }}>
                  Carte 2 : Simulation Carte de Crédit
                </div>
                <Field label="Libellé du solde" value={content.heroBento?.card2Label || "Points Cumulés"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card2Label: v } as any }))} />
                <Field label="Solde / Points" value={content.heroBento?.card2Val || "12 450 PTS"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card2Val: v } as any }))} />
                <Field label="Numéro de Carte fictif" value={content.heroBento?.card2Number || "4321 8654 **** 6547"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card2Number: v } as any }))} />
                <Field label="Date d'expiration" value={content.heroBento?.card2Expiry || "08/28"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card2Expiry: v } as any }))} />

                <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginTop: "12px", marginBottom: "8px", fontWeight: "700", color: "#00A86B" }}>
                  Carte 3 : Image Portrait
                </div>
                <ImageField label="Photo du client souriant" value={content.heroBento?.card3Image || "/assets/yellow-hoodie-man.png"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card3Image: v } as any }))} onUpload={uploadImage} />

                <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginTop: "12px", marginBottom: "8px", fontWeight: "700", color: "#00A86B" }}>
                  Carte 4 : Évolution des Gains
                </div>
                <Field label="Badge Tendance (ex: ▲ 24%)" value={content.heroBento?.card4Trend || "▲ 24%"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card4Trend: v } as any }))} />
                <Field label="Libellé gains" value={content.heroBento?.card4Label || "Points Gagnés"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card4Label: v } as any }))} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Valeur gains" value={content.heroBento?.card4Val || "3 420 pts"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card4Val: v } as any }))} />
                </div>

                <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginTop: "12px", marginBottom: "8px", fontWeight: "700", color: "#00A86B" }}>
                  Carte 5 : Compteur Membres
                </div>
                <Field label="Nombre membres (ex: 2M+)" value={content.heroBento?.card5Val || "2M+"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card5Val: v } as any }))} />
                <Field label="Libellé membres" value={content.heroBento?.card5Label || "Membres Actifs \n Globalement"} onChange={v => updateContent(c => ({ ...c, heroBento: { ...(c.heroBento || {}), card5Label: v } as any }))} />
              </div>
            </Panel>

            {/* 3D BRAND SHOWCASE */}
            <Panel 
              title="Votre Univers Fidelis (Showcase Cartes)" 
              enabled={content.splitCards?.enabled !== false} 
              onToggle={v => updateContent(c => ({ ...c, splitCards: { ...(c.splitCards || {
                enabled: true,
                title: "Votre Univers Fidelis",
                cardPhysical: {
                  enabled: true,
                  title: "Identité de Marque Fidelis",
                  description: "Un design épuré, aux finitions or et émeraude...",
                  image: "/carte-fidelis.jpeg",
                  btnLabel: "Obtenir un financement",
                  btnHref: "#"
                },
                cardVirtual: {
                  enabled: true,
                  title: "Écosystème Numérique Interactif",
                  description: "Faites tourner et pivoter notre logo 3D orbital...",
                  image: "",
                  btnLabel: "En savoir plus",
                  btnHref: "#"
                }
              }), enabled: v }}))}
            >
              <div className={`${s.grid} ${s.grid2}`}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Titre Section Général" value={content.splitCards?.title || "Votre Univers Fidelis"} onChange={v => updateContent(c => ({ ...c, splitCards: { ...(c.splitCards || {}), title: v } as any }))} />
                </div>

                <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginTop: "12px", marginBottom: "8px", fontWeight: "700", color: "#00A86B" }}>
                  Carte Gauche : Identité Physique
                </div>
                <div style={{paddingBottom: "10px", gridColumn: "1 / -1"}}>
                  <Switch label="Afficher la Carte Physique" checked={content.splitCards?.cardPhysical?.enabled !== false} onChange={v => updateContent(c => ({ ...c, splitCards: { ...(c.splitCards || {}), cardPhysical: { ...(c.splitCards?.cardPhysical || { enabled: true, title: "Identité de Marque Fidelis", description: "Un design épuré, aux finitions or et émeraude...", image: "/carte-fidelis.jpeg", btnLabel: "Obtenir un financement", btnHref: "#" }), enabled: v } } as any }))} />
                </div>
                <Field label="Titre de la carte" value={content.splitCards?.cardPhysical?.title || ""} onChange={v => updateContent(c => ({ ...c, splitCards: { ...(c.splitCards || {}), cardPhysical: { ...(c.splitCards?.cardPhysical || {}), title: v } } as any }))} />
                <ImageField label="Image de la Carte Physique" value={content.splitCards?.cardPhysical?.image || ""} onChange={v => updateContent(c => ({ ...c, splitCards: { ...(c.splitCards || {}), cardPhysical: { ...(c.splitCards?.cardPhysical || {}), image: v } } as any }))} onUpload={uploadImage} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <TextAreaField label="Description explicative" value={content.splitCards?.cardPhysical?.description || ""} onChange={v => updateContent(c => ({ ...c, splitCards: { ...(c.splitCards || {}), cardPhysical: { ...(c.splitCards?.cardPhysical || {}), description: v } } as any }))} />
                </div>

                <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", marginTop: "12px", marginBottom: "8px", fontWeight: "700", color: "#00A86B" }}>
                  Carte Droite : Logo 3D Interactif
                </div>
                <div style={{paddingBottom: "10px", gridColumn: "1 / -1"}}>
                  <Switch label="Afficher la Carte Virtuelle (3D)" checked={content.splitCards?.cardVirtual?.enabled !== false} onChange={v => updateContent(c => ({ ...c, splitCards: { ...(c.splitCards || {}), cardVirtual: { ...(c.splitCards?.cardVirtual || { enabled: true, title: "Écosystème Numérique Interactif", description: "Faites tourner et pivoter notre logo 3D orbital...", image: "", btnLabel: "En savoir plus", btnHref: "#" }), enabled: v } } as any }))} />
                </div>
                <Field label="Titre de la carte 3D" value={content.splitCards?.cardVirtual?.title || ""} onChange={v => updateContent(c => ({ ...c, splitCards: { ...(c.splitCards || {}), cardVirtual: { ...(c.splitCards?.cardVirtual || {}), title: v } } as any }))} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <TextAreaField label="Description explicative 3D" value={content.splitCards?.cardVirtual?.description || ""} onChange={v => updateContent(c => ({ ...c, splitCards: { ...(c.splitCards || {}), cardVirtual: { ...(c.splitCards?.cardVirtual || {}), description: v } } as any }))} />
                </div>
              </div>
            </Panel>

            {/* FORMATIONS DIGITALES FIDELIS */}
            <Panel title="Formations Digitales Fidelis" enabled={content.gridFeatures.enabled} onToggle={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, enabled: v }}))}>
               <div className={`${s.grid} ${s.grid2}`}>
                 <Field label="Titre Principal" value={content.gridFeatures.title} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, title: v }}))} />
                 <Field label="Sous-titre" value={content.gridFeatures.subtitle || ""} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, subtitle: v }}))} />
                 <Field label="Lien d'Action Bannière" value={content.gridFeatures.bannerBtnHref || ""} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, bannerBtnHref: v }}))} />
                 <Field label="Texte d'Action Bannière" value={content.gridFeatures.bannerBtnLabel || ""} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, bannerBtnLabel: v }}))} />
                 <div style={{gridColumn: "1/-1"}}>
                   <TextAreaField label="Texte Central Bannière" value={content.gridFeatures.bannerText || ""} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, bannerText: v }}))} />
                 </div>
               </div>
               
               <div className={s.stack} style={{marginTop: "24px", borderTop: "1px dashed #cbd5e1", paddingTop: "20px"}}>
                 <span className={s.fieldLabel}>Cartes de Formations / Offres</span>
                 <div className={`${s.grid} ${s.grid2}`}>
                   {content.gridFeatures.items.map(item => (
                     <div key={item.id} className={s.rowCard}>
                       <div className={s.grid}>
                         <Field label="Titre" value={item.title} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: updateItemById(c.gridFeatures.items, item.id, { title: v }) }}))} />
                         <Field label="Badge / Prix" value={item.badge || ""} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: updateItemById(c.gridFeatures.items, item.id, { badge: v }) }}))} />
                         <ImageField label="Image de couverture" value={item.imageUrl || ""} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: updateItemById(c.gridFeatures.items, item.id, { imageUrl: v }) }}))} onUpload={uploadImage} />
                       </div>
                       <div style={{marginTop: "8px"}}>
                         <TextAreaField label="Description détaillée" value={item.description || ""} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: updateItemById(c.gridFeatures.items, item.id, { description: v }) }}))} />
                       </div>
                       <div className={s.rowActions} style={{marginTop: "8px"}}>
                          <Switch label="Active" checked={item.enabled} onChange={v => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: updateItemById(c.gridFeatures.items, item.id, { enabled: v }) }}))} />
                          <button className={s.iconBtn} style={{color: "#ef4444"}} onClick={() => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: removeItemById(c.gridFeatures.items, item.id) }}))}>Retirer offre</button>
                       </div>
                     </div>
                   ))}
                 </div>
                 <button className={s.addButton} onClick={() => updateContent(c => ({ ...c, gridFeatures: { ...c.gridFeatures, items: [...c.gridFeatures.items, { id: makeId("fe"), title: "Nouvelle formation", badge: "20.000 pts", imageUrl: "/assets/partner-card.png", description: "Description", enabled: true }] }}))}>+ Ajouter une formation</button>
               </div>
            </Panel>

            {/* SUPER APP CHECKLIST */}
            <Panel title="Super App Fidelis (Liste)" enabled={content.superApp.enabled} onToggle={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, enabled: v }}))}>
               <div className={`${s.grid} ${s.grid2}`}>
                 <Field label="Titre Principal" value={content.superApp.title} onChange={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, title: v }}))} />
                 <ImageField label="Image Mockup Téléphone" value={content.superApp.image} onChange={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, image: v }}))} onUpload={uploadImage} />
                 <Field label="Texte du Bouton CTA" value={content.superApp.btnLabel} onChange={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, btnLabel: v }}))} />
                 <Field label="Cible / Lien" value={content.superApp.btnHref} onChange={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, btnHref: v }}))} />
               </div>
               
               <div className={s.stack} style={{marginTop: "24px", borderTop: "1px dashed #cbd5e1", paddingTop: "20px"}}>
                 <span className={s.fieldLabel}>Avantages / Puces de la Liste</span>
                 {content.superApp.checklist.map(item => (
                   <div key={item.id} className={s.rowCard}>
                     <div className={s.grid} style={{gridTemplateColumns: "1fr auto", alignItems: "end"}}>
                        <Field label="Libellé de l'avantage" value={item.text} onChange={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, checklist: updateItemById(c.superApp.checklist, item.id, { text: v }) }}))} />
                        <div className={s.rowActions}>
                           <Switch label="Active" checked={item.enabled} onChange={v => updateContent(c => ({ ...c, superApp: { ...c.superApp, checklist: updateItemById(c.superApp.checklist, item.id, { enabled: v }) }}))} />
                           <button className={s.iconBtn} onClick={() => updateContent(c => ({ ...c, superApp: { ...c.superApp, checklist: removeItemById(c.superApp.checklist, item.id) }}))}>Retirer</button>
                        </div>
                     </div>
                   </div>
                 ))}
                 <button className={s.addButton} onClick={() => updateContent(c => ({ ...c, superApp: { ...c.superApp, checklist: [...c.superApp.checklist, { id: makeId("ch"), text: "Nouvel avantage", enabled: true }] }}))}>+ Ajouter une puce d'avantage</button>
               </div>
            </Panel>

            {/* AGENT BANNER */}
            <Panel title="Bannière d'Accompagnement Commercial" enabled={content.agentBanner.enabled} onToggle={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, enabled: v }}))}>
               <div className={`${s.grid} ${s.grid2}`}>
                  <Field label="Titre Principal" value={content.agentBanner.title} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, title: v }}))} />
                  <ImageField label="Image de fond (Visuel Agent)" value={content.agentBanner.backgroundImage} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, backgroundImage: v }}))} onUpload={uploadImage} />
                  <div style={{gridColumn: "1/-1"}}>
                    <Field label="Titre d'Accroche Overlay" value={content.agentBanner.overlayTitle} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, overlayTitle: v }}))} />
                  </div>
                  <div style={{gridColumn: "1/-1"}}>
                    <TextAreaField label="Description Overlay" value={content.agentBanner.overlayDesc} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, overlayDesc: v }}))} />
                  </div>
                  <div style={{gridColumn: "1/-1", borderTop: "1px dashed #cbd5e1", paddingTop: "15px", marginTop: "10px"}}>
                    <span className={s.fieldLabel}>Statistiques de Confiance (Cercle Gauche et Droit)</span>
                    <div className={`${s.grid} ${s.grid2}`}>
                      <Field label="Valeur Stat 1" value={content.agentBanner.stat1Num} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, stat1Num: v }}))} />
                      <Field label="Label Stat 1" value={content.agentBanner.stat1Label} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, stat1Label: v }}))} />
                      <Field label="Valeur Stat 2" value={content.agentBanner.stat2Num} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, stat2Num: v }}))} />
                      <Field label="Label Stat 2" value={content.agentBanner.stat2Label} onChange={v => updateContent(c => ({ ...c, agentBanner: { ...c.agentBanner, stat2Label: v }}))} />
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

            {/* FINANCING MODAL SETTINGS */}
            <Panel title="Système d'Accompagnement Financier" description="Personnalisez le disclaimer, les montants et les messages de confirmation du formulaire de financement.">
              <div className={`${s.grid} ${s.grid2}`}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <TextAreaField label="Clause d'Avertissement (Disclaimer d'ancienneté)" value={content.financing.disclaimer} onChange={v => updateContent(c => ({ ...c, financing: { ...c.financing, disclaimer: v }}))} />
                </div>
                <Field label="Montant Avec Local" value={content.financing.amountWithLocal} onChange={v => updateContent(c => ({ ...c, financing: { ...c.financing, amountWithLocal: v }}))} />
                <Field label="Montant Sans Local" value={content.financing.amountWithoutLocal} onChange={v => updateContent(c => ({ ...c, financing: { ...c.financing, amountWithoutLocal: v }}))} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Message sur le Bouton Conditionnel (Avec Local)" value={content.financing.labelWithLocal} onChange={v => updateContent(c => ({ ...c, financing: { ...c.financing, labelWithLocal: v }}))} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Message sur le Bouton Conditionnel (Sans Local)" value={content.financing.labelWithoutLocal} onChange={v => updateContent(c => ({ ...c, financing: { ...c.financing, labelWithoutLocal: v }}))} />
                </div>
                <Field label="Texte du Bouton de Validation" value={content.financing.submitLabel} onChange={v => updateContent(c => ({ ...c, financing: { ...c.financing, submitLabel: v }}))} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <TextAreaField label="Message de Succès (Après validation)" value={content.financing.successMessage} onChange={v => updateContent(c => ({ ...c, financing: { ...c.financing, successMessage: v }}))} />
                </div>
              </div>
            </Panel>

            {/* SOCIAL PROOF & RATING SETTINGS */}
            <Panel title="Preuve Sociale & Avis Clients" enabled={content.rating.enabled} onToggle={v => updateContent(c => ({ ...c, rating: { ...c.rating, enabled: v }}))} description="Gérez le badge rond jaune affiché sous le Hero avec les profils d'adhérents privilèges.">
              <div className={`${s.grid} ${s.grid2}`}>
                <Field label="Texte Global d'Accompagnement" value={content.rating.text} onChange={v => updateContent(c => ({ ...c, rating: { ...c.rating, text: v }}))} />
                <Field label="Label du Badge de Reste (ex: +15k)" value={content.rating.moreLabel} onChange={v => updateContent(c => ({ ...c, rating: { ...c.rating, moreLabel: v }}))} />
                <div className={s.field}>
                  <span className={s.fieldLabel}>Nombre d'Étoiles (1 à 5)</span>
                  <input type="number" min="1" max="5" className={s.input} value={content.rating.score} onChange={e => updateContent(c => ({ ...c, rating: { ...c.rating, score: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)) }}))} />
                </div>
              </div>
              
              <div className={s.stack} style={{marginTop: "24px", borderTop: "1px dashed #cbd5e1", paddingTop: "20px"}}>
                <span className={s.fieldLabel}>Profils des Adhérents Privilèges</span>
                <div className={`${s.grid} ${s.grid2}`}>
                  {content.rating.avatars.map(avatar => (
                    <div key={avatar.id} className={s.rowCard}>
                      <div className={s.grid}>
                        <Field label="Nom Complet" value={avatar.name} onChange={v => updateContent(c => ({ ...c, rating: { ...c.rating, avatars: updateItemById(c.rating.avatars, avatar.id, { name: v }) }}))} />
                        <Field label="Points Cumulés" value={avatar.points} onChange={v => updateContent(c => ({ ...c, rating: { ...c.rating, avatars: updateItemById(c.rating.avatars, avatar.id, { points: v }) }}))} />
                        <ImageField label="Image de Profil (Avatar)" value={avatar.img} onChange={v => updateContent(c => ({ ...c, rating: { ...c.rating, avatars: updateItemById(c.rating.avatars, avatar.id, { img: v }) }}))} onUpload={uploadImage} />
                      </div>
                      <div className={s.rowActions} style={{marginTop: "8px"}}>
                        <button className={s.iconBtn} style={{color: "#ef4444"}} onClick={() => updateContent(c => ({ ...c, rating: { ...c.rating, avatars: removeItemById(c.rating.avatars, avatar.id) }}))}>Retirer Profil</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className={s.addButton} onClick={() => updateContent(c => ({ ...c, rating: { ...c.rating, avatars: [...c.rating.avatars, { id: makeId("av"), name: "Nouveau Membre", points: "0 pts", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80" }] }}))}>+ Ajouter un Profil Adhérent</button>
              </div>
            </Panel>
          </>
        ) : (
          /* MESSAGES TAB CONTENT */
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--dark)" }}>📬 Messages & Demandes Reçus</h2>
                <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>Visualisez en direct toutes les soumissions de contact et de financement.</p>
              </div>
              <button 
                onClick={loadSubmissions}
                disabled={loadingSubmissions}
                className={s.visitBtn}
                style={{ background: "#ffffff", padding: "10px 18px", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13.5px" }}
              >
                {loadingSubmissions ? "🔄 Actualisation..." : "🔄 Actualiser"}
              </button>
            </div>

            {/* DEMANDES DE FINANCEMENT */}
            <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
                <h4 style={{ fontSize: "16.5px", fontWeight: "700", color: "#00A86B", margin: 0 }}>💰 Demandes d'Accompagnement Financier ({submissions.financing.length})</h4>
              </div>
              
              {submissions.financing.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "14px", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>Aucune demande d'accompagnement pour le moment.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {submissions.financing.map(sub => (
                    <div key={sub.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--dark)" }}>{sub.prenom} {sub.nom}</span>
                          <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "10px" }}>{new Date(sub.createdAt).toLocaleString("fr-FR")}</span>
                        </div>
                        <div style={{ background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "700" }}>
                          💵 {sub.amount}
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "14px", fontSize: "13.5px", color: "var(--dark-light)", borderTop: "1px dashed #e2e8f0", paddingTop: "12px" }}>
                        <div>📅 <strong>Naissance :</strong> {sub.dateNaissance}</div>
                        <div>💑 <strong>Statut :</strong> {sub.situationMatrimoniale}</div>
                        <div>📞 <strong>Téléphone :</strong> <a href={`tel:${sub.phone}`} style={{color: "#00A86B", fontWeight: "600"}}>{sub.phone}</a></div>
                        <div>📍 <strong>Adresse :</strong> {sub.ville}, {sub.quartier}</div>
                        <div style={{ gridColumn: "1 / -1" }}>🏪 <strong>Statut Local :</strong> {sub.hasLocal ? "✅ Dispose d'un local commercial" : "❌ Ne dispose pas de local commercial"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MESSAGES DE CONTACT */}
            <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
                <h4 style={{ fontSize: "16.5px", fontWeight: "700", color: "#4f46e5", margin: 0 }}>✉ Messages de Contact ({submissions.contact.length})</h4>
              </div>
              
              {submissions.contact.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "14px", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>Aucun message de contact pour le moment.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {submissions.contact.map(sub => (
                    <div key={sub.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <strong style={{ fontSize: "14.5px", color: "var(--dark)" }}>{sub.name}</strong>
                          <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "10px" }}>
                            (<a href={`mailto:${sub.email}`} style={{ color: "#00A86B" }}>{sub.email}</a>)
                          </span>
                        </div>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>{new Date(sub.createdAt).toLocaleString("fr-FR")}</span>
                      </div>
                      <div style={{ marginTop: "10px", fontSize: "13.5px", color: "var(--dark)", borderTop: "1px dashed #e2e8f0", paddingTop: "10px" }}>
                        <div style={{ fontWeight: "700", marginBottom: "6px", color: "#475569" }}>Sujet : {sub.subject}</div>
                        <div style={{ background: "#ffffff", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0", whiteSpace: "pre-wrap", color: "var(--dark-light)", lineHeight: "1.5" }}>
                          {sub.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
