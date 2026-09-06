import React, { useEffect, useState } from 'react';
import { couponService } from '../../services/admin.service';
import { Coupon, CreateCouponPayload, CouponType } from '../../types/admin.types';
import { LoadingState } from '../../components/common/LoadingState';

const emptyForm: CreateCouponPayload = {
  code: '',
  type: 'percentage',
  value: 10,
  minOrderValue: 0,
  maxDiscount: 0,
  expiresAt: '',
  usageLimit: 0,
  description: '',
};

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CreateCouponPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    couponService
      .list()
      .then(setCoupons)
      .catch(() => setError('Could not load coupons.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await couponService.update(editingId, {
          value: form.value,
          minOrderValue: form.minOrderValue,
          maxDiscount: form.maxDiscount,
          expiresAt: form.expiresAt,
          usageLimit: form.usageLimit,
          description: form.description,
        });
      } else {
        await couponService.create({ ...form, code: form.code.toUpperCase() });
      }
      resetForm();
      load();
    } catch {
      window.alert('Could not save this coupon. Check the code is unique and fields are valid.');
    }
  };

  const handleEdit = (c: Coupon) => {
    setEditingId(c._id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderValue: c.minOrderValue,
      maxDiscount: c.maxDiscount,
      expiresAt: c.expiresAt.slice(0, 10),
      usageLimit: c.usageLimit,
      description: c.description,
    });
  };

  const handleToggleActive = async (c: Coupon) => {
    const updated = await couponService.update(c._id, { isActive: !c.isActive });
    setCoupons((prev) => prev.map((x) => (x._id === c._id ? updated : x)));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this coupon permanently?')) return;
    await couponService.remove(id);
    setCoupons((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="admin-page">
      <h2>Coupons</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? `Edit ${form.code}` : 'Create a new coupon'}</h3>
        <div className="admin-form__row">
          <input
            placeholder="CODE"
            value={form.code}
            disabled={!!editingId}
            required
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <select
            value={form.type}
            disabled={!!editingId}
            onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat (₹)</option>
          </select>
          <input
            type="number"
            placeholder={form.type === 'percentage' ? 'Value (%)' : 'Value (₹)'}
            value={form.value}
            required
            min={0}
            onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
          />
        </div>
        <div className="admin-form__row">
          <input
            type="number"
            placeholder="Minimum order value (₹, optional)"
            value={form.minOrderValue || ''}
            min={0}
            onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Maximum discount (₹, optional)"
            value={form.maxDiscount || ''}
            min={0}
            onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Usage limit (optional)"
            value={form.usageLimit || ''}
            min={0}
            onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
          />
        </div>
        <div className="admin-form__row">
          <label>
            Expires:{' '}
            <input
              type="date"
              value={form.expiresAt}
              required
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </label>
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="admin-form__actions">
          <button className="btn btn--primary" type="submit">{editingId ? 'Save changes' : 'Create coupon'}</button>
          {editingId && <button className="btn btn--text" type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {loading && <LoadingState label="Loading coupons" variant="section" />}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Expires</th><th>Active</th><th></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id}>
                <td>{c.code}</td>
                <td>{c.type}</td>
                <td>{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                <td>₹{c.minOrderValue}</td>
                <td>{c.timesUsed}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
                <td>{new Date(c.expiresAt).toLocaleDateString()}</td>
                <td>{c.isActive ? 'Yes' : 'No'}</td>
                <td className="admin-table__actions">
                  <button className="btn btn--text" onClick={() => handleEdit(c)}>Edit</button>
                  <button className="btn btn--text" onClick={() => handleToggleActive(c)}>
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn--text" onClick={() => handleDelete(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={8}>No coupons yet.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
};
