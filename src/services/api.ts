
import { Product, User, Order, OrderStatus, Address, CartItem, AppSettings, Vendor, Review } from '../types';

// --- CONFIGURATION ---

const sanitizeUrl = (url: string | undefined): string => {
    const DEFAULT_API = 'https://pick-bloom.onrender.com/api';
    if (!url || typeof url !== 'string' || url.trim() === '') return DEFAULT_API;
    const lower = url.toLowerCase().trim();
    if (lower.includes('google.com') || lower.includes('googleapis') || lower.includes('gemini')) return DEFAULT_API;
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

const getBaseUrl = () => {
    let envUrl: string | undefined = undefined;
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
            // @ts-ignore
            envUrl = import.meta.env.VITE_API_URL;
        }
    } catch (e) {}

    if (!envUrl && typeof process !== 'undefined' && process.env) {
        envUrl = process.env.VITE_API_URL || process.env.REACT_APP_API_URL;
    }
    return sanitizeUrl(envUrl);
};

export const API_URL = getBaseUrl();

export interface ApiInterface {
    resetData(): Promise<void>;
    login(email: string, password: string): Promise<User>;
    forgotPassword(email: string): Promise<string>;
    resetPassword(token: string, password: string): Promise<boolean>;
    verifyEmail(token: string): Promise<any>;
    resendVerification(): Promise<void>;
    getProducts(): Promise<Product[]>;
    getVendors(): Promise<Vendor[]>;
    addVendor(vendorData: Omit<Vendor, 'id'>): Promise<Vendor>;
    updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor>;
    deleteVendor(id: string): Promise<void>;
    addProduct(product: Omit<Product, 'id' | 'rating' | 'reviews' | 'reviewsList'>): Promise<Product>;
    updateProduct(id: string, data: Partial<Product>): Promise<Product>;
    addReview(productId: string, review: Omit<Review, 'id' | 'date'>): Promise<Product>;
    deleteProduct(id: string): Promise<void>;
    getUsers(): Promise<User[]>;
    createUser(userData: any): Promise<any>;
    updateUser(id: string, data: Partial<User>): Promise<User>;
    getOrders(): Promise<Order[]>;
    trackOrder(id: string): Promise<Partial<Order>>;
    createOrder(order: Order): Promise<Order>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;
    cancelOrder(id: string): Promise<Order>;
    deleteOrder(id: string): Promise<void>;
    getSettings(): Promise<AppSettings>;
    updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
}

const handleResponse = async (response: Response, url?: string) => {
    if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.message) errorMessage = errorData.message;
        } catch (e) {}
        throw new Error(errorMessage);
    }
    return response.json();
};

const getHeaders = () => {
    const userStr = localStorage.getItem('FM_SESSION_USER');
    const token = userStr ? JSON.parse(userStr).token : '';
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const realApi: ApiInterface = {
    async resetData(): Promise<void> {
         const key = prompt("Enter Master Seed Key to confirm database reset:");
         if (!key) return;

         const url = `${API_URL}/seed?key=${encodeURIComponent(key)}`;
         const response = await fetch(url, { method: 'POST' });
         if (!response.ok) {
             const err = await response.json();
             throw new Error(err.message || 'Failed to reset data');
         }
         window.location.reload();
    },
    async login(email: string, password: string): Promise<User> {
        const url = `${API_URL}/users/login`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return handleResponse(response, url);
    },
    async forgotPassword(email: string): Promise<string> {
        const url = `${API_URL}/users/forgot-password`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        await handleResponse(response, url);
        return 'Email sent';
    },
    async resetPassword(token: string, password: string): Promise<boolean> {
        const url = `${API_URL}/users/reset-password/${token}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        await handleResponse(response, url);
        return true;
    },
    async verifyEmail(token: string): Promise<any> {
        const url = `${API_URL}/users/verify/${token}`;
        const response = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
        return handleResponse(response, url);
    },
    async resendVerification(): Promise<void> {
        const url = `${API_URL}/users/resend-verification`;
        await fetch(url, { method: 'POST', headers: getHeaders() });
    },
    async getProducts(): Promise<Product[]> {
        const url = `${API_URL}/products`;
        const response = await fetch(url);
        return handleResponse(response, url);
    },
    async getVendors(): Promise<Vendor[]> {
        const url = `${API_URL}/vendors`;
        const response = await fetch(url);
        return handleResponse(response, url);
    },
    async addVendor(vendorData: Omit<Vendor, 'id'>): Promise<Vendor> {
        const url = `${API_URL}/vendors`;
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(vendorData),
        });
        return handleResponse(response, url);
    },
    async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
        const url = `${API_URL}/vendors/${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response, url);
    },
    async deleteVendor(id: string): Promise<void> {
        const url = `${API_URL}/vendors/${id}`;
        const response = await fetch(url, { method: 'DELETE', headers: getHeaders() });
        return handleResponse(response, url);
    },
    async addProduct(product: Omit<Product, 'id' | 'rating' | 'reviews' | 'reviewsList'>): Promise<Product> {
        const url = `${API_URL}/products`;
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(product),
        });
        return handleResponse(response, url);
    },
    async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
        const url = `${API_URL}/products/${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response, url);
    },
    async addReview(productId: string, review: Omit<Review, 'id' | 'date'>): Promise<Product> {
        const url = `${API_URL}/products/${productId}/reviews`;
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(review),
        });
        return handleResponse(response, url);
    },
    async deleteProduct(id: string): Promise<void> {
        const url = `${API_URL}/products/${id}`;
        const response = await fetch(url, { method: 'DELETE', headers: getHeaders() });
        return handleResponse(response, url);
    },
    async getUsers(): Promise<User[]> {
        const url = `${API_URL}/users`;
        const response = await fetch(url, { headers: getHeaders() });
        return handleResponse(response, url);
    },
    async createUser(userData: any): Promise<any> {
        const url = `${API_URL}/users`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return handleResponse(response, url);
    },
    async updateUser(id: string, data: Partial<User>): Promise<User> {
        const url = `${API_URL}/users/${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response, url);
    },
    async getOrders(): Promise<Order[]> {
        const url = `${API_URL}/orders`;
        const response = await fetch(url, { headers: getHeaders() });
        return handleResponse(response, url);
    },
    async trackOrder(id: string): Promise<Partial<Order>> {
        const url = `${API_URL}/orders/${id}/track`;
        const response = await fetch(url);
        return handleResponse(response, url);
    },
    async createOrder(order: Order): Promise<Order> {
        const url = `${API_URL}/orders`;
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(order),
        });
        return handleResponse(response, url);
    },
    async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
        const url = `${API_URL}/orders/${id}/status`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status }),
        });
        return handleResponse(response, url);
    },
    async cancelOrder(id: string): Promise<Order> {
        const url = `${API_URL}/orders/${id}/cancel`;
        const response = await fetch(url, { method: 'PUT', headers: getHeaders() });
        return handleResponse(response, url);
    },
    async deleteOrder(id: string): Promise<void> {
        const url = `${API_URL}/orders/${id}`;
        const response = await fetch(url, { method: 'DELETE', headers: getHeaders() });
        return handleResponse(response, url);
    },
    async getSettings(): Promise<AppSettings> {
        const url = `${API_URL}/settings`;
        const response = await fetch(url);
        return handleResponse(response, url);
    },
    async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
        const url = `${API_URL}/settings`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        return handleResponse(response, url);
    }
};

export const api: ApiInterface = realApi;
