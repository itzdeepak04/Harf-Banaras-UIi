import React from 'react';

interface Props {
  label?: string;
  variant?: 'page' | 'section' | 'inline';
}

export const LoadingState: React.FC<Props> = ({ label = 'Loading', variant = 'section' }) => (
  <span className={`loading-state loading-state--${variant}`} role="status" aria-live="polite">
    <span className="loading-state__mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
    <span className="loading-state__label">{label}</span>
  </span>
);
