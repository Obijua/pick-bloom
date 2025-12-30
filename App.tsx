/*
import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";

import { StoreProvider, useStore } from "./context/StoreContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/Toast";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CartSidebar from "./components/CartSidebar";
import QuickViewModal from "./components/QuickViewModal";

// Pages
//import HomePage from "./pages/HomePage";
const HomePage = React.lazy(() => import('./pages/HomePage'));
import ShopPage from "./pages/ShopPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import VendorPage from "./pages/VendorPage";
import VendorDetailsPage from "./pages/VendorDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import WishlistPage from "./pages/WishlistPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

// Admin
import AdminLayout from "./components/AdminLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminCustomersPage from "./pages/AdminCustomersPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminVendorsPage from "./pages/AdminVendorsPage";

import { Leaf, WifiOff, RefreshCcw, Server } from "lucide-react";

/* ---------------- Scroll to top ---------------- *
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/* ---------------- Public Layout ---------------- *
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <CartSidebar />
    <main className="grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

/* ---------------- App Content ---------------- *
const AppContent: React.FC = () => {
  const { isLoading, isError, retryConnection } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-100 rounded-full" />
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <p className="text-gray-500 font-medium animate-pulse">
            Connecting to Market...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <WifiOff className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Connection Failed</h1>

        <p className="text-gray-500 mb-6">
          Could not connect to backend API
        </p>

        <button
          onClick={retryConnection}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-bold"
        >
          <RefreshCcw className="h-5 w-5" />
          Retry Connection
        </button>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-xs text-left">
          <Server className="inline mr-2" />
          Ensure backend is running on port <b>5000</b>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <ToastContainer />
      <QuickViewModal />

      <Routes>
        {/* Admin Routes *}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="vendors" element={<AdminVendorsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Public Routes *}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/vendors" element={<VendorPage />} />
          <Route path="/vendors/:id" element={<VendorDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        </Route>

        {/* 404 *}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

/* ---------------- App Wrapper ---------------- *
const App: React.FC = () => (
  <ToastProvider>
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  </ToastProvider>
);

export default App;
*/









import React, { useEffect, Suspense, lazy } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";

import { StoreProvider, useStore } from "./context/StoreContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/Toast";

// Static UI Components (Small, needed immediately)
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartSidebar from "./components/CartSidebar";
import QuickViewModal from "./components/QuickViewModal";

import { Leaf, WifiOff, RefreshCcw, Server } from "lucide-react";

// --- LAZY LOADED PAGES (Reduces bundle from 4.9MB to ~500KB) ---
const HomePage = lazy(() => import("./pages/HomePage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const VendorPage = lazy(() => import("./pages/VendorPage"));
const VendorDetailsPage = lazy(() => import("./pages/VendorDetailsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

// --- LAZY LOADED ADMIN ---
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrdersPage"));
const AdminProductsPage = lazy(() => import("./pages/AdminProductsPage"));
const AdminCustomersPage = lazy(() => import("./pages/AdminCustomersPage"));
const AdminSettingsPage = lazy(() => import("./pages/AdminSettingsPage"));
const AdminVendorsPage = lazy(() => import("./pages/AdminVendorsPage"));

/* ---------------- Loading Spinner ---------------- */
const PageLoader = () => (
  <div className="flex items-center justify-center p-20 min-h-[40vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Loading content...</p>
    </div>
  </div>
);

/* ---------------- Scroll to Top ---------------- */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/* ---------------- Public Layout ---------------- */
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <CartSidebar />
    <main className="grow">
      {/* Suspense handles the loading of the individual pages inside the layout */}
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
);

/* ---------------- Main Router Logic ---------------- */
const AppContent: React.FC = () => {
  const { isLoading, isError, retryConnection } = useStore();

  // 1. Initial Data Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-100 rounded-full" />
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <p className="text-gray-500 font-medium animate-pulse">Connecting to Market...</p>
        </div>
      </div>
    );
  }

  // 2. Global API Connection Error State
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <WifiOff className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Connection Failed</h1>
        <p className="text-gray-500 mb-6">Could not connect to backend API on port 5000</p>
        <button
          onClick={retryConnection}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors"
        >
          <RefreshCcw className="h-5 w-5" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <ToastContainer />
      <QuickViewModal />

      {/* Main Suspense handles the Layouts themselves */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin Section */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="vendors" element={<AdminVendorsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Public Section */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/vendors" element={<VendorPage />} />
            <Route path="/vendors/:id" element={<VendorDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

/* ---------------- App Entry Point ---------------- */
const App: React.FC = () => (
  <ToastProvider>
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  </ToastProvider>
);

export default App;