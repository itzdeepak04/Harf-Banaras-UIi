import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

// The backend currently returns a `devToken` in the response body instead of
// emailing/texting a reset link (see README "NOT yet built"). Until a real
// mail/SMS provider is wired in, we surface that token directly in the UI so
// the reset flow is still testable end-to-end.
export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [devToken, setDevToken] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errors = { identifier: identifier.trim() ? '' : 'Email or mobile is required.' };
    setFieldErrors(errors);
    if (errors.identifier) return;
    try {
      const result: any = await authService.forgotPassword(identifier);
      setMessage(result?.message || 'If an account exists, reset instructions were generated.');
      if (result?.devToken) {
        setDevToken(result.devToken);
        setResetToken(result.devToken);
      }
      setStep('reset');
    } catch {
      setError('Something went wrong. Please check the email/mobile and try again.');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await authService.resetPassword(resetToken, newPassword);
      navigate('/login');
    } catch {
      setError('That reset token is invalid or has expired.');
    }
  };

  if (step === 'reset') {
    return (
      <form className="auth-form" onSubmit={handleReset}>
        <h2>Reset your password</h2>
        {message && <p className="hint">{message}</p>}
        {devToken && (
          <p className="hint">
            Dev mode: no email/SMS provider is configured yet, so your reset token is shown here
            directly: <code>{devToken}</code>
          </p>
        )}
        <label className="form-field">Reset token *
        <input aria-invalid={Boolean(fieldErrors.resetToken)}
          placeholder="Reset token"
          value={resetToken}
          onChange={(e) => setResetToken(e.target.value)}
          required
        />
        {fieldErrors.resetToken && <span className="field-error">{fieldErrors.resetToken}</span>}
        </label>
        <label className="form-field">New password *
        <input
          type="password"
          placeholder="New password (min 6 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
          required
        />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn--primary" type="submit">Reset password</button>
      </form>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleRequest}>
      <h2>Forgot password</h2>
      <p>Enter the email or mobile number on your account.</p>
      <label className="form-field">Email or mobile *
      <input aria-invalid={Boolean(fieldErrors.identifier)}
        placeholder="Email or mobile"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
      />
      {fieldErrors.identifier && <span className="field-error">{fieldErrors.identifier}</span>}
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn btn--primary" type="submit">Send reset instructions</button>
      <p>
        Remembered it? <Link to="/login">Back to login</Link>
      </p>
    </form>
  );
};
