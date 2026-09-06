import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { register } from '../../redux/features/auth/auth.slice';

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'email' | 'mobile'>('email');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errors = {
      name: name.trim() ? '' : 'Full name is required.',
      identifier: identifier.trim() ? '' : `${identifierType === 'email' ? 'Email' : 'Mobile number'} is required.`,
      password: password.length >= 6 ? '' : 'Password must be at least 6 characters.',
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    try {
      const payload =
        identifierType === 'email'
          ? { name, email: identifier, password }
          : { name, mobile: identifier, password };
      await dispatch(register(payload)).unwrap();
      navigate('/');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Could not create account. Please try again.',
      );
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Create an account</h2>
      <label className="form-field">Full name *
      <input aria-invalid={Boolean(fieldErrors.name)} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
      </label>

      <div className="auth-form__toggle">
        <button
          type="button"
          className={identifierType === 'email' ? 'btn btn--primary' : 'btn'}
          onClick={() => setIdentifierType('email')}
        >
          Email
        </button>
        <button
          type="button"
          className={identifierType === 'mobile' ? 'btn btn--primary' : 'btn'}
          onClick={() => setIdentifierType('mobile')}
        >
          Mobile
        </button>
      </div>

      <label className="form-field">{identifierType === 'email' ? 'Email address' : 'Mobile number'} *
      <input aria-invalid={Boolean(fieldErrors.identifier)}
        placeholder={identifierType === 'email' ? 'Email address' : 'Mobile number'}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
      />
      {fieldErrors.identifier && <span className="field-error">{fieldErrors.identifier}</span>}
      </label>
      <label className="form-field">Password *
      <input aria-invalid={Boolean(fieldErrors.password)}
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        required
      />
      {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn btn--primary" type="submit">Create account</button>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
};
