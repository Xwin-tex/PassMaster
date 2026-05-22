import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMsg(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card p-5 fade-in-up" style={{ maxWidth: 420, width: '100%' }}>
        <div className="text-center mb-4">
          <span className="navbar-brand-icon mb-2" style={{ width: 48, height: 48, fontSize: 24 }}>P</span>
          <h3 className="fw-bold">Restablecer contraseña</h3>
          <p className="text-muted small">Te enviaremos un enlace a tu correo</p>
        </div>
        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-medium">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary w-100" type="submit">Enviar enlace</button>
        </form>
        <p className="mt-3 text-center small">
          <Link to="/login">Volver a inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}
