import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SearchOutlined, UploadOutlined, DownloadOutlined, InboxOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { dashboardService, adminProductService } from '../../services/admin.service';
import { InventorySummary } from '../../types/admin.types';
import { Product, ProductListResponse } from '../../types/product.types';
import { LoadingState } from '../../components/common/LoadingState';

const PAGE_SIZE = 8;

const STOCK_STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  in_stock:    { label: 'In Stock',    color: '#065f46', bg: '#d1fae5', icon: <CheckCircleOutlined /> },
  low_stock:   { label: 'Low Stock',   color: '#92400e', bg: '#fef3c7', icon: <WarningOutlined /> },
  out_of_stock:{ label: 'Out of Stock',color: '#991b1b', bg: '#fee2e2', icon: <InboxOutlined /> },
};

export const InventoryPage: React.FC = () => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [productsLoading, setProductsLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState('');
  const [adjusting, setAdjusting] = useState<Record<string, { qty: string; reason: string }>>({});
  const [adjustingSaving, setAdjustingSaving] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load summary once ──────────────────────────────────────────────────────
  useEffect(() => {
    setSummaryLoading(true);
    dashboardService.inventorySummary()
      .then(setSummary)
      .catch(() => setError('Could not load inventory summary.'))
      .finally(() => setSummaryLoading(false));
  }, []);

  // ── Load products (paginated) ──────────────────────────────────────────────
  const loadProducts = useCallback((query: string, pg: number) => {
    setProductsLoading(true);
    adminProductService
      .list({ search: query, page: String(pg), limit: String(PAGE_SIZE) })
      .then((res: ProductListResponse) => {
        setProducts(res.items);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch(() => setError('Could not load products.'))
      .finally(() => setProductsLoading(false));
  }, []);

  // Initial load
  useEffect(() => {
    loadProducts('', 1);
  }, [loadProducts]);

  // ── Debounced search ───────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      loadProducts(val, 1);
    }, 500);
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const goToPage = (pg: number) => {
    if (pg < 1 || pg > totalPages) return;
    setPage(pg);
    loadProducts(search, pg);
  };

  // ── Stock adjustment ───────────────────────────────────────────────────────
  const handleFieldChange = (productId: string, field: 'qty' | 'reason', value: string) => {
    setAdjusting((prev) => ({
      ...prev,
      [productId]: { qty: prev[productId]?.qty || '', reason: prev[productId]?.reason || '', [field]: value },
    }));
  };

  const handleAdjust = async (productId: string) => {
    const entry = adjusting[productId];
    const qty = Number(entry?.qty);
    if (!qty || !entry?.reason) {
      window.alert('Enter a non-zero quantity change and a reason.');
      return;
    }
    setAdjustingSaving(productId);
    try {
      const updated = await adminProductService.adjustStock(productId, qty, entry.reason);
      setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
      setAdjusting((prev) => ({ ...prev, [productId]: { qty: '', reason: '' } }));
      // Refresh summary silently
      dashboardService.inventorySummary().then(setSummary).catch(() => {});
    } catch {
      window.alert('Could not adjust stock for this product.');
    } finally {
      setAdjustingSaving(null);
    }
  };

  // ── CSV Export / Import ────────────────────────────────────────────────────
  const handleExport = async () => {
    const blob = await adminProductService.exportInventory();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const results = await adminProductService.importInventory(await file.text());
      const failures = results.filter((r) => !r.updated);
      window.alert(failures.length ? `${failures.length} row(s) failed to import.` : 'Inventory imported successfully.');
      loadProducts(search, page);
    } catch {
      window.alert('Could not import this CSV file.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  // ── Pagination range helper ────────────────────────────────────────────────
  const pageRange = () => {
    const range: (number | '…')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) range.push(i);
    } else {
      range.push(1);
      if (page > 3) range.push('…');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) range.push(i);
      if (page < totalPages - 2) range.push('…');
      range.push(totalPages);
    }
    return range;
  };

  return (
    <div className="inv-page">

      {/* ── Page title ── */}
      <div className="inv-page__title-row">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h2 className="inv-page__title">Inventory</h2>
        </div>
        <div className="inv-page__csv-actions">
          <button className="inv-btn inv-btn--outline" type="button" onClick={handleExport}>
            <DownloadOutlined aria-hidden="true" /> Export CSV
          </button>
          <label className="inv-btn inv-btn--outline">
            <UploadOutlined aria-hidden="true" /> {importing ? 'Importing…' : 'Import CSV'}
            <input type="file" accept=".csv,text/csv" hidden disabled={importing} onChange={handleImport} />
          </label>
          <span className="inv-csv-hint">Columns: sku, changeQuantity, reason</span>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {/* ── Summary cards ── */}
      {summaryLoading ? (
        <LoadingState label="Loading summary" variant="section" />
      ) : summary && (
        <div className="inv-summary-grid">
          {[
            { value: summary.totalActive, label: 'Active Products',  alert: false, icon: '📦' },
            { value: summary.addedToday,  label: 'Added Today',       alert: false, icon: '🆕' },
            { value: summary.lowStock,    label: 'Low Stock',         alert: summary.lowStock > 0, icon: '⚠️' },
            { value: summary.outOfStock,  label: 'Out of Stock',      alert: summary.outOfStock > 0, icon: '🚫' },
            { value: summary.drafts,      label: 'Drafts',            alert: false, icon: '📝' },
          ].map((card) => (
            <div key={card.label} className={`inv-summary-card${card.alert ? ' inv-summary-card--alert' : ''}`}>
              <span className="inv-summary-card__icon">{card.icon}</span>
              <span className="inv-summary-card__value">{card.value}</span>
              <span className="inv-summary-card__label">{card.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Products section ── */}
      <div className="inv-products-section">
        <div className="inv-products-header">
          <div>
            <h3 className="inv-products-title">Products &amp; Stock Adjustment</h3>
            {!productsLoading && (
              <p className="inv-products-count">
                {total} product{total !== 1 ? 's' : ''}
                {search ? ` matching "${search}"` : ''}
              </p>
            )}
          </div>
          {/* Search — debounced, no submit button */}
          <div className="inv-search-wrap">
            <SearchOutlined className="inv-search-icon" aria-hidden="true" />
            <input
              className="inv-search-input"
              type="search"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={handleSearchChange}
              aria-label="Search products"
            />
            {productsLoading && <span className="inv-search-spinner" aria-label="Searching" />}
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrapper inv-table-wrapper">
          <table className="admin-table inv-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Adjust (+/−)</th>
                <th>Reason</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productsLoading ? (
                <tr>
                  <td colSpan={7} className="inv-table__loading-cell">
                    <LoadingState label="Loading products" variant="section" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="inv-table__empty-cell">
                    <span className="inv-table__empty-icon">🔍</span>
                    <span>No products found{search ? ` for "${search}"` : ''}.</span>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const meta = STOCK_STATUS_META[p.stockStatus] || STOCK_STATUS_META['out_of_stock'];
                  const isSaving = adjustingSaving === p._id;
                  return (
                    <tr key={p._id} className="inv-table__row">
                      <td className="inv-table__name-cell">
                        <div className="inv-product-mark" aria-hidden="true">
                          {p.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <span className="inv-product-name">{p.name}</span>
                          {p.fabric && <span className="inv-product-fabric">{p.fabric}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="inv-sku-badge">{p.sku}</span>
                      </td>
                      <td>
                        <span className={`inv-stock-num${p.availableQuantity === 0 ? ' inv-stock-num--zero' : p.availableQuantity <= 3 ? ' inv-stock-num--low' : ''}`}>
                          {p.availableQuantity}
                        </span>
                      </td>
                      <td>
                        <span className="inv-status-badge" style={{ color: meta.color, background: meta.bg }}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td>
                        <input
                          className="inv-adjust-input"
                          type="number"
                          value={adjusting[p._id]?.qty || ''}
                          onChange={(e) => handleFieldChange(p._id, 'qty', e.target.value)}
                          placeholder="±qty"
                          aria-label={`Adjust quantity for ${p.name}`}
                        />
                      </td>
                      <td>
                        <input
                          className="inv-reason-input"
                          value={adjusting[p._id]?.reason || ''}
                          onChange={(e) => handleFieldChange(p._id, 'reason', e.target.value)}
                          placeholder="Reason (required)"
                          aria-label={`Reason for ${p.name}`}
                        />
                      </td>
                      <td>
                        <button
                          className={`inv-apply-btn${isSaving ? ' inv-apply-btn--saving' : ''}`}
                          onClick={() => handleAdjust(p._id)}
                          disabled={isSaving}
                        >
                          {isSaving ? '…' : 'Apply'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && !productsLoading && (
          <div className="inv-pagination">
            <button
              className="inv-pagination__btn"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              ← Prev
            </button>
            <div className="inv-pagination__pages">
              {pageRange().map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} className="inv-pagination__ellipsis">…</span>
                ) : (
                  <button
                    key={p}
                    className={`inv-pagination__page${page === p ? ' inv-pagination__page--active' : ''}`}
                    onClick={() => goToPage(p as number)}
                    aria-current={page === p ? 'page' : undefined}
                  >
                    {p}
                  </button>
                )
              )}
            </div>
            <button
              className="inv-pagination__btn"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              Next →
            </button>
            <span className="inv-pagination__info">
              Page {page} of {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* ── Recent Stock Movements ── */}
      <div className="inv-movements-section">
        <h3 className="inv-products-title">Recent Stock Movements</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table inv-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Change</th>
                <th>Reason</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {summary?.recentMovements.map((m) => (
                <tr key={m._id} className="inv-table__row">
                  <td>{new Date(m.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{typeof m.product === 'string' ? m.product : m.product?.name}</td>
                  <td>
                    <span className={`inv-change-badge${m.changeQuantity > 0 ? ' inv-change-badge--pos' : ' inv-change-badge--neg'}`}>
                      {m.changeQuantity > 0 ? `+${m.changeQuantity}` : m.changeQuantity}
                    </span>
                  </td>
                  <td>{m.reason}</td>
                  <td>{typeof m.performedBy === 'string' ? m.performedBy : m.performedBy?.name}</td>
                </tr>
              ))}
              {(!summary || summary.recentMovements.length === 0) && (
                <tr><td colSpan={5} className="inv-table__empty-cell">No stock movements yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
