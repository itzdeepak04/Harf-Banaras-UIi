import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/features/auth/auth.slice';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const itemCount = useAppSelector((s) => s.cart.cart.itemCount);
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="site-header">
      <Link to="/" className="site-header__logo">Harf Banaras</Link>
      <nav className="site-header__nav">
        <Link to="/shop">Shop All</Link>
        <Link to="/shop?isNewArrival=true">New Arrivals</Link>
        <Link to="/shop?occasion=bridal">Wedding Collection</Link>
        <Link to="/shop?workIntensity=heavy">Heavy Work</Link>
        <Link to="/heritage">Our Heritage</Link>
      </nav>
      <div className="site-header__actions">
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
    </header>
  );
};
