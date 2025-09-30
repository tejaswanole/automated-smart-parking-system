import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { deleteParking, getAllParkings } from "../../services/parkingService";

type Parking = {
  _id: string;
  name: string;
  description?: string;
  isApproved: boolean;
  approvedBy?: string | { _id: string };
  owner?: string | { _id: string };
};

export default function ManageParking() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const role = (user?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const isOwner = role === "owner";

  // Fetch existing parkings (approved requests now create actual parkings)
  const { data: parkingData, isLoading, error } = useQuery({
    queryKey: ["admin-parkings", "approved"],
    queryFn: () => getAllParkings({ limit: 100 }),
  });

  const allParkings: Parking[] = parkingData?.parkings ?? parkingData ?? [];
  const parkings = allParkings.filter((p) => {
    if (!p?.isApproved) return false;
    if (isAdmin) return true;
    if (authLoading || !user?._id) return true;
    if (isOwner) {
      const ownerId = typeof p.owner === "string" ? p.owner : p.owner?._id;
      return ownerId === user._id;
    }
    const approverId = typeof p.approvedBy === "string" ? p.approvedBy : p.approvedBy?._id;
    return approverId === user._id;
  });

  // Delete mutation for parkings
  const deleteParkingMutation = useMutation({
    mutationFn: (id: string) => deleteParking(id),
    onSuccess: () => {
      toast.success("Parking deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-parkings"] });
    },
    onError: (err) => {
      console.error("Failed to delete parking", err);
      toast.error("Failed to delete parking");
    },
  });

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">

      {isLoading || authLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-red-300">
          <div className="mb-2">Failed to load parkings</div>
          <div className="text-xs text-red-200 break-all">
            {(error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-parkings"] })}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      ) : parkings.length === 0 ? (
        <div className="text-gray-500">No approved parkings found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parkings.map((p) => (
            <div key={p._id} className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-black font-semibold">{p.name}</h3>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500 bg-opacity-20 text-white">
                  Approved
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">{p.description}</p>
              <div className="flex gap-2">
                <Link
                  to={`/parkings/${p._id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold text-white px-3 py-2 rounded-lg text-center"
                >
                  View
                </Link>
                <Link
                  to={`/owner/parkings/${p._id}/manage`}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 font-bold text-white px-3 py-2 rounded-lg text-center"
                >
                  Manage
                </Link>
                <button
                  disabled={deleteParkingMutation.isPending}
                  onClick={() => {
                    const confirmed = window.confirm("Are you sure you want to delete this parking? This action can be reverted by re-activating in backend but will hide it for users.");
                    if (!confirmed) return;
                    deleteParkingMutation.mutate(p._id);
                  }}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-3 py-2 rounded-lg"
                >
                  {deleteParkingMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
