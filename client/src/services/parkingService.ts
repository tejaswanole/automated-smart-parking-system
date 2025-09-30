import api from "../lib/api";

export interface Parking {
  _id: string;
  parkingId: string;
  name: string;
  description?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
  parkingType: "opensky" | "closedsky";
  paymentType: "paid" | "free";
  ownershipType: "private" | "public";
  capacity: {
    car: number;
    bus_truck: number;
    bike: number;
  };
  currentCount: {
    car: number;
    bus_truck: number;
    bike: number;
  };
  hourlyRate: {
    car: number;
    bus_truck: number;
    bike: number;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  staff: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
  }>;
  isActive: boolean;
  isApproved: boolean;
  approvedBy?: {
    _id: string;
    name: string;
  };
  approvedAt?: string;
  images: Array<{
    url: string;
    caption?: string;
    uploadedAt: string;
  }>;
  amenities: string[];
  operatingHours: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  statistics: {
    totalVisits: number;
    totalRevenue: number;
    averageOccupancy: number;
  };
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  availableSpaces: {
    car: number;
    bus_truck: number;
    bike: number;
  };
  isFull: boolean;
  occupancyPercentage: number;
}

export interface ParkingFilters {
  page?: number;
  limit?: number;
  parkingType?: "opensky" | "closedsky";
  paymentType?: "paid" | "free";
  ownershipType?: "private" | "public";
  search?: string;
}

export interface NearbyParkingFilters {
  coordinates: [number, number];
  maxDistance?: number;
  parkingType?: "opensky" | "closedsky";
  paymentType?: "paid" | "free";
}

export async function getAllParkings(filters: ParkingFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });
  
  const res = await api.get(`/parkings?${params.toString()}`);
  return res.data.data; // { parkings, pagination }
}

export async function getParkingById(id: string) {
  const res = await api.get(`/parkings/${id}`);
  return res.data.data.parking;
}

export async function getNearbyParkings(filters: NearbyParkingFilters) {
  const params = new URLSearchParams();
  params.append('coordinates', filters.coordinates.join(','));
  if (filters.maxDistance) params.append('maxDistance', filters.maxDistance.toString());
  if (filters.parkingType) params.append('parkingType', filters.parkingType);
  if (filters.paymentType) params.append('paymentType', filters.paymentType);
  
  const res = await api.get(`/parkings/nearby?${params.toString()}`);
  return res.data.data;
}

export async function getAvailableParkings(filters: NearbyParkingFilters) {
  const params = new URLSearchParams();
  params.append('coordinates', filters.coordinates.join(','));
  if (filters.maxDistance) params.append('maxDistance', filters.maxDistance.toString());
  if (filters.parkingType) params.append('parkingType', filters.parkingType);
  if (filters.paymentType) params.append('paymentType', filters.paymentType);
  
  const res = await api.get(`/parkings/available?${params.toString()}`);
  return res.data.data;
}

export async function createParking(parkingData: any) {
  const res = await api.post("/parkings", parkingData);
  return res.data.data;
}

export async function updateParking(id: string, updateData: any) {
  const res = await api.put(`/parkings/${id}`, updateData);
  return res.data.data;
}

export async function deleteParking(id: string) {
  const res = await api.delete(`/parkings/${id}`);
  return res.data;
}

export async function approveParking(id: string) {
  const res = await api.put(`/parkings/${id}/approve`);
  return res.data.data;
}

export async function updateVehicleCount(parkingId: string, vehicleType: "car" | "bus_truck" | "bike", count: number) {
  const res = await api.put(`/parkings/${parkingId}/vehicle-count`, {
    vehicleType,
    count
  });
  return res.data.data;
}

export async function incrementVehicleCount(parkingId: string, vehicleType: "car" | "bus_truck" | "bike", increment = 1) {
  const res = await api.post(`/parkings/${parkingId}/vehicle-count/increment`, {
    vehicleType,
    increment
  });
  return res.data.data;
}

export async function decrementVehicleCount(parkingId: string, vehicleType: "car" | "bus_truck" | "bike", decrement = 1) {
  const res = await api.post(`/parkings/${parkingId}/vehicle-count/decrement`, {
    vehicleType,
    decrement
  });
  return res.data.data;
}

export async function getParkingStatistics(parkingId: string, period = "month") {
  const res = await api.get(`/parkings/${parkingId}/statistics?period=${period}`);
  return res.data.data;
}

// Owner-focused APIs
export async function getOwnedParkings() {
  const res = await api.get(`/parkings/owned`);
  return res.data.data; // { parkings: Parking[] }
}