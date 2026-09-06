import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { LoadingState } from '../../components/common/LoadingState';
import { fetchWishlist, removeFromWishlist } from '../../redux/features/wishlist/wishlist.slice';
import { addToCart } from '../../redux/features/cart/cart.slice';

const WishlistImage: React.FC<{ product: any }> = ({ product }) => {
  const [failed, setFailed] = useState(false);
  const image = product.imageUrls?.[0] || product.images?.[0];

  return image && !failed ? (
    <img src={image} alt={product.name} onError={() => setFailed(true)} />
  ) : (
    <div className="wishlist-card__placeholder" role="img" aria-label={`${product.name} image unavailable`}>
      <span>{product.name.slice(0, 1).toUpperCase()}</span>
      <small>Harf Banaras</small>
    </div>
  );
};

export const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = (productName: string, productId: string) => {
    if (window.confirm(`Are you sure you want to remove ${productName} from your wishlist?`)) {
      dispatch(removeFromWishlist(productId));
    }
  };

  if (loading && products.length === 0) return <LoadingState label="Loading your wishlist" variant="page" />;

  if (products.length === 0) {
    return (
      <div className="wishlist-page wishlist-page--empty">
        <p className="eyebrow">Saved for later</p>
        <h2>Your wishlist is empty</h2>
        <p>Save sarees you love and come back to them anytime.</p>
        <Link to="/shop" className="btn btn--primary">Browse the collection</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-page__heading">
        <div>
          <p className="eyebrow">Saved for later</p>
          <h1>Your wishlist</h1>
          <p>Keep the pieces that caught your eye close at hand.</p>
        </div>
        <span className="wishlist-page__count">{products.length} {products.length === 1 ? 'piece' : 'pieces'}</span>
      </div>
      <div className="wishlist-page__grid">
        {products.map((product) => {
          const price = product.discountPrice > 0 ? product.discountPrice : product.sellingPrice;
          return (
            <div className="wishlist-card" key={product._id}>
              <Link to={`/product/${product._id}`} className="wishlist-card__media">
                <WishlistImage product={product} />
              </Link>
              <p className="wishlist-card__fabric">{product.fabric || 'Handwoven saree'}</p>
              <h3 className="wishlist-card__name">
                <Link to={`/product/${product._id}`}>{product.name}</Link>
              </h3>
              <p className="wishlist-card__price">₹{price}</p>
              <div className="wishlist-card__actions">
                <button
                  className="btn btn--primary"
                  disabled={product.stockStatus === 'out_of_stock'}
                  onClick={() => dispatch(addToCart({ productId: product._id, quantity: 1 }))}
                >
                  {product.stockStatus === 'out_of_stock' ? 'Sold Out' : 'Add to Cart'}
                </button>
                <button
                  className="btn btn--text wishlist-card__remove"
                  onClick={() => handleRemove(product.name, product._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
