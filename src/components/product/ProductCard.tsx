import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product.types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addToCart, updateCartQuantity } from '../../redux/features/cart/cart.slice';
import { addToWishlist, removeFromWishlist } from '../../redux/features/wishlist/wishlist.slice';

interface Props {
  product: Product;
}

// Implements: Add to Cart -> "- qty +" stepper, capped at availableQuantity,
// removes back to Add to Cart button at 0, shows "Only 1 left" and Sold Out state.
export const ProductCard: React.FC<Props> = ({ product }) => {
  const dispatch = useAppDispatch();
  const cartItem = useAppSelector((s) =>
    s.cart.cart.items.find((i) => i.product?._id === product._id),
  );
  const isWishlisted = useAppSelector((s) =>
    s.wishlist.products.some((p) => p._id === product._id),
  );
  const quantity = cartItem?.quantity || 0;
  const price = product.discountPrice > 0 ? product.discountPrice : product.sellingPrice;
  const soldOut = product.stockStatus === 'out_of_stock';
  const imageUrl = product.imageUrls?.[0] || product.images?.[0];
  const [imageFailed, setImageFailed] = useState(false);

  const handleAdd = () => dispatch(addToCart({ productId: product._id, quantity: 1 }));
  const handleIncrement = () =>
    dispatch(updateCartQuantity({ productId: product._id, quantity: quantity + 1 }));
  const handleDecrement = () =>
    dispatch(updateCartQuantity({ productId: product._id, quantity: quantity - 1 }));
  const toggleWishlist = () => {
    const action = isWishlisted ? 'remove this saree from' : 'add this saree to';
    if (window.confirm(`Are you sure you want to ${action} your wishlist?`)) {
      dispatch(isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product._id));
    }
  };

  return (
    <div className="product-card">
      <button
        className={`product-card__wishlist-btn${isWishlisted ? ' product-card__wishlist-btn--active' : ''}`}
        onClick={toggleWishlist}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isWishlisted ? '♥' : '♡'}
      </button>
      <Link to={`/product/${product._id}`}>
        <div className="product-card__media">
          {imageUrl && !imageFailed ? (
            <img src={imageUrl} alt={product.name} className="product-card__image" onError={() => setImageFailed(true)} />
          ) : (
            <div className="product-card__placeholder" aria-label={`${product.name} image unavailable`}>
              <span>{product.name.slice(0, 1).toUpperCase()}</span>
              <small>Harf Banaras</small>
            </div>
          )}
        </div>
        <div className="product-card__details">
          <p className="product-card__fabric">{product.fabric || 'Handwoven saree'}</p>
          <h3 className="product-card__name">{product.name}</h3>
        </div>
      </Link>
      <p className="product-card__price">
        {product.discountPrice > 0 && (
          <span className="product-card__original-price">₹{product.sellingPrice}</span>
        )}
        ₹{price}
      </p>

      {product.stockStatus === 'low_stock' && (
        <p className="product-card__low-stock">Only {product.availableQuantity} left</p>
      )}

      {soldOut ? (
        <button className="btn btn--disabled" disabled>
          Sold Out
        </button>
      ) : quantity > 0 ? (
        <div className="stepper">
          <button onClick={handleDecrement} aria-label="Decrease quantity">−</button>
          <span>{quantity}</span>
          <button
            onClick={handleIncrement}
            disabled={quantity >= product.availableQuantity}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      ) : (
        <button className="btn btn--primary" onClick={handleAdd}>
          Add to Cart
        </button>
      )}
    </div>
  );
};
