import api from "../lib/api";

export interface Request {
  _id: string;
  requestType: "parking" | "no_parking";
  status: "pending" | "approved" | "denied";
  title: string;
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  images: Array<{
    url: string;
    caption?: string;
  }>;
  parkingDetails?: {
    name: string;
    capacity: {
      car: number;
      bus_truck: number;
      bike: number;
    };
    parkingType: "opensky" | "closedsky";
    paymentType: "paid" | "free";
    ownershipType: "private" | "public";
    hourlyRate: {
      car: number;
      bus_truck: number;
      bike: number;
    };
    amenities: string[];
    operatingHours: {
      open: string;
      close: string;
      is24Hours: boolean;
    };
  };
  noParkingDetails?: {
    reason: string;
    duration: {
      startDate: string;
      endDate: string;
    };
    affectedArea: "full" | "partial";
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  adminNotes?: string;
  coinsAwarded?: number;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  ageInDays: number;
  isPending: boolean;
}

export interface RequestFilters {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "denied";
  requestType?: "parking" | "no_parking";
}

export async function createRequest(requestData: {
  requestType: "parking" | "no_parking";
  title: string;
  description: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  images: Array<{
    url: string;
    caption?: string;
  }>;
  parkingDetails?: {
    name: string;
    capacity: {
      car: number;
      bus_truck: number;
      bike: number;
    };
    parkingType: "opensky" | "closedsky";
    paymentType: "paid" | "free";
    ownershipType: "private" | "public";
    hourlyRate: {
      car: number;
      bus_truck: number;
      bike: number;
    };
    amenities: string[];
    operatingHours: {
      open: string;
      close: string;
      is24Hours: boolean;
    };
  };
  noParkingDetails?: {
    reason: string;
    duration: {
      startDate: string;
      endDate: string;
    };
    affectedArea: "full" | "partial";
  };
}, images?: File[]) {
  const formData = new FormData();
  
  // Add request data as JSON
  formData.append('requestData', JSON.stringify(requestData));
  
  // Add images if provided
  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append('images', image);
    });
  }
  
  const res = await api.post("/requests", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
}

export async function getUserRequests(filters: RequestFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  const res = await api.get(`/requests/user/me?${params.toString()}`);
  return res.data.data.requests;
}

export async function getRequestById(id: string) {
  const res = await api.get(`/requests/${id}`);
  return res.data.data.request;
}

export async function getAllRequests(filters: RequestFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  const res = await api.get(`/requests?${params.toString()}`);
  return res.data.data;
}

export async function getApprovedRequests(filters: RequestFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  const res = await api.get(`/requests/approved?${params.toString()}`);
  return res.data.data;
}

export async function getPendingRequests(filters: RequestFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  const res = await api.get(`/requests/pending?${params.toString()}`);
  return res.data.data;
}

export async function approveRequest(requestId: string, data: {
  coinsAwarded: number;
  adminNotes?: string;
}) {
  const res = await api.put(`/requests/${requestId}/approve`, data);
  return res.data.data;
}

export async function denyRequest(requestId: string, data: {
  adminNotes: string;
}) {
  const res = await api.put(`/requests/${requestId}/deny`, data);
  return res.data.data;
}

export async function getRequestStatistics(period = "month") {
  const res = await api.get(`/requests/statistics?period=${period}`);
  return res.data.data;
}