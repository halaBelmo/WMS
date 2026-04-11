import { useState } from "react";
import Logo from "../components/Logo";
import FormField from "../components/FormField";
import Button from "../components/Button";
import styles from "./SignupPage.module.css";

export default function SignupPage({ onGoToLogin }) {
  const [owner, setOwner] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [company, setCompany] = useState({ name: "", address: "", city: "", country: "" });
  const [loading, setLoading] = useState(false);

  const handleOwner = (field) => (e) =>
    setOwner((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCompany = (field) => (e) =>
    setCompany((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Logo />
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Compte administrateur
          </div>
          <h1 className={styles.title}>Créer votre entreprise</h1>
          <p className={styles.subtitle}>
            Configurez votre espace WMS et invitez votre équipe de travail.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* ── Section propriétaire ── */}
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            Informations du propriétaire
          </div>

          <div className={styles.grid3}>
            <FormField label="Prénom" placeholder="Jiara" value={owner.firstName} onChange={handleOwner("firstName")} required />
            <FormField label="Nom" placeholder="Martins" value={owner.lastName} onChange={handleOwner("lastName")} required />
            <FormField
              label="Email" type="email" placeholder="hello@votresite.com"
              value={owner.email} onChange={handleOwner("email")} required
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
            />
          </div>

          <div className={styles.grid2half}>
            <FormField
              label="Mot de passe" type="password" placeholder="••••••••"
              value={owner.password} onChange={handleOwner("password")} required
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            />
          </div>

          {/* ── Section entreprise ── */}
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            Informations de l'entreprise
          </div>

          <div className={styles.grid3}>
            <FormField label="Nom de l'entreprise" placeholder="Entrepôt Central SA" value={company.name} onChange={handleCompany("name")} required />
            <FormField
              label="Adresse de l'entreprise" placeholder="12 Rue du Commerce"
              value={company.address} onChange={handleCompany("address")}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
            />
            <div />
          </div>

          <div className={styles.grid3}>
            <FormField label="Ville" placeholder="Casablanca" value={company.city} onChange={handleCompany("city")} required />
            <FormField label="Pays" placeholder="Maroc" value={company.country} onChange={handleCompany("country")} required />
            <div />
          </div>

          <div className={styles.formFooter}>
            <Button type="submit" disabled={loading} fullWidth={false}>
              {loading ? "Création en cours…" : "Créer mon entreprise →"}
            </Button>
            <p className={styles.switchText}>
              Déjà un compte ?{" "}
              <button className={styles.switchBtn} onClick={onGoToLogin} type="button">
                Se connecter
              </button>
            </p>
          </div>
        </form>
      </div>

      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.decor1} />
        <div className={styles.decor2} />
      </div>
    </div>
  );
}
