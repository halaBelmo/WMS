import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import styles from "./LoginPage.module.css";

export default function LoginPage({ onGoToSignup }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setForm((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      login({ token: response.data.token, user: response.data.user });

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToSignup = () => {
    if (onGoToSignup) {
      onGoToSignup();
      return;
    }

    navigate("/signup");
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          User access
        </div>

        <h1 className={styles.title}>Welcome</h1>
        <p className={styles.subtitle}>Sign in with your credentials.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <FormField
            label="Email"
            type="email"
            placeholder="owner@company.com"
            value={form.email}
            onChange={handleChange("email")}
            required
          />

          <FormField
            label="Password"
            type="password"
            placeholder="********"
            value={form.password}
            onChange={handleChange("password")}
            required
          />

          <div className={styles.optionsRow}>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className={styles.checkbox}
              />
              Remember me
            </label>
            <a href="#" className={styles.forgotLink}>
              Forgot password?
            </a>
          </div>

          {error ? <p className={styles.formError}>{error}</p> : null}

          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in ->"}
          </Button>
        </form>

        <div className={styles.infoBox}>
          <p>
            No account yet? Contact your company administrator for access.
          </p>
        </div>

        <p className={styles.switchText}>
          Are you an owner?{" "}
          <button className={styles.switchBtn} onClick={handleSwitchToSignup} type="button">
            Create your company
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
