import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/Home/HomePage';
import { HeritagePage } from './pages/Heritage/HeritagePage';
import { ShopPage } from './pages/Shop/ShopPage';
import { ProductDetailPage } from './pages/ProductDetail/ProductDetailPage';
import { CartPage } from './pages/Cart/CartPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage';
import { WishlistPage } from './pages/Wishlist/WishlistPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { OrderDetailPage } from './pages/Profile/OrderDetailPage';
import { AdminLayout } from './pages/Admin/AdminLayout';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/Admin/AdminOrdersPage';
import { InventoryPage } from './pages/Admin/InventoryPage';
import { CouponsPage } from './pages/Admin/CouponsPage';
import { SettingsPage } from './pages/Admin/SettingsPage';
import { ProductCreatePage } from './pages/Admin/ProductCreatePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { fetchCart } from './redux/features/cart/cart.slice';
import { fetchWishlist } from './redux/features/wishlist/wishlist.slice';
import { restoreSession } from './redux/features/auth/auth.slice';

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (token && !user) dispatch(restoreSession());
  }, [dispatch, token, user]);

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, token]);

  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/heritage" element={<HeritagePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/orders/:id" element={<OrderDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<InventoryPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="products/new" element={<ProductCreatePage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
