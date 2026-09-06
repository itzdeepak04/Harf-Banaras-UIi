import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchCart, updateCartQuantity, removeFromCart } from '../../redux/features/cart/cart.slice';
import { LoadingState } from '../../components/common/LoadingState';

const CartImage: React.FC<{ product: any }> = ({ product }) => {
  const [failed, setFailed] = React.useState(false);
  const image = product.imageUrls?.[0] || product.images?.[0];

  return image && !failed ? (
    <img src={image} alt={product.name} onError={() => setFailed(true)} />
  ) : (
    <div className="cart-page__image-placeholder" role="img" aria-label={`${product.name} image unavailable`}>
      <span>{product.name.slice(0, 1).toUpperCase()}</span>
      <small>Harf Banaras</small>
    </div>
  );
};

export const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((s) => s.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  if (loading) return <LoadingState label="Loading your cart" variant="page" />;
  if (cart.items.length === 0) return (
    <div className="cart-page cart-page--empty">
      <p className="eyebrow">Your edit awaits</p>
      <h1>Your cart is empty</h1>
      <p>Find a handwoven piece to make your next occasion unforgettable.</p>
      <Link to="/shop" className="btn btn--primary">Explore the collection</Link>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="cart-page__heading">
        <div>
          <p className="eyebrow">Your selection</p>
          <h1>Shopping bag</h1>
          <p>{cart.itemCount} {cart.itemCount === 1 ? 'piece' : 'pieces'} chosen for you.</p>
        </div>
        <Link to="/shop" className="btn btn--text">Continue shopping</Link>
      </div>
      <div className="cart-page__layout">
        <div className="cart-page__items">
          {cart.items.map((item) => (
            <div key={item.product._id} className="cart-page__item">
              <Link to={`/product/${item.product._id}`} className="cart-page__media">
                <CartImage product={item.product} />
              </Link>
              <div className="cart-page__item-details">
                <div className="cart-page__item-heading">
                  <div>
                    <p className="cart-page__eyebrow">{item.product.fabric || 'Handwoven saree'}</p>
                    <h2>{item.product.name}</h2>
                  </div>
                  <strong>₹{item.lineTotal}</strong>
                </div>
                <p className="cart-page__unit-price">₹{item.unitPrice} each</p>
                <div className="cart-page__item-actions">
                  <div className="stepper">
                    <button
                      aria-label={`Decrease quantity of ${item.product.name}`}
                      onClick={() =>
                        dispatch(updateCartQuantity({ productId: item.product._id, quantity: item.quantity - 1 }))
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Increase quantity of ${item.product.name}`}
                      onClick={() =>
                        dispatch(updateCartQuantity({ productId: item.product._id, quantity: item.quantity + 1 }))
                      }
                      disabled={item.quantity >= item.product.availableQuantity}
                    >
                      +
                    </button>
                  </div>
                  <button className="cart-page__remove" onClick={() => dispatch(removeFromCart(item.product._id))}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-page__summary">
          <p className="cart-page__summary-label">Order summary</p>
          <div className="cart-page__summary-row"><span>Subtotal</span><strong>₹{cart.subtotal}</strong></div>
          <p className="cart-page__summary-note">Shipping and taxes are calculated at checkout.</p>
          <Link to="/checkout" className="btn btn--primary">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
};
