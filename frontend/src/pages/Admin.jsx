import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Admin() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data.users)).catch(() => {});
  }, []);

  const changeRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers(users.map((u) => u.id === id ? { ...u, role } : u));
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="fade-in">
      <div className="hero-section mb-4">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">Panel de Administración</h1>
          <p className="text-white-50 mb-0">Gestión de usuarios del sistema</p>
        </div>
      </div>
      <div className="container">
        <div className="card fade-in-up">
          <div className="card-header bg-transparent fw-bold">Usuarios ({users.length})</div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Registro</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="text-muted">{u.id}</td>
                    <td>{u.name}</td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <span className={`badge bg-${u.role === 'admin' ? 'danger' : u.role === 'organizer' ? 'primary' : u.role === 'staff' ? 'info' : 'secondary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-muted small">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        style={{ maxWidth: 130 }}
                      >
                        <option value="buyer">Comprador</option>
                        <option value="staff">Staff</option>
                        <option value="organizer">Organizador</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
