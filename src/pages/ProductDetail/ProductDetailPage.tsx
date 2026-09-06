import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product.types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addToCart, updateCartQuantity } from '../../redux/features/cart/cart.slice';
import { addToWishlist, removeFromWishlist } from '../../redux/features/wishlist/wishlist.slice';
import { reviewService } from '../../services/review.service';
import { Review } from '../../types/common.types';
import { ProductCard } from '../../components/product/ProductCard';
import { LoadingState } from '../../components/common/LoadingState';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const cartItem = useAppSelector((s) =>
    s.cart.cart.items.find((i) => i.product?._id === id),
  );
  const isWishlisted = useAppSelector((s) => s.wishlist.products.some((p) => p._id === id));
  const quantity = cartItem?.quantity || 0;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productService
      .getById(id)
      .then((p) => {
        setProduct(p);
        setActiveImage(0);
        setImageFailed(false);
        return Promise.all([productService.related(p._id), reviewService.forProduct(p._id)]);
      })
      .then(([relatedProducts, productReviews]) => {
        setRelated(relatedProducts);
        setReviews(productReviews);
      })
      .catch(() => setError('This saree could not be found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const checkPincode = () => {
    // Placeholder delivery estimate — a real pincode/serviceability check
    // (backend endpoint) is not implemented yet.
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeMessage('Enter a valid 6-digit pincode.');
      return;
    }
    setPincodeMessage('Estimated delivery in 4–6 business days.');
  };

  const toggleWishlist = () => {
    const action = isWishlisted ? 'remove this saree from' : 'add this saree to';
    if (window.confirm(`Are you sure you want to ${action} your wishlist?`)) {
      dispatch(isWishlisted ? removeFromWishlist(product!._id) : addToWishlist(product!._id));
    }
  };

  if (loading) return <LoadingState label="Loading saree details" variant="page" />;
  if (error || !product) return <p className="page-status">{error || 'Product not found.'}</p>;

  const price = product.discountPrice > 0 ? product.discountPrice : product.sellingPrice;
  const soldOut = product.stockStatus === 'out_of_stock';
  const images = product.imageUrls?.length ? product.imageUrls : product.images || [];

  return (
    <div className="product-detail">
      <div className="product-detail__gallery">
        {images[activeImage] && !imageFailed ? (
          <img
            src={images[activeImage]}
            alt={product.name}
            className="product-detail__main-image"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="product-detail__image-placeholder" role="img" aria-label={`${product.name} image unavailable`}>
            <span>{product.name.slice(0, 1).toUpperCase()}</span>
            <small>Harf Banaras</small>
          </div>
        )}
        {images.length > 1 && (
          <div className="product-detail__thumbnails">
            {images.map((img, i) => (
              <img
                key={img + i}
                src={img}
                alt={`${product.name} view ${i + 1}`}
                className={i === activeImage ? 'active' : ''}
                onClick={() => setActiveImage(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="product-detail__info">
        <h1>{product.name}</h1>
        <p className="product-detail__short-desc">{product.shortDescription}</p>

        <p className="product-detail__price">
          {product.discountPrice > 0 && (
            <span className="product-detail__original-price">₹{product.sellingPrice}</span>
          )}
          <span className="product-detail__current-price">₹{price}</span>
        </p>

        {product.stockStatus === 'low_stock' && (
          <p className="product-detail__low-stock">Only {product.availableQuantity} left in stock</p>
        )}

        <div className="product-detail__actions">
          {soldOut ? (
            <button className="btn btn--disabled" disabled>Sold Out</button>
          ) : quantity > 0 ? (
            <div className="stepper">
              <button onClick={() => dispatch(updateCartQuantity({ productId: product._id, quantity: quantity - 1 }))}>−</button>
              <span>{quantity}</span>
              <button
                disabled={quantity >= product.availableQuantity}
                onClick={() => dispatch(updateCartQuantity({ productId: product._id, quantity: quantity + 1 }))}
              >
                +
              </button>
            </div>
          ) : (
            <button className="btn btn--primary" onClick={() => dispatch(addToCart({ productId: product._id, quantity: 1 }))}>
              Add to Cart
            </button>
          )}
          <button
            className={`btn btn--outline${isWishlisted ? ' product-detail__wishlist-btn--active' : ''}`}
            onClick={toggleWishlist}
          >
            {isWishlisted ? '♥ Wishlisted' : '♡ Add to Wishlist'}
          </button>
        </div>

        <div className="product-detail__pincode">
          <input
            placeholder="Enter pincode for delivery estimate"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
          />
          <button className="btn" onClick={checkPincode}>Check</button>
          {pincodeMessage && <p className="hint">{pincodeMessage}</p>}
        </div>

        <table className="product-detail__specs">
          <tbody>
            <tr><td>Fabric</td><td>{product.fabric}</td></tr>
            <tr><td>Weave</td><td>{product.weave}</td></tr>
            <tr><td>Work</td><td>{product.workType} ({product.workIntensity})</td></tr>
            <tr><td>Colour</td><td>{product.colour}</td></tr>
            <tr><td>Pattern</td><td>{product.pattern}</td></tr>
            <tr><td>Zari Details</td><td>{product.zariDetails}</td></tr>
          </tbody>
        </table>

        <p className="product-detail__full-desc">{product.fullDescription}</p>

        {reviews.length > 0 && (
          <section className="product-detail__reviews">
            <h2>Customer reviews</h2>
            {reviews.map((review) => (
              <article className="review-card" key={review._id}>
                <strong>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</strong>
                {review.title && <h3>{review.title}</h3>}
                <p>{review.comment}</p>
                <small>{review.user?.name || 'Customer'}{review.isVerifiedPurchase ? ' · Verified purchase' : ''}</small>
              </article>
            ))}
          </section>
        )}

        {related.length > 0 && (
          <section className="product-detail__related">
            <h2>You may also like</h2>
            <div className="product-grid">
              {related.map((item) => <ProductCard key={item._id} product={item} />)}
            </div>
          </section>
        )}
        <p className="hint">
          <Link to="/shop">← Back to all sarees</Link>
        </p>
      </div>
    </div>
  );
};
