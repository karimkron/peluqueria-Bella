export interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Appointment {
  _id: string;
  serviceId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  photoUrl: string;
}

export interface GalleryImage {
  _id: string;
  url: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInfo {
  _id?: string;
  address: string;
  phone: string;
  email: string;
  schedule: string;
  createdAt?: string;
  updatedAt?: string;
}
