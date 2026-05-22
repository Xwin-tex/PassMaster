import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card p-5 fade-in-up" style={{ maxWidth: 420, width: '100%' }}>
        <div className="text-center mb-4">
          <span className="navbar-brand-icon mb-2" style={{ width: 48, height: 48, fontSize: 24 }}>P</span>
          <h3 className="fw-bold">PassMaster</h3>
          <p className="text-muted small">Inicia sesión en tu cuenta</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-medium">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Contraseña</label>
            <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary w-100" type="submit">Ingresar</button>
        </form>
        <div className="mt-3 text-center small text-muted">
          <p className="mb-1"><Link to="/forgot-password">¿Olvidaste tu contraseña?</Link></p>
          <p className="mb-0">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
        </div>
      </div>
    </div>
  );
}
