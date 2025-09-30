import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Layout from "../components/common/Layout";
import { decrementVehicleCount, getParkingById, incrementVehicleCount, updateVehicleCount } from "../services/parkingService";

export default function OwnerManageParkingPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: parking, isLoading, error } = useQuery({
    queryKey: ["parking", id],
    queryFn: () => getParkingById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { vehicleType: "car" | "bus_truck" | "bike"; count: number }) => updateVehicleCount(id!, vars.vehicleType, vars.count),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parking", id] }),
  });
  const incMutation = useMutation({
    mutationFn: (vars: { vehicleType: "car" | "bus_truck" | "bike"; inc?: number }) => incrementVehicleCount(id!, vars.vehicleType, vars.inc ?? 1),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parking", id] }),
  });
  const decMutation = useMutation({
    mutationFn: (vars: { vehicleType: "car" | "bus_truck" | "bike"; dec?: number }) => decrementVehicleCount(id!, vars.vehicleType, vars.dec ?? 1),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parking", id] }),
  });

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : error || !parking ? (
            <div className="text-center text-red-300">Failed to load parking</div>
          ) : (
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-black">Manage: {parking.name}</h1>
                  <p className="text-gray-500 text-sm">Parking ID: {parking.parkingId}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs text-white font-bold ${parking.isApproved ? "bg-green-500 bg-opacity-20 text-white font-bold" : "bg-yellow-500 bg-opacity-20 text-white font-bold"}`}>
                  {parking.isApproved ? "Approved" : "Pending"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["car", "bike", "bus_truck"] as const).map(v => (
                  <div key={v} className="bg-white bg-opacity-5 rounded-lg p-4 border ring-1 border-gray-600 border-opacity-10">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-black font-semibold capitalize">{v.replace("_", "/")}</h3>
                      <div className="text-sm text-black">capacity: {parking.capacity[v]}</div>
                    </div>
                    <div className="text-3xl font-bold text-gray-500 mb-3">{parking.currentCount[v]}</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => decMutation.mutate({ vehicleType: v, dec: 1 })} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg">-1</button>
                      <button onClick={() => incMutation.mutate({ vehicleType: v, inc: 1 })} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg">+1</button>
                      <button onClick={() => updateMutation.mutate({ vehicleType: v, count: 0 })} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg">Reset</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
