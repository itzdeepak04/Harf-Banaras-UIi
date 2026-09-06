import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { orderService } from '../../services/order.service';
import { userService } from '../../services/user.service';
import { Order, Address } from '../../types/common.types';
import { Link } from 'react-router-dom';
import { LoadingState } from '../../components/common/LoadingState';

type Tab = 'orders' | 'addresses' | 'security';

const emptyAddress: Address = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  placed:            { label: 'Placed',            color: '#92400e', bg: '#fef3c7' },
  confirmed:         { label: 'Confirmed',          color: '#065f46', bg: '#d1fae5' },
  packed:            { label: 'Packed',             color: '#1e40af', bg: '#dbeafe' },
  shipped:           { label: 'Shipped',            color: '#5b21b6', bg: '#ede9fe' },
  out_for_delivery:  { label: 'Out for Delivery',   color: '#0369a1', bg: '#e0f2fe' },
  delivered:         { label: 'Delivered',          color: '#065f46', bg: '#d1fae5' },
  cancelled:         { label: 'Cancelled',          color: '#991b1b', bg: '#fee2e2' },
  return_requested:  { label: 'Return Requested',   color: '#92400e', bg: '#fef3c7' },
  returned:          { label: 'Returned',           color: '#374151', bg: '#f3f4f6' },
};

