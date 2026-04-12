import { useState } from "react";
import axios from "axios";
import FormField from "../components/FormField";
import Button from "../components/Button";
import styles from "./LoginPage.module.css";

export default function LoginPage({ onGoToSignup }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      console.log("Login success:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      alert("Connexion réussie");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
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
            required
          />

          <FormField
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange("password")}
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