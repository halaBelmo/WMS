import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WarehouseManagementPage from "./pages/WarehouseManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import LocationManagementPage from "./pages/LocationManagementPage";
import ZoneManagementPage from "./pages/ZoneManagementPage";
import RackManagementPage from "./pages/RackManagementPage";
import ShelfManagementPage from "./pages/ShelfManagementPage";
import SupplierManagementPage from "./pages/SupplierManagementPage";

import "./styles/global.css";

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AuthScreen({ page }) {
  const navigate = useNavigate();

  const handleNavigate = (target) => {
    if (target === "login" || target === "signup") {
      navigate(`/${target}`);
    }
  };

  return (
    <>
      <Navbar activePage={page} onNavigate={handleNavigate} />
      <div className="app-root">
        {page === "login" ? (
          <LoginPage onGoToSignup={() => navigate("/signup")} />
        ) : (
          <SignupPage onGoToLogin={() => navigate("/login")} />
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <AuthScreen page="login" />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <AuthScreen page="signup" />
          </PublicOnlyRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/warehouses"
            element={
              <ProtectedRoute allowedRoles={["OWNER"]}>
                <WarehouseManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
                <ProductManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations"
            element={
              <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
                <LocationManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/zones"
            element={
              <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
                <ZoneManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/racks"
            element={
              <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
                <RackManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelves"
            element={
              <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
                <ShelfManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute allowedRoles={["OWNER"]}>
                <SupplierManagementPage />
              </ProtectedRoute>
            }
          />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
