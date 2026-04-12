import { useState } from "react";
import axios from "axios";
import Logo from "../components/Logo";
import FormField from "../components/FormField";
import Button from "../components/Button";
import styles from "./SignupPage.module.css";

export default function SignupPage({ onGoToLogin }) {
  const [owner, setOwner] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [company, setCompany] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleOwner = (field) => (e) =>
    setOwner((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCompany = (field) => (e) =>
    setCompany((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        companyName: company.name,
        address: `${company.address}, ${company.city}, ${company.country}`,
        email: company.email,
        phone: company.phone,
        ownerName: `${owner.firstName} ${owner.lastName}`,
        ownerEmail: owner.email,
        password: owner.password,
      };

      const response = await axios.post(
        "http://localhost:8080/api/auth/register-company",
        payload
      );

      console.log("Signup success:", response.data);
      alert("Entreprise créée avec succès");
      onGoToLogin();
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      alert("Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
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
          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>👤</span>
            Informations du propriétaire
          </div>

          <div className={styles.grid3}>
            <FormField
              label="Prénom"
              placeholder="Jiara"
              value={owner.firstName}
              onChange={handleOwner("firstName")}
              required
            />
            <FormField
              label="Nom"
              placeholder="Martins"
              value={owner.lastName}
              onChange={handleOwner("lastName")}
              required
            />
            <FormField
              label="Email"
              type="email"
              placeholder="hello@votresite.com"
              value={owner.email}
              onChange={handleOwner("email")}
              required
            />
          </div>

          <div className={styles.grid2half}>
            <FormField
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={owner.password}
              onChange={handleOwner("password")}
              required
            />
          </div>

          <div className={styles.sectionHead}>
            <span className={styles.sectionIcon}>🏢</span>
            Informations de l'entreprise
          </div>

          <div className={styles.grid3}>
            <FormField
              label="Nom de l'entreprise"
              placeholder="Entrepôt Central SA"
              value={company.name}
              onChange={handleCompany("name")}
              required
            />
            <FormField
              label="Adresse"
              placeholder="12 Rue du Commerce"
              value={company.address}
              onChange={handleCompany("address")}
              required
            />
            <FormField
              label="Téléphone"
              placeholder="+212600000000"
              value={company.phone}
              onChange={handleCompany("phone")}
              required
            />
          </div>

          <div className={styles.grid3}>
            <FormField
              label="Ville"
              placeholder="Casablanca"
              value={company.city}
              onChange={handleCompany("city")}
              required
            />
            <FormField
              label="Pays"
              placeholder="Maroc"
              value={company.country}
              onChange={handleCompany("country")}
              required
            />
            <FormField
              label="Email entreprise"
              type="email"
              placeholder="contact@entreprise.com"
              value={company.email}
              onChange={handleCompany("email")}
              required
            />
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