import React, { useEffect, useState } from 'react';
import { adminOrderService } from '../../services/admin.service';
import { Order } from '../../types/common.types';
import { LoadingState } from '../../components/common/LoadingState';

const STATUSES = [
  'placed',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'return_requested',
  'returned',
];

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = (status?: string) => {
    setLoading(true);
    adminOrderService
      .list(status || undefined)
      .then(setOrders)
      .catch(() => setError('Could not load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilter = (status: string) => {
    setStatusFilter(status);
    load(status);
  };

  const handleStatusChange = async (id: string, status: string) => {
    setSavingId(id);
    try {
      const updated = await adminOrderService.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch {
      window.alert('Could not update this order\u2019s status.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-page">
      <h2>Orders</h2>

      <div className="admin-page__filters">
        <label>
          Filter by status:{' '}
          <select value={statusFilter} onChange={(e) => handleFilter(e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <LoadingState label="Loading orders" variant="section" />}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Customer Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.orderNumber}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>₹{order.total}</td>
                <td>{order.paymentMethod.toUpperCase()} · {order.paymentStatus}</td>
                <td>
                  <span className={`order-card__status order-card__status--${order.status}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <select
                    disabled={savingId === order._id}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6}>No orders match this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
