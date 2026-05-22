import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card p-5 fade-in-up" style={{ maxWidth: 440, width: '100%' }}>
        <div className="text-center mb-4">
          <span className="navbar-brand-icon mb-2" style={{ width: 48, height: 48, fontSize: 24 }}>P</span>
          <h3 className="fw-bold">Crear Cuenta</h3>
          <p className="text-muted small">Regístrate en PassMaster</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-medium">Nombre</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Email</label>
            <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Contraseña</label>
            <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Tipo de cuenta</label>
            <select className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="buyer">Comprador</option>
              <option value="organizer">Organizador</option>
              <option value="staff">Staff / Control</option>
            </select>
          </div>
          <button className="btn btn-primary w-100" type="submit">Crear cuenta</button>
        </form>
        <p className="mt-3 text-center small text-muted">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
