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
import WarehouseStructurePage from "./pages/WarehouseStructurePage";
import SupplierManagementPage from "./pages/SupplierManagementPage";
import ProductManagementPage from "./pages/ProductManagementPage";
import StockManagementPage from "./pages/StockManagementPage";
import StockMovementPage from "./pages/StockMovementPage";
import CustomerManagementPage from "./pages/CustomerManagementPage";
import AnalyticsPage from "./pages/AnalyticsPage";
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
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
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
            path="/structure"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <WarehouseStructurePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/zones"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Navigate to="/structure" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/racks"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Navigate to="/structure" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shelves"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Navigate to="/structure" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/locations"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Navigate to="/structure" replace />
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
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["OWNER"]}>
                <ProductManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stocks"
            element={
              <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
                <StockManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stocks/search"
            element={<Navigate to="/stocks" replace />}
          />
          <Route
            path="/movements"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MAGASINIER"]}>
                <StockMovementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CustomerManagementPage />
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
