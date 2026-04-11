import { useState } from "react";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import "./styles/global.css";

export default function App() {
  const [page, setPage] = useState("login");

  const handleNavigate = (target) => {
    if (target === "login" || target === "signup") {
      setPage(target);
    }
  };

  return (
    <>
      <Navbar activePage={page} onNavigate={handleNavigate} />
      <div className="app-root">
        {page === "login" ? (
          <LoginPage onGoToSignup={() => setPage("signup")} />
        ) : (
          <SignupPage onGoToLogin={() => setPage("login")} />
        )}
      </div>
    </>
  );
}
