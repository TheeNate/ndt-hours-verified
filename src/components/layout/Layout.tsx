
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

export function Layout({ requireAuth = false, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  
  console.log("Layout rendering, loading:", loading, "user:", user ? "exists" : "null");
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-ndt-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your experience...</p>
        </div>
      </div>
    );
  }
  
  if (requireAuth && !user) {
    console.log("Auth required but no user, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !isAdmin) {
    console.log("Admin access required but user is not admin, redirecting to dashboard");
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
