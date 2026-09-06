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

export const ProfilePage: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [tab, setTab] = useState<Tab>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>(user?.addresses || []);
  const [newAddress, setNewAddress] = useState<Address>(emptyAddress);
  const [addressError, setAddressError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true);
      orderService
        .myOrders()
        .then(setOrders)
        .finally(() => setOrdersLoading(false));
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

  return (
    <div className="profile-page">
      <h2>Hi, {user?.name || 'there'}</h2>

      <div className="profile-page__tabs">
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
          Orders
        </button>
        <button className={tab === 'addresses' ? 'active' : ''} onClick={() => setTab('addresses')}>
          Addresses
        </button>
        <button className={tab === 'security' ? 'active' : ''} onClick={() => setTab('security')}>
          Security
        </button>
      </div>

      {tab === 'orders' && (
        <div className="profile-page__orders">
          {ordersLoading && <LoadingState label="Loading your orders" variant="section" />}
          {!ordersLoading && orders.length === 0 && <p>You haven't placed any orders yet.</p>}
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-card__header">
                <strong>{order.orderNumber}</strong>
                <span className={`order-card__status order-card__status--${order.status}`}>
                  {order.status}
                </span>
              </div>
              <p>{new Date(order.createdAt).toLocaleDateString()} · ₹{order.total} · {order.items.length} item(s)</p>
              <Link className="btn btn--text" to={`/profile/orders/${order._id}`}>View tracking</Link>
              <ul className="order-card__items">
                {order.items.map((item, i) => (
                  <li key={i}>{item.name} × {item.quantity} — ₹{item.unitPrice}</li>
                ))}
              </ul>
              {['placed', 'confirmed', 'packed'].includes(order.status) && (
                <button className="btn btn--text" onClick={() => handleCancel(order._id)}>
                  Cancel order
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'addresses' && (
        <div className="profile-page__addresses">
          {addresses.length === 0 && <p>No saved addresses yet.</p>}
          {addresses.map((addr, i) => (
            <div className="address-card" key={i}>
              <p><strong>{addr.label}</strong>{addr.isDefault && ' · Default'}</p>
              <p>{addr.fullName} · {addr.phone}</p>
              <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
              <p>{addr.city}, {addr.state} - {addr.pincode}</p>
              <button className="btn btn--text" onClick={() => handleRemoveAddress(i)}>Remove</button>
            </div>
          ))}
          <form className="address-form" onSubmit={handleAddAddress}>
            <h3>Add a new address</h3>
            <input placeholder="Label (Home/Work)" value={newAddress.label}
              onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
            <input placeholder="Full name" value={newAddress.fullName} required
              onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
            <input placeholder="Phone" value={newAddress.phone} required
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
            <input placeholder="Address line 1" value={newAddress.line1} required
              onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
            <input placeholder="Address line 2 (optional)" value={newAddress.line2}
              onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} />
            <input placeholder="City" value={newAddress.city} required
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
            <input placeholder="State" value={newAddress.state} required
              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
            <input placeholder="Pincode" value={newAddress.pincode} required maxLength={6}
              onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
            <label>
              <input type="checkbox" checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
              Set as default
            </label>
            {addressError && <p className="error">{addressError}</p>}
            <button className="btn btn--primary" type="submit">Save address</button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <form className="address-form" onSubmit={handleChangePassword}>
          <h3>Change password</h3>
          <input type="password" placeholder="Current password" required value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} />
          <input type="password" placeholder="New password (min 6 characters)" required minLength={6} value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} />
          {passwordError && <p className="error">{passwordError}</p>}
          {passwordMessage && <p className="hint">{passwordMessage}</p>}
          <button className="btn btn--primary" type="submit">Change password</button>
        </form>
      )}
    </div>
  );
};
