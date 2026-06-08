/** Shared domain types for Atelier Market. */

export type UserRole = "customer" | "vendor" | "admin";
export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";
export type OrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Rating {
  average: number;
  count: number;
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  addresses?: Address[];
  createdAt: string;
}

/** Lightweight vendor reference embedded on products/orders. */
export interface VendorRef {
  id: string;
  name: string;
  slug: string;
}

export interface Vendor {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  bio?: string;
  logo?: string;
  banner?: string;
  location?: string;
  ownerId: string;
  status: VendorStatus;
  rating: Rating;
  productCount?: number;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  compareAtPrice?: number | null;
  category: string;
  tags: string[];
  vendor: VendorRef;
  stockCount: number;
  rating: Rating;
  isActive: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  orderId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  body: string;
  isFlagged?: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  maxStock: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  email: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  slug: string;
  name: string;
  blurb?: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  rating?: number;
}
