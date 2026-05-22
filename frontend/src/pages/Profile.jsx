import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const body = {};
      if (name) body.name = name;
      if (email) body.email = email;
      if (currentPassword && newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await api.put('/auth/profile', body);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setMsg('Perfil actualizado');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="fade-in">
      <div className="hero-section mb-4">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">Mi Perfil</h1>
          <p className="text-white-50 mb-0">Administra tu información personal</p>
        </div>
      </div>
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card p-4 fade-in-up">
          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-medium">Nombre</label>
              <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Email</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <hr />
            <h6>Cambiar contraseña</h6>
            <div className="mb-3">
              <label className="form-label small fw-medium">Contraseña actual</label>
              <input className="form-control" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Nueva contraseña</label>
              <input className="form-control" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary w-100" type="submit">Guardar cambios</button>
          </form>
        </div>
      </div>
    </div>
  );
}
