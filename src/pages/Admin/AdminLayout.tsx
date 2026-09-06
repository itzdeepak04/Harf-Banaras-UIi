import React from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  PlusCircleOutlined,
  TagsOutlined,
  SettingOutlined,
} from '@ant-design/icons';

// Gate everything under /admin to admin / inventory_manager, and only show
// the tabs each role is actually allowed to use (matches backend @Roles()).
export const AdminLayout: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [collapsed, setCollapsed] = React.useState(false);

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
    <div className={`admin-layout ${collapsed ? 'admin-layout--collapsed' : ''}`}>
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__sidebar-header">
          <h3 className="admin-layout__title" style={{ opacity: collapsed ? 0 : 1 }}>
            {isAdmin ? 'Admin' : 'Inventory'}
          </h3>
          <button
            className="admin-layout__toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>
        <nav className="admin-layout__nav">
          {isAdmin && (
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              <DashboardOutlined /> <span>Dashboard</span>
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
              <ShoppingCartOutlined /> <span>Orders</span>
            </NavLink>
          )}
          <NavLink to="/admin/inventory" className={({ isActive }) => (isActive ? 'active' : '')}>
            <AppstoreOutlined /> <span>Inventory</span>
          </NavLink>
          <NavLink to="/admin/products/new" className={({ isActive }) => (isActive ? 'active' : '')}>
            <PlusCircleOutlined /> <span>Add saree</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/coupons" className={({ isActive }) => (isActive ? 'active' : '')}>
              <TagsOutlined /> <span>Coupons</span>
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
              <SettingOutlined /> <span>Settings</span>
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

