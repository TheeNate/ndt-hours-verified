
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2, PlusCircle, FileText, Clock, Clipboard, ClipboardCheck } from "lucide-react";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalNdtHours: 0,
    totalRopeHours: 0,
    ndtEntries: 0,
    ropeEntries: 0,
    pendingSignatures: 0,
    verifiedSignatures: 0,
  });
  const [loading, setLoading] = useState(true);
  const [methodTotals, setMethodTotals] = useState<{ method: string; hours: number }[]>([]);

  useEffect(() => {
    console.log("🔄 [Dashboard] useEffect fired — user:", user);
    setLoading(true);
  
    if (!user) {
      console.log("⚠️ [Dashboard] no user, bailing out and stopping loading");
      setLoading(false);
      return;
    }
  
    const fetchDashboardData = async () => {
      // 1️⃣ Quick connectivity check
      console.log("ℹ️ [Dashboard] running Supabase test query…");
      try {
        const { data: testData, error: testError } = await supabase
          .from("ndt_entries")
          .select("id")
          .limit(1);
        console.log("🔍 [Dashboard] test query result:", { testData, testError });
      } catch (err) {
        console.error("❌ [Dashboard] test query threw:", err);
      }
  
      // 2️⃣ Real data fetch
      try {
        console.log("ℹ️ [Dashboard] fetching NDT entries…");
        const { data: ndtEntries, error: ndtError } = await supabase
          .from("ndt_entries")
          .select("*")
          .eq("user_id", user.id);
        if (ndtError) throw ndtError;
  
        console.log("ℹ️ [Dashboard] fetching Rope entries…");
        const { data: ropeEntries, error: ropeError } = await supabase
          .from("rope_entries")
          .select("*")
          .eq("user_id", user.id);
        if (ropeError) throw ropeError;
  
        console.log("ℹ️ [Dashboard] fetching Signatures…");
        const { data: signatures, error: sigError } = await supabase
          .from("ndt_signatures")
          .select("status")
          .eq("technician_id", user.id);
        if (sigError) throw sigError;
  
        // Calculate and set stats
        const totalNdtHours = ndtEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
        const totalRopeHours = ropeEntries.reduce((sum, e) => sum + (e.rope_hours || 0), 0);
        const pendingCount = signatures.filter(s => s.status === "Pending").length;
        const verifiedCount = signatures.filter(s => s.status === "Confirmed").length;
  
        const methodsMap = new Map<string, number>();
        ndtEntries.forEach(e => {
          const hrs = e.hours || 0;
          methodsMap.set(e.method, (methodsMap.get(e.method) || 0) + hrs);
        });
        const methodTotalsArray = Array.from(methodsMap, ([method, hours]) => ({ method, hours }));
  
        setStats({
          totalNdtHours,
          totalRopeHours,
          ndtEntries: ndtEntries.length,
          ropeEntries: ropeEntries.length,
          pendingSignatures: pendingCount,
          verifiedSignatures: verifiedCount,
        });
        setMethodTotals(methodTotalsArray);
  
        console.log("✅ [Dashboard] data loaded, updating UI");
      } catch (err) {
        console.error("❌ [Dashboard] data fetch error:", err);
      } finally {
        console.log("🏁 [Dashboard] fetchDashboardData complete — loading=false");
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, [user]);
  

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ndt-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {profile?.full_name || profile?.username || "Technician"}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your NDT and rope access hours
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total NDT Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-ndt-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalNdtHours}</p>
            <p className="text-xs text-gray-500">
              From {stats.ndtEntries} entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Rope Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-ndt-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalRopeHours}</p>
            <p className="text-xs text-gray-500">
              From {stats.ropeEntries} entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Signatures
            </CardTitle>
            <Clipboard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingSignatures}</p>
            <p className="text-xs text-gray-500">
              Waiting for verification
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Verified Signatures
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.verifiedSignatures}</p>
            <p className="text-xs text-gray-500">
              Successfully verified
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Method Hours */}
        <Card>
          <CardHeader>
            <CardTitle>NDT Hours by Method</CardTitle>
            <CardDescription>
              Breakdown of your hours by NDT method
            </CardDescription>
          </CardHeader>
          <CardContent>
            {methodTotals.length > 0 ? (
              <ul className="space-y-3">
                {methodTotals.map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="font-medium">{item.method}</span>
                    <span className="text-gray-600">{item.hours} hours</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No NDT hours recorded yet
              </p>
            )}
            <div className="mt-6">
              <Button asChild variant="outline" className="w-full">
                <Link to="/ndt-hours">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add NDT Hours
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild variant="default" className="w-full bg-ndt-600 hover:bg-ndt-700">
              <Link to="/ndt-hours">
                <PlusCircle className="mr-2 h-4 w-4" />
                Log NDT Hours
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/rope-hours">
                <PlusCircle className="mr-2 h-4 w-4" />
                Log Rope Access Hours
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/signatures">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                View Signatures
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/reports">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
