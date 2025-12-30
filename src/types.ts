
export enum Category {
  TUBERS = 'Tubers',
  FRUITS = 'Fruits',
  VEGETABLES = 'Vegetables',
  MEAT = 'Meat & Poultry',
  DAIRY = 'Dairy & Eggs',
  GRAINS = 'Grains & Legumes',
  HERBS = 'Herbs & Spices',
  NUTS = 'Nuts & Seeds',
  PANTRY = 'Pantry/Cooking Essentials'
}

export interface Vendor {
  id: string;
  name: string;
  location: string;
  rating: number;
  image: string;
  description: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: Category;
  image: string;
  vendorId?: string; // Made Optional
  description: string;
  rating: number;
  reviews: number;
  isSeasonal?: boolean;
  reviewsList?: Review[];
  stock: number;
  status: 'Active' | 'Draft' | 'Low Stock' | 'Out of Stock';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  landmark?: string;
  city: string; 
  lga: string;
  state: string;
  phone: string;
  zip: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  addresses: Address[];
  role: 'customer' | 'admin';
  status?: 'Active' | 'Blocked';
  phone?: string;
  joinDate?: string;
  token?: string; // Added for JWT
  isVerified?: boolean;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: CartItem[];
  paymentMethod: string;
  shippingAddress: Address;
}

export interface AppSettings {
  shippingCost: number;
  freeShippingThreshold: number;
  taxRate: number; 
  siteName: string;
  supportEmail: string;
  contactPhone: string;
}
