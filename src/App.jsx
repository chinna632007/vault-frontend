import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/authcontext";
import MainLayout from "./layouts/mainlayout";
import AuthLayout from "./layouts/authlayout";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import ResetPassword from "./pages/reset-password/reset-password";
import Wallet from "./pages/wallet/wallet";
import Dashboard from "./pages/dashboard/dashboard";
import Documents from "./pages/documents/documents";
import Favourite from "./pages/favourite/favourite";
import Upload from "./pages/upload/upload";
import Profile from "./pages/profile/profile";
import Settings from "./pages/settings/settings";
import Trash from "./pages/trash/trash";
import Viewer from "./pages/viewer/viewer";
import Pricing from "./pages/pricing/pricing";
import About from "./pages/about/about";
import Terms from "./pages/terms/terms";
import Help from "./pages/help/help";
import NotFound from "./pages/notfound/notfound";
import Guide from "./pages/guide/guide";
import GettingStarted from "./pages/guide/getting-started";
import Features from "./pages/guide/features";
import Security from "./pages/guide/security";
import FAQ from "./pages/guide/faq";
import Privacy from "./pages/guide/privacy";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading your document vault...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading your document vault...</div>;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        </Route>

        {/* Public routes (guide, help, about, pricing, terms) */}
        <Route element={<MainLayout />}>
          {/* Guide pages - public */}
          <Route path="/guide" element={<Guide />} />
          <Route path="/guide/getting-started" element={<GettingStarted />} />
          <Route path="/guide/features" element={<Features />} />
          <Route path="/guide/security" element={<Security />} />
          <Route path="/guide/faq" element={<FAQ />} />
          <Route path="/guide/privacy" element={<Privacy />} />

          {/* Public informational pages */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/help" element={<Help />} />
        </Route>

        {/* Protected routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/favourite" element={<ProtectedRoute><Favourite /></ProtectedRoute>} />
          <Route path="/trash" element={<ProtectedRoute><Trash /></ProtectedRoute>} />
          <Route path="/viewer/:id" element={<ProtectedRoute><Viewer /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;