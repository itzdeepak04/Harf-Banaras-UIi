import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchProducts } from '../../redux/features/products/products.slice';
import { ProductCard } from '../../components/product/ProductCard';
import { LoadingState } from '../../components/common/LoadingState';

export const ShopPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((s) => s.products);
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);
  const filterQuery = searchParams.toString();

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => (params[key] = value));
    params.sort = sort;
    params.page = String(page);
    params.limit = '5';
    dispatch(fetchProducts(params));
  }, [dispatch, filterQuery, page, searchParams, sort]);

  useEffect(() => {
    setPage(1);
  }, [filterQuery, sort]);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="shop-page">
      <div className="shop-page__heading">
        <div>
          <p className="eyebrow">The collection</p>
          <h1>Shop sarees</h1>
          <p>Discover handwoven Banarasi pieces made for memorable moments.</p>
        </div>
      </div>
      <div className="shop-page__toolbar">
        <div className="shop-page__sort">
          <label htmlFor="shop-sort">Sort by</label>
          <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="best_selling">Best Selling</option>
          </select>
        </div>
        {list && <span className="shop-page__count">{list.total} {list.total === 1 ? 'style' : 'styles'}</span>}
      </div>

      {loading && <LoadingState label="Loading sarees" variant="section" />}

      <div className="shop-page__grid">
        {list?.items.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {!loading && list?.items.length === 0 && <p>No sarees match your filters.</p>}

      {!loading && list && list.totalPages > 1 && (
        <nav className="shop-pagination" aria-label="Product pages">
          <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <div className="shop-pagination__pages">
            {Array.from({ length: list.totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={pageNumber === page ? 'active' : ''}
                aria-current={pageNumber === page ? 'page' : undefined}
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => goToPage(page + 1)} disabled={page === list.totalPages}>
            Next
          </button>
        </nav>
      )}
    </div>
  );
};
