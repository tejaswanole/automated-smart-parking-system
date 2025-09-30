// filepath: c:\Users\Nirant Kale\Desktop\p1\client\src\services\authService.ts
import api from "../lib/api";

export async function login(data: { email: string; password: string }) {
  const res = await api.post("/users/login", data);
  return res.data.data;
}

export async function register(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const res = await api.post("/users/register", data);
  return res.data.data;
}

export async function logout() {
  const res = await api.post("/users/logout");
  return res.data;
}

export async function getProfile() {
  try {
    const res = await api.get("/users/profile");
    return res.data.data;
  } catch (error) {
    return null;
  }
}

export async function updateProfile(data: {
  name?: string;
  phone?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}) {
  const res = await api.put("/users/profile", data);
  return res.data.data;
}

export async function getWallet() {
  const res = await api.get("/users/wallet");
  return res.data.data;
}

export async function getWalletTransactions(page = 1, limit = 20) {
  const res = await api.get(`/users/wallet/transactions?page=${page}&limit=${limit}`);
  return res.data.data;
}