export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "owner" | "staff";
  wallet: number;
  // ...other fields
}

export interface Parking {
  _id: string;
  name: string;
  location: { coordinates: [number, number] };
  parkingType: string;
  paymentType: string;
  ownershipType: string;
  isFull: boolean;
  staff: User[];
  owner: User;
  counts: { available: number; total: number };
  amenities: string[];
  operatingHours: string;
  approved: boolean;
  // ...other fields
}

export interface Request {
  _id: string;
  type: string;
  description: string;
  status: string;
  user: User;
  parking?: Parking;
  createdAt: string;
}

export interface Visit {
  _id: string;
  user: User;
  parking: Parking;
  time: string;
  verified: boolean;
  coinsEarned: number;
}