export const ProfilePage: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [tab, setTab] = useState<Tab>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState('');
  const [newAddress, setNewAddress] = useState<Address>(emptyAddress);
  const [addressError, setAddressError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true);
      setOrdersError('');
      orderService
        .myOrders()
        .then(setOrders)
        .catch(() => setOrdersError('Orders are temporarily unavailable. Please check that the server is running and try again.'))
        .finally(() => setOrdersLoading(false));
    }
    if (tab === 'addresses') {
      setAddressesLoading(true);
      setAddressesError('');
      userService
        .getProfile()
        .then((profile) => setAddresses(profile.addresses || []))
        .catch(() => setAddressesError('Could not load your addresses. Please try again.'))
        .finally(() => setAddressesLoading(false));
    }
  }, [tab]);

  const handleCancel = async (id: string) => {
    const reason = window.prompt('Reason for cancellation?') || 'Changed my mind';
    try {
      const updated = await orderService.cancel(id, reason);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch {
      window.alert('This order can no longer be cancelled.');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');
    try {
      const updated = await userService.addAddress(newAddress);
      setAddresses(updated);
      setNewAddress(emptyAddress);
    } catch {
      setAddressError('Could not save this address. Please check the fields.');
    }
  };

  const handleRemoveAddress = async (index: number) => {
    const updated = await userService.removeAddress(index);
    setAddresses(updated);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    try {
      await userService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage('Password changed successfully.');
    } catch {
      setPasswordError('Could not change password. Check your current password and try again.');
    }
  };

  const initials = (user?.name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="profile-page">

      {/* ── Hero greeting ── */}
      <div className="profile-hero">
        <div className="profile-hero__avatar" aria-hidden="true">{initials}</div>
        <div className="profile-hero__info">
          <p className="eyebrow">My Account</p>
          <h1 className="profile-hero__name">Hi, {user?.name || 'there'} 👋</h1>
          <p className="profile-hero__email">{user?.email}</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="profile-tabs" role="tablist">
        {(['orders', 'addresses', 'security'] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`profile-tabs__btn${tab === t ? ' profile-tabs__btn--active' : ''}`}
            onClick={() => setTab(t)}
          >
            <span className="profile-tabs__icon">
              {t === 'orders' ? '📦' : t === 'addresses' ? '📍' : '🔒'}
            </span>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ══════════ ORDERS ══════════ */}
      {tab === 'orders' && (
        <div className="profile-section">
          {ordersLoading && <LoadingState label="Loading your orders" variant="section" />}
          {ordersError && <p className="error">{ordersError}</p>}

          {!ordersLoading && !ordersError && orders.length === 0 && (
            <div className="profile-empty">
              <span className="profile-empty__icon">🛍️</span>
              <h3>No orders yet</h3>
              <p>Your orders will appear here once you make a purchase.</p>
              <Link to="/shop" className="btn btn--primary">Start Shopping</Link>
            </div>
          )}

          {orders.map((order) => {
            const meta = STATUS_META[order.status] || { label: order.status, color: '#374151', bg: '#f3f4f6' };
            const canCancel = ['placed', 'confirmed', 'packed'].includes(order.status);
            return (
              <div className="order-card-v2" key={order._id}>
                {/* Card header */}
                <div className="order-card-v2__head">
                  <div className="order-card-v2__id-block">
                    <span className="order-card-v2__label">Order</span>
                    <strong className="order-card-v2__number">{order.orderNumber}</strong>
                  </div>
                  <span
                    className="order-card-v2__badge"
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Meta row */}
                <div className="order-card-v2__meta">
                  <span>📅 {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="order-card-v2__dot">·</span>
                  <span>💰 ₹{order.total.toLocaleString('en-IN')}</span>
                  <span className="order-card-v2__dot">·</span>
                  <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Items */}
                <ul className="order-card-v2__items">
                  {order.items.map((item, i) => (
                    <li key={i} className="order-card-v2__item">
                      <span className="order-card-v2__item-mark">
                        {item.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="order-card-v2__item-name">{item.name}</span>
                      <span className="order-card-v2__item-qty">× {item.quantity}</span>
                      <span className="order-card-v2__item-price">₹{item.unitPrice.toLocaleString('en-IN')}</span>
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="order-card-v2__actions">
                  <Link to={`/profile/orders/${order._id}`} className="order-card-v2__track-btn">
                    Track Order →
                  </Link>
                  {canCancel && (
                    <button className="order-card-v2__cancel-btn" onClick={() => handleCancel(order._id)}>
                      Cancel order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ ADDRESSES ══════════ */}
      {tab === 'addresses' && (
        <div className="profile-section">
          {addressesLoading && <LoadingState label="Loading your addresses" variant="section" />}
          {addressesError && <p className="error">{addressesError}</p>}

          {!addressesLoading && !addressesError && addresses.length === 0 && (
            <div className="profile-empty">
              <span className="profile-empty__icon">📍</span>
              <h3>No saved addresses</h3>
              <p>Add an address below to speed up checkout.</p>
            </div>
          )}

          {!addressesLoading && addresses.length > 0 && (
          <div className="profile-addresses-grid">
            {addresses.map((addr, i) => (
              <div className={`address-card-v2${addr.isDefault ? ' address-card-v2--default' : ''}`} key={i}>
                <div className="address-card-v2__head">
                  <span className="address-card-v2__label-badge">{addr.label}</span>
                  {addr.isDefault && <span className="address-card-v2__default-tag">Default</span>}
                </div>
                <p className="address-card-v2__name">{addr.fullName}</p>
                <p className="address-card-v2__detail">{addr.phone}</p>
                <p className="address-card-v2__detail">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p className="address-card-v2__detail">{addr.city}, {addr.state} — {addr.pincode}</p>
                <button className="address-card-v2__remove" onClick={() => handleRemoveAddress(i)}>Remove</button>
              </div>
            ))}
          </div>
          )}

          <div className="profile-add-address">
            <h3 className="profile-add-address__title">Add a new address</h3>
            <form className="address-form-v2" onSubmit={handleAddAddress}>
              <div className="address-form-v2__row">
                <label className="address-form-v2__field">
                  <span>Label</span>
                  <input placeholder="Home / Work / Other" value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
                </label>
                <label className="address-form-v2__field">
                  <span>Full name <em>*</em></span>
                  <input placeholder="Full name" value={newAddress.fullName} required
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                </label>
              </div>
              <div className="address-form-v2__row">
                <label className="address-form-v2__field address-form-v2__field--wide">
                  <span>Phone <em>*</em></span>
                  <input placeholder="+91 XXXXX XXXXX" value={newAddress.phone} required
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
                </label>
              </div>
              <div className="address-form-v2__row">
                <label className="address-form-v2__field address-form-v2__field--wide">
                  <span>Address line 1 <em>*</em></span>
                  <input placeholder="Street, building, flat number" value={newAddress.line1} required
                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
                </label>
              </div>
              <div className="address-form-v2__row">
                <label className="address-form-v2__field address-form-v2__field--wide">
                  <span>Address line 2</span>
                  <input placeholder="Landmark, area (optional)" value={newAddress.line2}
                    onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} />
                </label>
              </div>
              <div className="address-form-v2__row">
                <label className="address-form-v2__field">
                  <span>City <em>*</em></span>
                  <input placeholder="City" value={newAddress.city} required
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                </label>
                <label className="address-form-v2__field">
                  <span>State <em>*</em></span>
                  <input placeholder="State" value={newAddress.state} required
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                </label>
                <label className="address-form-v2__field">
                  <span>Pincode <em>*</em></span>
                  <input placeholder="6-digit pincode" value={newAddress.pincode} required maxLength={6}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                </label>
              </div>
              <label className="address-form-v2__checkbox">
                <input type="checkbox" checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
                Set as default address
              </label>
              {addressError && <p className="error">{addressError}</p>}
              <button className="btn btn--primary address-form-v2__submit" type="submit">Save Address</button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ SECURITY ══════════ */}
      {tab === 'security' && (
        <div className="profile-section">
          <div className="security-card">
            <div className="security-card__icon" aria-hidden="true">🔒</div>
            <h3 className="security-card__title">Change Password</h3>
            <p className="security-card__desc">Choose a strong password to keep your account secure.</p>
            <form className="security-form" onSubmit={handleChangePassword}>
              <label className="security-form__field">
                <span>Current password</span>
                <input type="password" placeholder="Enter current password" required value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} />
              </label>
              <label className="security-form__field">
                <span>New password</span>
                <input type="password" placeholder="At least 6 characters" required minLength={6} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} />
              </label>
              {passwordError && <p className="error">{passwordError}</p>}
              {passwordMessage && <p className="hint">✅ {passwordMessage}</p>}
              <button className="btn btn--primary security-form__submit" type="submit">Update Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
