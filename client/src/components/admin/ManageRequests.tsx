import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { approveRequest, denyRequest, getAllRequests } from "../../services/requestService";

export default function ManageRequests() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-requests"], queryFn: () => getAllRequests({ limit: 100 }) });
  const requests = data?.requests ?? data ?? [];

  const approveMutation = useMutation({
    mutationFn: (vars: { id: string; coinsAwarded: number; notes?: string }) => approveRequest(vars.id, { coinsAwarded: vars.coinsAwarded, adminNotes: vars.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["user-requests"] });
    },
  });
  const denyMutation = useMutation({
    mutationFn: (vars: { id: string; notes: string }) => denyRequest(vars.id, { adminNotes: vars.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["user-requests"] });
    },
  });

  const openImageModal = (request: any, imageIndex: number = 0) => {
    setSelectedRequest(request);
    setSelectedImageIndex(imageIndex);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedRequest(null);
    setSelectedImageIndex(0);
  };

  const nextImage = () => {
    if (selectedRequest && selectedRequest.images) {
      setSelectedImageIndex((prev) => 
        prev < selectedRequest.images.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevImage = () => {
    if (selectedRequest && selectedRequest.images) {
      setSelectedImageIndex((prev) => 
        prev > 0 ? prev - 1 : selectedRequest.images.length - 1
      );
    }
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
      <h2 className="text-xl font-semibold text-black mb-4">User Requests</h2>
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-red-300">
          <div className="mb-1">Failed to load requests</div>
          <div className="text-xs text-red-200 break-all">{(error as any)?.response?.data?.message || (error as any)?.message || 'Unknown error'}</div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-gray-500">No requests</div>
      ) : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <div key={r._id} className="bg-white bg-opacity-5 rounded-lg p-4 border border-gray-300 ring-1 border-opacity-10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-black font-semibold">{r.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${r.status === 'approved' ? 'bg-green-500 bg-opacity-20 ' : r.status === 'denied' ? 'bg-red-500 bg-opacity-20' : 'bg-yellow-500 bg-opacity-20 '}`}>{r.status}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{r.description}</p>
                  
                  {/* Image thumbnails */}
                  {r.images && r.images.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-2">Proof Images ({r.images.length}):</p>
                      <div className="flex gap-2 flex-wrap">
                        {r.images.map((image: any, index: number) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`Proof ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openImageModal(r, index)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500 ml-4">
                  <div>Type: {r.requestType}</div>
                  <div>By: {r.user?.name}</div>
                  <div>Date: {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => approveMutation.mutate({ id: r._id, coinsAwarded: 50 })} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg">Approve</button>
                  <button onClick={() => denyMutation.mutate({ id: r._id, notes: 'Not suitable' })} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg">Deny</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedRequest && selectedRequest.images && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {selectedRequest.title} - Proof Images
              </h3>
              <button
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="relative">
              <img
                src={selectedRequest.images[selectedImageIndex]?.url}
                alt={`Proof ${selectedImageIndex + 1}`}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              
              {/* Navigation arrows */}
              {selectedRequest.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Image {selectedImageIndex + 1} of {selectedRequest.images.length}
                </p>
                <div className="flex gap-2">
                  {selectedRequest.images.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === selectedImageIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
