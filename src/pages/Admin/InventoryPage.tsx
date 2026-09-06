import React, { useEffect, useState } from 'react';
import { dashboardService, adminProductService } from '../../services/admin.service';
import { InventorySummary } from '../../types/admin.types';
import { Product } from '../../types/product.types';
import { LoadingState } from '../../components/common/LoadingState';

export const InventoryPage: React.FC = () => {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adjusting, setAdjusting] = useState<Record<string, { qty: string; reason: string }>>({});
  const [importing, setImporting] = useState(false);

  const loadAll = (query = '') => {
    setLoading(true);
    Promise.all([
      dashboardService.inventorySummary(),
      adminProductService.list({ search: query, limit: '50' }),
    ])
      .then(([summaryRes, productsRes]) => {
        setSummary(summaryRes);
        setProducts(productsRes.items);
      })
      .catch(() => setError('Could not load inventory data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAll(search);
  };

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
    try {
      const updated = await adminProductService.adjustStock(productId, qty, entry.reason);
      setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
      setAdjusting((prev) => ({ ...prev, [productId]: { qty: '', reason: '' } }));
      loadAll(search); // refresh summary counts too
    } catch {
      window.alert('Could not adjust stock for this product.');
    }
  };

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
      const failures = results.filter((result) => !result.updated);
      window.alert(failures.length ? `${failures.length} row(s) failed to import.` : 'Inventory imported successfully.');
      loadAll(search);
    } catch {
      window.alert('Could not import this CSV file.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  if (loading) return <LoadingState label="Loading inventory" variant="page" />;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-page">
      <h2>Inventory</h2>

      {summary && (
        <div className="admin-summary-grid">
          <div className="summary-card"><span className="summary-card__value">{summary.totalActive}</span><span className="summary-card__label">Active Products</span></div>
          <div className="summary-card"><span className="summary-card__value">{summary.addedToday}</span><span className="summary-card__label">Added Today</span></div>
          <div className={`summary-card${summary.lowStock ? ' summary-card--alert' : ''}`}><span className="summary-card__value">{summary.lowStock}</span><span className="summary-card__label">Low Stock</span></div>
          <div className={`summary-card${summary.outOfStock ? ' summary-card--alert' : ''}`}><span className="summary-card__value">{summary.outOfStock}</span><span className="summary-card__label">Out of Stock</span></div>
          <div className="summary-card"><span className="summary-card__value">{summary.drafts}</span><span className="summary-card__label">Drafts</span></div>
        </div>
      )}

      <h3>Products &amp; Stock Adjustment</h3>
      <div className="admin-page__actions">
        <button className="btn btn--outline" type="button" onClick={handleExport}>Export CSV</button>
        <label className="btn btn--outline">
          {importing ? 'Importing…' : 'Import CSV'}
          <input type="file" accept=".csv,text/csv" hidden disabled={importing} onChange={handleImport} />
        </label>
        <small>Import columns: sku, changeQuantity, reason</small>
      </div>
      <form className="admin-page__search" onSubmit={handleSearch}>
        <input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn--primary" type="submit">Search</button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Adjust (+/-)</th>
            <th>Reason</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.availableQuantity}</td>
              <td>{p.stockStatus.replace(/_/g, ' ')}</td>
              <td>
                <input
                  type="number"
                  style={{ width: 70 }}
                  value={adjusting[p._id]?.qty || ''}
                  onChange={(e) => handleFieldChange(p._id, 'qty', e.target.value)}
                  placeholder="±qty"
                />
              </td>
              <td>
                <input
                  style={{ width: 160 }}
                  value={adjusting[p._id]?.reason || ''}
                  onChange={(e) => handleFieldChange(p._id, 'reason', e.target.value)}
                  placeholder="Reason (required)"
                />
              </td>
              <td>
                <button className="btn btn--primary" onClick={() => handleAdjust(p._id)}>Apply</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={7}>No products found.</td></tr>
          )}
        </tbody>
      </table>

      <h3>Recent Stock Movements</h3>
      <table className="admin-table">
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
            <tr key={m._id}>
              <td>{new Date(m.createdAt).toLocaleString()}</td>
              <td>{typeof m.product === 'string' ? m.product : m.product?.name}</td>
              <td style={{ color: m.changeQuantity < 0 ? 'var(--color-maroon)' : 'var(--color-emerald)' }}>
                {m.changeQuantity > 0 ? `+${m.changeQuantity}` : m.changeQuantity}
              </td>
              <td>{m.reason}</td>
              <td>{typeof m.performedBy === 'string' ? m.performedBy : m.performedBy?.name}</td>
            </tr>
          ))}
          {(!summary || summary.recentMovements.length === 0) && (
            <tr><td colSpan={5}>No stock movements yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
