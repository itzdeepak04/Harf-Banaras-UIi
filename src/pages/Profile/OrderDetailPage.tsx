import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { Order } from '../../types/common.types';
import { LoadingState } from '../../components/common/LoadingState';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    orderService.getById(id).then(setOrder).catch(() => setError('This order could not be found.'));
  }, [id]);

  if (error) return <p className="page-status">{error}</p>;
  if (!order) return <LoadingState label="Loading order details" variant="page" />;

  const history = order.statusHistory || [{ status: order.status, at: order.createdAt }];

  return (
    <div className="order-detail-page">
      <Link className="order-detail-page__back" to="/profile">← Back to profile</Link>
      <div className="order-detail-page__header">
        <div>
          <p className="eyebrow">Your order</p>
          <h1>{order.orderNumber}</h1>
          <p>Placed {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <span className="order-detail-page__status">{order.status.replace(/_/g, ' ')}</span>
      </div>

      <div className="order-detail-page__layout">
        <div>
          <section className="order-detail-page__panel order-detail-page__tracking">
            <div className="order-detail-page__panel-heading"><h2>Order tracking</h2><span>{history.length} update{history.length === 1 ? '' : 's'}</span></div>
        <ol>
          {history.map((entry, index) => (
            <li key={`${entry.status}-${entry.at}-${index}`}>
              <span className="order-detail-page__timeline-dot" />
              <div><strong>{entry.status.replace(/_/g, ' ')}</strong>
              <span>{new Date(entry.at).toLocaleString()}</span>
              {entry.note && <p>{entry.note}</p>}
              </div>
            </li>
          ))}
        </ol>
          </section>

          <section className="order-detail-page__panel">
            <div className="order-detail-page__panel-heading"><h2>Items in your order</h2><span>{order.items.length}</span></div>
            <div className="order-detail-page__items">
          {order.items.map((item, index) => (
            <div className="order-detail-page__item" key={`${item.product}-${index}`}>
              <div className="order-detail-page__item-mark">{item.name.slice(0, 1).toUpperCase()}</div>
              <div><strong>{item.name}</strong><span>Quantity {item.quantity} · ₹{item.unitPrice} each</span></div>
              <b>₹{item.unitPrice * item.quantity}</b>
            </div>
          ))}
            </div>
          </section>
        </div>

        <aside className="order-detail-page__aside">
          <section className="order-detail-page__panel">
            <h2>Delivering to</h2>
            <p className="order-detail-page__address-name">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p>{order.shippingAddress.phone}</p>
          </section>
          <section className="order-detail-page__panel order-detail-page__total">
            <h2>Payment summary</h2>
            <div><span>Subtotal</span><b>₹{order.subtotal}</b></div>
            <div><span>Shipping</span><b>₹{order.shippingFee}</b></div>
            <div><span>Tax</span><b>₹{order.tax}</b></div>
            {!!order.discount && order.discount > 0 && <div><span>Discount</span><b>-₹{order.discount}</b></div>}
            <div className="order-detail-page__grand-total"><span>Total</span><b>₹{order.total}</b></div>
            <p className="order-detail-page__payment-method">Cash on Delivery</p>
          </section>
        </aside>
      </div>
    </div>
  );
};
