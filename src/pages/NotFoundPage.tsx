import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => (
  <div className="not-found-page">
    <div className="not-found-page__mark" aria-hidden="true">
      <span>404</span>
      <small>Harf Banaras</small>
    </div>
    <p className="eyebrow">A missing thread</p>
    <h1>This page could not be found.</h1>
    <p>The page may have moved, or the address may not be part of our collection.</p>
    <div className="not-found-page__actions">
      <Link to="/" className="btn btn--primary">Back to home</Link>
      <Link to="/shop" className="btn btn--outline">Explore sarees</Link>
    </div>
  </div>
);
