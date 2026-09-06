import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { login } from '../../redux/features/auth/auth.slice';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = {
      identifier: identifier.trim() ? '' : 'Email or mobile is required.',
      password: password ? '' : 'Password is required.',
    };
    setFieldErrors(errors);
    if (errors.identifier || errors.password) return;
    try {
      await dispatch(login({ identifier, password })).unwrap();
      navigate('/');
    } catch {
      setError('Invalid email/mobile or password');
    }
  };

  return (
    <form className="auth-form auth-form--login" onSubmit={handleSubmit}>
      <p className="auth-form__eyebrow">Welcome back</p>
      <h2>Login</h2>
      <p className="auth-form__intro">Sign in to continue your Harf Banaras journey.</p>
      <label className="form-field"><span>Email or mobile <b>*</b></span>
      <input
        aria-invalid={Boolean(fieldErrors.identifier)}
        placeholder="Email or mobile"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
      {fieldErrors.identifier && <span className="field-error">{fieldErrors.identifier}</span>}
      </label>
      <label className="form-field"><span>Password <b>*</b></span>
      <input
        aria-invalid={Boolean(fieldErrors.password)}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn btn--primary" type="submit">Login</button>
      <p>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </form>
  );
};
