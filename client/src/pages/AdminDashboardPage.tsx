import { useState } from "react";
import ManageParking from "../components/admin/ManageParking";
import ManageRequests from "../components/admin/ManageRequests";
import Layout from "../components/common/Layout";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "../router/ProtectedRoute";

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<"parking" | "requests">("parking");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <ProtectedRoute roles={["admin", "owner"]}>
      <Layout>
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white border-opacity-20">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
                <div className="bg-white bg-opacity-10 rounded-lg p-1 flex">
                  <button onClick={() => setTab("parking")} className={`px-4 py-2 rounded-md ${tab === "parking" ? " bg-opacity-20 text-black ring-1 bg-gray-300 font-bold" : "text-gray-500"}`}>Manage Parking</button>
                  {isAdmin && (
                    <button onClick={() => setTab("requests")} className={`px-4 py-2 rounded-md ${tab === "requests" ? " bg-opacity-20 text-black ring-1 bg-gray-300 font-extrabold" : "text-gray-500"}`}>Manage Requests</button>
                  )}
                </div>
              </div>
            </div>

            {tab === "parking" ? (
              <ManageParking />
            ) : isAdmin ? (
              <ManageRequests />
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                <p className="text-gray-600">Only admins can manage requests.</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
