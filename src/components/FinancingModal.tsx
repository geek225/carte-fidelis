"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./modern-landing.module.css";

interface FinancingModalProps {
  isOpen: boolean;
  onClose: () => void;
  financingConfig?: {
    disclaimer: string;
    amountWithLocal: string;
    amountWithoutLocal: string;
    successMessage: string;
    submitLabel: string;
    labelWithLocal: string;
    labelWithoutLocal: string;
  };
}

const COUNTRY_CODES = [
  { code: "+225", country: "Côte d'Ivoire 🇨🇮" },
  { code: "+221", country: "Sénégal 🇸🇳" },
  { code: "+226", country: "Burkina Faso 🇧🇫" },
  { code: "+228", country: "Togo 🇹🇬" },
  { code: "+229", country: "Bénin 🇧🇯" },
  { code: "+223", country: "Mali 🇲🇱" },
  { code: "+237", country: "Cameroun 🇨🇲" },
  { code: "+33", country: "France 🇫🇷" }
];

export function FinancingModal({ isOpen, onClose, financingConfig }: FinancingModalProps) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    ville: "",
    quartier: "",
    situationMatrimoniale: "Célibataire",
    countryCode: "+225",
    phone: "",
    hasLocal: null as boolean | null // null = none checked, true = has local, false = has no local
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "phone") {
      setPhoneError("");
    }
  };

  const handleCheckboxChange = (hasLocal: boolean) => {
    setFormData(prev => ({ ...prev, hasLocal }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple international phone validation
    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError("Numéro de téléphone invalide (entrez entre 8 et 15 chiffres sans espace).");
      return;
    }

    if (formData.hasLocal === null) {
      alert("Veuillez sélectionner si vous disposez d'un local ou non.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fullPhone = `${formData.countryCode} ${formData.phone}`;
      const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        dateNaissance: formData.dateNaissance,
        ville: formData.ville,
        quartier: formData.quartier,
        situationMatrimoniale: formData.situationMatrimoniale,
        phone: fullPhone,
        hasLocal: formData.hasLocal,
      };

      const res = await fetch("/api/submissions/financing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue lors de l'envoi.");
      }
    } catch {
      setError("Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nom: "",
      prenom: "",
      dateNaissance: "",
      ville: "",
      quartier: "",
      situationMatrimoniale: "Célibataire",
      countryCode: "+225",
      phone: "",
      hasLocal: null
    });
    setIsSubmitted(false);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalOverlay}>
          {/* Backdrop Blur overlay */}
          <motion.div 
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
          />

          {/* Modal Container */}
          <motion.div 
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Close Button */}
            <button className={styles.modalCloseBtn} onClick={handleReset} aria-label="Fermer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {!isSubmitted ? (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.modalTitleBadge}>Financement</div>
                  <h2>Demande d'Accompagnement</h2>
                </div>

                {/* Disclaimer Alert Box */}
                <div className={styles.modalDisclaimer}>
                  <div className={styles.disclaimerIcon}>⚠️</div>
                  <div className={styles.disclaimerText}>
                    <strong>Important :</strong> {financingConfig?.disclaimer || "Pour pouvoir bénéficier d'un accompagnement financier il faudrait être souscripteur de la carte depuis plus de 3 mois."}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                  {error && (
                    <div style={{
                      padding: "12px 16px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "8px",
                      color: "#dc2626",
                      fontSize: "13px",
                      textAlign: "center",
                      gridColumn: "span 2",
                      marginBottom: "10px"
                    }}>
                      ⚠️ {error}
                    </div>
                  )}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="nom">Nom *</label>
                      <input 
                        type="text" 
                        id="nom" 
                        name="nom" 
                        required 
                        placeholder="Votre nom" 
                        value={formData.nom}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="prenom">Prénom(s) *</label>
                      <input 
                        type="text" 
                        id="prenom" 
                        name="prenom" 
                        required 
                        placeholder="Votre prénom" 
                        value={formData.prenom}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="dateNaissance">Date de naissance *</label>
                      <input 
                        type="date" 
                        id="dateNaissance" 
                        name="dateNaissance" 
                        required 
                        value={formData.dateNaissance}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="situationMatrimoniale">Situation matrimoniale *</label>
                      <select 
                        id="situationMatrimoniale" 
                        name="situationMatrimoniale" 
                        value={formData.situationMatrimoniale}
                        onChange={handleInputChange}
                      >
                        <option value="Célibataire">Célibataire</option>
                        <option value="Marié(e)">Marié(e)</option>
                        <option value="Divorcé(e)">Divorcé(e)</option>
                        <option value="Veuf/Veuve">Veuf/Veuve</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="ville">Ville *</label>
                      <input 
                        type="text" 
                        id="ville" 
                        name="ville" 
                        required 
                        placeholder="Ex: Abidjan" 
                        value={formData.ville}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="quartier">Quartier *</label>
                      <input 
                        type="text" 
                        id="quartier" 
                        name="quartier" 
                        required 
                        placeholder="Ex: Cocody" 
                        value={formData.quartier}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Phone Input with Dynamic Code Selection */}
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Numéro de téléphone (Norme internationale) *</label>
                    <div className={styles.phoneInputGroup}>
                      <select 
                        name="countryCode" 
                        value={formData.countryCode} 
                        onChange={handleInputChange}
                        className={styles.countrySelect}
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>{c.code} ({c.country.split(" ")[0]})</option>
                        ))}
                      </select>
                      <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        required 
                        placeholder="07080910" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={styles.phoneField}
                      />
                    </div>
                    {phoneError && <span className={styles.formError}>{phoneError}</span>}
                  </div>

                  {/* Two Exclusives Checkboxes */}
                  <div className={styles.checkboxSection}>
                    <label className={styles.checkboxLabelTitle}>Statut de votre local commercial *</label>
                    <div className={styles.checkboxGroup}>
                      <div 
                        className={`${styles.checkboxCard} ${formData.hasLocal === true ? styles.active : ""}`}
                        onClick={() => handleCheckboxChange(true)}
                      >
                        <div className={styles.checkboxCircle}>
                          {formData.hasLocal === true && <div className={styles.checkboxInnerDot} />}
                        </div>
                        <span className={styles.checkboxText}>J'ai un local</span>
                      </div>

                      <div 
                        className={`${styles.checkboxCard} ${formData.hasLocal === false ? styles.active : ""}`}
                        onClick={() => handleCheckboxChange(false)}
                      >
                        <div className={styles.checkboxCircle}>
                          {formData.hasLocal === false && <div className={styles.checkboxInnerDot} />}
                        </div>
                        <span className={styles.checkboxText}>Je n'ai pas de local</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Info Button Overlay (Slide Down) */}
                  <AnimatePresence>
                    {formData.hasLocal !== null && (
                      <motion.div 
                        className={styles.financingPill}
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={styles.pillContent}>
                          <span className={styles.pillIcon}>✨</span>
                          <span>
                            {formData.hasLocal ? (
                              financingConfig?.labelWithLocal || "Vous bénéficierez d'un accompagnement financier de 300.000 FCFA"
                            ) : (
                              financingConfig?.labelWithoutLocal || "Vous bénéficierez d'un accompagnement financier de 200.000 FCFA"
                            )}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`btn btn-primary ${styles.modalSubmitBtn}`}
                    style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
                  >
                    {loading ? "Traitement en cours..." : (financingConfig?.submitLabel || "Valider ma demande")}
                  </button>
                </form>
              </>
            ) : (
              /* Success Screen */
              <motion.div 
                className={styles.successScreen}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className={styles.successIconWrapper}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.successCheck}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2>Demande Reçue !</h2>
                <p className={styles.successText}>
                  {financingConfig?.successMessage || "Le formulaire a été envoyé et sera étudié par le service financier qui vous contactera dans les plus brefs délais."}
                </p>
                <button className={`btn btn-primary ${styles.successCloseBtn}`} onClick={handleReset}>
                  Retour à l'accueil
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
