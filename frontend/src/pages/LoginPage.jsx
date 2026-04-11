import { useState } from "react";
import FormField from "../components/FormField";
import Button from "../components/Button";
import styles from "./LoginPage.module.css";

export default function LoginPage({ onGoToSignup }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>

        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Accès utilisateur
        </div>

        <h1 className={styles.title}>Bienvenue</h1>
        <p className={styles.subtitle}>
          Connectez-vous avec les identifiants fournis par votre administrateur.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <FormField
            label="Adresse email"
            type="email"
            placeholder="ahmed@exemple.com"
            value={form.email}
            onChange={handleChange("email")}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
            required
          />

          <FormField
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange("password")}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            required
          />

          <div className={styles.optionsRow}>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.checkbox}
              />
              Se souvenir de moi
            </label>
            <a href="#" className={styles.forgotLink}>
              Mot de passe oublié ?
            </a>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Connexion en cours…" : "Se connecter →"}
          </Button>
        </form>

        <div className={styles.infoBox}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.infoIcon}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p>
            Vous n'avez pas de compte ? Contactez l'administrateur de votre
            entreprise pour recevoir vos accès.
          </p>
        </div>

        <p className={styles.switchText}>
          Vous êtes un administrateur ?{" "}
          <button className={styles.switchBtn} onClick={onGoToSignup} type="button">
            Créer une entreprise
          </button>
        </p>
      </div>

      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.decor1} />
        <div className={styles.decor2} />
      </div>
    </div>
  );
}
