import api from "../lib/api";

export async function getWallet() {
  const res = await api.get("/users/wallet");
  return res.data.data;
}

export async function getWalletTransactions() {
  const res = await api.get("/users/wallet/transactions");
  return res.data.data.transactions;
}

export async function getCurrentUser() {
  const res = await api.get("/users/profile");
  return res.data.data; // { user }
}

export async function updateUserProfile(data: {
  name?: string;
  phone?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}) {
  const res = await api.put("/users/profile", data);
  return res.data.data; // { user }
}