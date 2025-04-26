import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Check if Tempo is enabled
const isTempo =
  typeof import.meta !== "undefined" &&
  "env" in import.meta &&
  import.meta.env.VITE_TEMPO === "true";

// Lazy load admin and auth components
const AdminDashboard = lazy(
  () => import("./components/admin/dashboard/AdminDashboard"),
);
const AdminWidgetConfig = lazy(
  () => import("./components/admin/widget/AdminWidgetConfig"),
);
const AdminEmbedCode = lazy(
  () => import("./components/admin/embed/AdminEmbedCode"),
);
const AdminTemplates = lazy(
  () => import("./components/admin/templates/AdminTemplates"),
);
const LoginForm = lazy(() => import("./components/auth/LoginForm"));
const RegisterForm = lazy(() => import("./components/auth/RegisterForm"));
const UnauthorizedPage = lazy(
  () => import("./components/auth/UnauthorizedPage"),
);

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }
      >
        <>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/widget-config"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminWidgetConfig />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/embed-code"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminEmbedCode />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/templates"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminTemplates />
                </ProtectedRoute>
              }
            />

            {/* Add Tempo routes for storyboards */}
            {isTempo && <Route path="/tempobook/*" />}
          </Routes>
          {isTempo && useRoutes(routes)}
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
