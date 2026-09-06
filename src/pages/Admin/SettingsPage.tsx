import React, { useEffect, useState } from 'react';
import { settingsService } from '../../services/admin.service';
import { StoreSettings } from '../../types/admin.types';
import { LoadingState } from '../../components/common/LoadingState';

export const SettingsPage: React.FC = () => {
  const [form, setForm] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsService
      .get()
      .then(setForm)
      .catch(() => setError('Could not load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await settingsService.update(form);
      setForm(updated);
      setSaved(true);
    } catch {
      setError('Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading store settings" variant="page" />;
  if (error && !form) return <p className="error">{error}</p>;
  if (!form) return null;

  return (
    <div className="admin-page">
      <h2>Store Settings</h2>
      <p>These values drive shipping and tax calculation on every order (see backend Settings module).</p>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form__row">
          <label>
            Flat shipping fee (₹)
            <input
              type="number"
              min={0}
              value={form.flatShippingFee}
              onChange={(e) => setForm({ ...form, flatShippingFee: Number(e.target.value) })}
            />
          </label>
          <label>
            Free shipping threshold (₹)
            <input
              type="number"
              min={0}
              value={form.freeShippingThreshold}
              onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
            />
          </label>
          <label>
            Tax (%)
            <input
              type="number"
              min={0}
              max={100}
              value={form.taxPercent}
              onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) })}
            />
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        {saved && <p className="admin-page__saved">Settings saved.</p>}
        <button className="btn btn--primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  );
};
