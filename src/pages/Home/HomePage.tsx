import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchProducts } from '../../redux/features/products/products.slice';
import { ProductCard } from '../../components/product/ProductCard';
import { LoadingState } from '../../components/common/LoadingState';

const SHOP_BY_TYPE = [
  { label: 'Katan Silk', query: 'sareeType=katan-silk' },
  { label: 'Organza', query: 'sareeType=organza' },
  { label: 'Georgette', query: 'sareeType=georgette' },
  { label: 'Tussar Silk', query: 'sareeType=tussar-silk' },
];

const SHOP_BY_OCCASION = [
  { label: 'Bridal', query: 'occasion=bridal' },
  { label: 'Festive', query: 'occasion=festive' },
  { label: 'Party Wear', query: 'occasion=party-wear' },
  { label: 'Casual', query: 'occasion=casual' },
];

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ isBestSeller: 'true', limit: '8' }));
  }, [dispatch]);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">The art of Banaras</p>
          <h1>Harf Banaras</h1>
          <p>Timeless Banarasi sarees, handwoven with tradition.</p>
          <div className="home-hero__actions">
            <Link to="/shop" className="btn btn--primary">Shop the Collection</Link>
            <Link to="/heritage" className="home-hero__link">Discover our story <span>→</span></Link>
          </div>
        </div>
        <div className="home-hero__seal" aria-hidden="true"><span>HB</span><small>Handwoven<br />in Banaras</small></div>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <div><p className="eyebrow">Find your texture</p><h2>Shop by Saree Type</h2></div>
          <Link to="/shop" className="home-section__link">View all <span>→</span></Link>
        </div>
        <div className="home-section__cards">
          {SHOP_BY_TYPE.map((c, index) => (
            <Link key={c.label} to={`/shop?${c.query}`} className="home-category-card">
              <span className="home-category-card__number">0{index + 1}</span>
              <strong>{c.label}</strong>
              <span className="home-category-card__arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-section--occasion">
        <div className="home-section__heading">
          <div><p className="eyebrow">Made for the moment</p><h2>Shop by Occasion</h2></div>
          <Link to="/shop" className="home-section__link">View all <span>→</span></Link>
        </div>
        <div className="home-section__cards">
          {SHOP_BY_OCCASION.map((c, index) => (
            <Link key={c.label} to={`/shop?${c.query}`} className="home-category-card">
              <span className="home-category-card__number">0{index + 1}</span>
              <strong>{c.label}</strong>
              <span className="home-category-card__arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <div><p className="eyebrow">Loved by our community</p><h2>Best Sellers</h2></div>
          <Link to="/shop?isBestSeller=true" className="home-section__link">Shop best sellers <span>→</span></Link>
        </div>
        {loading && <LoadingState label="Curating the collection" variant="section" />}
        <div className="home-section__grid">
          {list?.items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        {!loading && list?.items.length === 0 && (
          <p>No best sellers yet — run the seed script to populate sample products.</p>
        )}
      </section>

      <section className="home-heritage">
        <div className="home-heritage__mark" aria-hidden="true">HB</div>
        <div className="home-heritage__content">
          <p className="eyebrow">Our heritage</p>
          <h2>From loom to loved one.</h2>
          <p>Every Harf Banaras saree is handwoven in Varanasi by master artisans carrying generations-old zari and brocade techniques.</p>
          <Link to="/heritage" className="home-section__link">Read our story <span>→</span></Link>
        </div>
      </section>

      {/*
        Hero image slider, testimonials, and a lookbook section from the
        original brief are not built yet — this pass wires the data-driven
        parts (best sellers, category links) using the existing products
        slice. See README "NOT yet built" for the rest.
      */}
    </div>
  );
};
