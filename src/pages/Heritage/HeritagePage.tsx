import React from 'react';
import { Link } from 'react-router-dom';

export const HeritagePage: React.FC = () => (
  <div className="heritage-page">
    <section className="heritage-page__hero">
      <div>
        <p className="eyebrow">Our heritage</p>
        <h1>Woven in Banaras. Carried through generations.</h1>
        <p>
          Harf Banaras celebrates the patient craft, luminous zari, and living traditions
          behind every handwoven saree.
        </p>
        <Link to="/shop" className="btn btn--primary">Explore the collection</Link>
      </div>
      <div className="heritage-page__loom" aria-hidden="true">
        <span>HB</span>
        <small>Since generations</small>
      </div>
    </section>

    <section className="heritage-page__story">
      <div>
        <p className="eyebrow">The craft</p>
        <h2>Every thread holds a story.</h2>
      </div>
      <div>
        <p>
          In the lanes of Varanasi, master weavers transform silk and zari into sarees
          with depth, movement, and unmistakable character. The process is deliberate:
          design is prepared, threads are aligned, and the loom brings the pattern to life.
        </p>
        <p>
          We choose pieces that honour this work and make it part of modern celebrations,
          family rituals, and everyday moments worth remembering.
        </p>
      </div>
    </section>

    <section className="heritage-page__values">
      <article><strong>01</strong><h3>Handwoven with care</h3><p>Made through skilled craftsmanship, not mass production.</p></article>
      <article><strong>02</strong><h3>Rooted in Banaras</h3><p>Inspired by the colour, texture, and artistry of Varanasi.</p></article>
      <article><strong>03</strong><h3>Made to be kept</h3><p>Timeless sarees chosen to become part of your story.</p></article>
    </section>
  </div>
);
