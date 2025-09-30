import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AuthPage from "../pages/AuthPage";
import DashboardPage from "../pages/DashboardPage";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import OwnerManageParkingPage from "../pages/OwnerManageParkingPage";
import ParkingDetailPage from "../pages/ParkingDetailPage";
import ParkingListPage from "../pages/ParkingListPage";
import ProfilePage from "../pages/ProfilePage";
import RequestPage from "../pages/RequestPage";
import WalletPage from "../pages/WalletPage";
import ProtectedRoute from "./ProtectedRoute";

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } />
        <Route path="/parkings" element={<ParkingListPage />} />
        <Route path="/parkings/:id" element={<ParkingDetailPage />} />
        <Route path="/requests" element={
          <ProtectedRoute>
            <RequestPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        } />

        {/* Owner routes */}

        <Route path="/owner/parkings/:id/manage" element={
          <ProtectedRoute>
            <OwnerManageParkingPage />
          </ProtectedRoute>
        } />

        {/* Admin/Owner dashboard */}
        <Route path="/admin" element={
          <ProtectedRoute roles={["admin", "owner"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />

        {/* Profile */}
        <Route path="/profile" element={
          <ProtectedRoute roles={["user", "owner", "staff", "admin"]}>
            <ProfilePage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}