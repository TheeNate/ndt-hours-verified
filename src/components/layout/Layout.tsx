
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function Layout({ requireAuth = false, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ndt-600" />
      </div>
    );
  }
  
  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
