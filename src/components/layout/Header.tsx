import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Drawer } from 'antd';
import { MenuOutlined, CloseOutlined, HeartOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/features/auth/auth.slice';
import { NotificationCenter } from './NotificationCenter';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const itemCount = useAppSelector((s) => s.cart.cart.itemCount);
  const user = useAppSelector((s) => s.auth.user);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setDrawerOpen(false);
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header className="site-header">
        {/* Logo */}
        <Link to="/" className="site-header__logo" onClick={closeDrawer}>
          Harf Banaras
        </Link>

        {/* Desktop Nav */}
        <nav className="site-header__nav site-header__nav--desktop" aria-label="Main navigation">
          <NavLink to="/shop">Shop All</NavLink>
          <NavLink to="/shop?isNewArrival=true">New Arrivals</NavLink>
          <NavLink to="/shop?occasion=bridal">Wedding Collection</NavLink>
          <NavLink to="/shop?workIntensity=heavy">Heavy Work</NavLink>
          <NavLink to="/heritage">Our Heritage</NavLink>
        </nav>

        {/* Desktop Actions */}
        <div className="site-header__actions site-header__actions--desktop">
          <NotificationCenter />
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart ({itemCount})</Link>
          {user && (user.role === 'admin' || user.role === 'inventory_manager') && (
            <Link to="/admin">{user.role === 'admin' ? 'Admin' : 'Inventory'}</Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="site-header__account">{user.name}</Link>
              <button className="site-header__logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>

        {/* Mobile Right: notification + hamburger */}
        <div className="site-header__mobile-right">
          <NotificationCenter />
          <Link to="/cart" className="site-header__mobile-cart" aria-label={`Cart, ${itemCount} items`}>
            <ShoppingOutlined aria-hidden="true" />
            {itemCount > 0 && <span className="site-header__cart-badge">{itemCount > 9 ? '9+' : itemCount}</span>}
          </Link>
          <button
            className="site-header__hamburger"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuOutlined />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        placement="right"
        width={280}
        closeIcon={<CloseOutlined style={{ color: 'var(--color-gold)' }} />}
        styles={{
          header: {
            background: 'var(--color-maroon)',
            borderBottom: '1px solid rgba(201,162,39,0.3)',
          },
          body: {
            background: 'var(--color-maroon)',
            padding: 0,
          },
        }}
        title={
          <Link to="/" className="site-header__logo" onClick={closeDrawer} style={{ fontSize: '1.2rem' }}>
            Harf Banaras
          </Link>
        }
      >
        <nav className="site-header__drawer-nav" aria-label="Mobile navigation">
          <p className="site-header__drawer-section-label">Shop</p>
          <Link to="/shop" onClick={closeDrawer}>Shop All</Link>
          <Link to="/shop?isNewArrival=true" onClick={closeDrawer}>New Arrivals</Link>
          <Link to="/shop?occasion=bridal" onClick={closeDrawer}>Wedding Collection</Link>
          <Link to="/shop?workIntensity=heavy" onClick={closeDrawer}>Heavy Work</Link>
          <Link to="/heritage" onClick={closeDrawer}>Our Heritage</Link>

          <div className="site-header__drawer-divider" />
          <p className="site-header__drawer-section-label">Account</p>

          <Link to="/wishlist" onClick={closeDrawer}>
            <HeartOutlined aria-hidden="true" /> Wishlist
          </Link>
          <Link to="/cart" onClick={closeDrawer}>
            <ShoppingOutlined aria-hidden="true" /> Cart ({itemCount})
          </Link>

          {user && (user.role === 'admin' || user.role === 'inventory_manager') && (
            <Link to="/admin" onClick={closeDrawer}>
              {user.role === 'admin' ? 'Admin Console' : 'Inventory Console'}
            </Link>
          )}

          {user ? (
            <>
              <Link to="/profile" onClick={closeDrawer}>
                <UserOutlined aria-hidden="true" /> {user.name}
              </Link>
              <button className="site-header__drawer-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeDrawer}>Login</Link>
          )}
        </nav>
      </Drawer>
    </>
  );
};
