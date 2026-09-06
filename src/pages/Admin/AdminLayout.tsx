import React from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';

// Gate everything under /admin to admin / inventory_manager, and only show
// the tabs each role is actually allowed to use (matches backend @Roles()).
export const AdminLayout: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && user.role !== 'inventory_manager') {
    return (
      <div className="page-status">
        <h2>Access denied</h2>
        <p>You do not have permission to view the administration console.</p>
        <NavLink to="/" className="btn btn--primary">Back to shopping</NavLink>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <h3 className="admin-layout__title">
          {isAdmin ? 'Admin' : 'Inventory'} Console
        </h3>
        <nav className="admin-layout__nav">
          {isAdmin && (
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
              Orders
            </NavLink>
          )}
          <NavLink to="/admin/inventory" className={({ isActive }) => (isActive ? 'active' : '')}>
            Inventory
          </NavLink>
          <NavLink to="/admin/products/new" className={({ isActive }) => (isActive ? 'active' : '')}>
            Add saree
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/coupons" className={({ isActive }) => (isActive ? 'active' : '')}>
              Coupons
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
              Settings
            </NavLink>
          )}
        </nav>
      </aside>
      <section className="admin-layout__content">
        <Outlet />
      </section>
    </div>
  );
};
