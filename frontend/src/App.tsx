import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import api, { setGetToken } from "./lib/api";

import AdminDashboard from "./pages/AdminDashboard";
import CreateEditField from "./pages/CreateEditField";
import FieldManagement from "./pages/FieldManagement";
import Login from "./pages/Login";
import FieldDetails from "./pages/FieldDetails";
import AgentDashboard from "./pages/AgentDashboard";
import UpdateField from "./pages/UpdateField";
import AdminGate from "./pages/AdminGate";

function AuthSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setGetToken(getToken);
    async function sync() {
      if (isLoaded && isSignedIn && user) {
        try {
          const token = await getToken();
          const name = user.fullName || user.username || user.primaryEmailAddress?.emailAddress || 'Unknown';
          const email = user.primaryEmailAddress?.emailAddress;
          const res = await api.post('/auth/sync', {
            name,
            email,
            role: user.publicMetadata?.role || 'agent'
          }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
          console.error("Auth sync error:", error);
        }
      }
    }
    sync();
  }, [isLoaded, isSignedIn, user, getToken]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><Navigate to="/login" /></SignedOut>
    </>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const unlocked = sessionStorage.getItem('admin_unlocked') === 'true';
  if (!unlocked) return <Navigate to="/admin-gate" replace />;
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function App() {
  return (
    <Router>
      <AuthSync />
      <Routes>
        <Route path="/login" element={<SignedOut><Login /></SignedOut>} />
        <Route path="/" element={<><SignedIn><Navigate to="/agent" replace /></SignedIn><SignedOut><Navigate to="/login" replace /></SignedOut></>} />
        <Route path="/admin-gate" element={<ProtectedRoute><AdminGate /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/agent" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
        <Route path="/fields" element={<ProtectedRoute><FieldManagement /></ProtectedRoute>} />
        <Route path="/fields/create" element={<ProtectedRoute><CreateEditField /></ProtectedRoute>} />
        <Route path="/fields/:id" element={<ProtectedRoute><FieldDetails /></ProtectedRoute>} />
        <Route path="/fields/:id/edit" element={<ProtectedRoute><UpdateField /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
