import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import FormField from "../components/FormField";
import Button from "../components/Button";
import api from "../services/api";
import styles from "./SignupPage.module.css";

export default function SignupPage({ onGoToLogin }) {
  const navigate = useNavigate();

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
  const [error, setError] = useState("");

  const handleOwner = (field) => (event) =>
    setOwner((prev) => ({ ...prev, [field]: event.target.value }));

  const handleCompany = (field) => (event) =>
    setCompany((prev) => ({ ...prev, [field]: event.target.value }));

  const handleGoToLogin = () => {
    if (onGoToLogin) {
      onGoToLogin();
      return;
    }
    navigate("/login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

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

      await api.post("/api/auth/register-company", payload);
      handleGoToLogin();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not create account.");
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
            Admin account
          </div>
          <h1 className={styles.title}>Create your company</h1>
          <p className={styles.subtitle}>Set up your WMS workspace.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.sectionHead}>Owner details</div>

          <div className={styles.grid3}>
            <FormField
              label="First name"
              placeholder="Hamza"
              value={owner.firstName}
              onChange={handleOwner("firstName")}
              required
            />
            <FormField
              label="Last name"
              placeholder="Owner"
              value={owner.lastName}
              onChange={handleOwner("lastName")}
              required
            />
            <FormField
              label="Email"
              type="email"
              placeholder="owner@company.com"
              value={owner.email}
              onChange={handleOwner("email")}
              required
            />
          </div>

          <div className={styles.grid2half}>
            <FormField
              label="Password"
              type="password"
              placeholder="********"
              value={owner.password}
              onChange={handleOwner("password")}
              required
            />
          </div>

          <div className={styles.sectionHead}>Company details</div>

          <div className={styles.grid3}>
            <FormField
              label="Company name"
              placeholder="WMS Company"
              value={company.name}
              onChange={handleCompany("name")}
              required
            />
            <FormField
              label="Address"
              placeholder="12 Commerce Street"
              value={company.address}
              onChange={handleCompany("address")}
              required
            />
            <FormField
              label="Phone"
              placeholder="+212600000000"
              value={company.phone}
              onChange={handleCompany("phone")}
              required
            />
          </div>

          <div className={styles.grid3}>
            <FormField
              label="City"
              placeholder="Casablanca"
              value={company.city}
              onChange={handleCompany("city")}
              required
            />
            <FormField
              label="Country"
              placeholder="Morocco"
              value={company.country}
              onChange={handleCompany("country")}
              required
            />
            <FormField
              label="Company email"
              type="email"
              placeholder="contact@company.com"
              value={company.email}
              onChange={handleCompany("email")}
              required
            />
          </div>

          {error ? <p className={styles.formError}>{error}</p> : null}

          <div className={styles.formFooter}>
            <Button type="submit" disabled={loading} fullWidth={false}>
              {loading ? "Creating..." : "Create company ->"}
            </Button>
            <p className={styles.switchText}>
              Already have an account?{" "}
              <button className={styles.switchBtn} onClick={handleGoToLogin} type="button">
                Sign in
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
