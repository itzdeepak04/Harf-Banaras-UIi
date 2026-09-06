import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/admin.service';
import { AdminSummary } from '../../types/admin.types';
import { LoadingState } from '../../components/common/LoadingState';

export const AdminDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService
      .adminSummary()
      .then(setSummary)
      .catch(() => setError('Could not load the dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading dashboard" variant="page" />;
  if (error) return <p className="error">{error}</p>;
  if (!summary) return null;

  const cards: { label: string; value: string | number; alert?: boolean }[] = [
    { label: 'Total Sales', value: `₹${summary.totalSales.toLocaleString('en-IN')}` },
    { label: 'Total Orders', value: summary.totalOrders },
    { label: 'Average Order Value', value: `₹${summary.averageOrderValue.toFixed(0)}` },
    { label: 'New Customers (30d)', value: summary.newCustomers30d },
    { label: 'Pending Orders', value: summary.pendingOrders },
    { label: 'Pending Returns', value: summary.pendingReturns, alert: summary.pendingReturns > 0 },
    { label: 'Low Stock Products', value: summary.lowStockProducts, alert: summary.lowStockProducts > 0 },
    { label: 'Out of Stock Products', value: summary.outOfStockProducts, alert: summary.outOfStockProducts > 0 },
  ];

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>
      <div className="admin-summary-grid">
        {cards.map((c) => (
          <div className={`summary-card${c.alert ? ' summary-card--alert' : ''}`} key={c.label}>
            <span className="summary-card__value">{c.value}</span>
            <span className="summary-card__label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
