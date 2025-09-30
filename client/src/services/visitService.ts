import api from "../lib/api";

export interface Visit {
  _id: string;
  parking: {
    _id: string;
    name: string;
    location: {
      type: "Point";
      coordinates: [number, number];
    };
    parkingType: "opensky" | "closedsky";
    paymentType: "paid" | "free";
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  visitDate: string;
  coinsEarned: number;
  distance: number;
  isVerified: boolean;
  verificationMethod?: "gps" | "manual" | "qr";
  verifiedBy?: {
    _id: string;
    name: string;
  };
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  ageInDays: number;
  formattedVisitDate: string;
}

export interface VisitFilters {
  page?: number;
  limit?: number;
  parkingId?: string;
  period?: "day" | "week" | "month" | "year";
  startDate?: string;
  endDate?: string;
}

export async function recordVisit(visitData: {
  parkingId: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  distance: number;
}) {
  const res = await api.post("/visits", visitData);
  return res.data.data;
}

export async function getUserVisits(filters: VisitFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  const res = await api.get(`/visits/user/me?${params.toString()}`);
  // API returns { data: { visits, pagination } }
  return res.data.data.visits;
}

export async function getVisitById(id: string) {
  const res = await api.get(`/visits/${id}`);
  return res.data.data.visit;
}

export async function verifyVisit(visitId: string, data: {
  method: "manual" | "qr";
  notes?: string;
}) {
  const res = await api.put(`/visits/${visitId}/verify`, data);
  return res.data.data;
}

export async function getVisitStatistics(filters: {
  period?: "day" | "week" | "month" | "year";
  parkingId?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  const res = await api.get(`/visits/statistics?${params.toString()}`);
  return res.data.data;
}

export async function getAllVisits(filters: VisitFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  const res = await api.get(`/visits?${params.toString()}`);
  return res.data.data;
}