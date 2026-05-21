import React, { useState } from 'react';
import api from '../services/api';

export default function CheckIn() {
  const [code, setCode] = useState('');
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!code.trim()) return;
    setError('');
    setMessage('');
    setTicket(null);
    try {
      const res = await api.get(`/tickets/validate/${code.trim()}`);
      setTicket(res.data.ticket);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al validar código');
    }
  };

  const handleCheckIn = async () => {
    if (!ticket) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/tickets/checkin', { code: ticket.unique_code || code.trim() });
      setMessage(res.data.message);
      setTicket({ ...ticket, status: 'used' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error en check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setTicket(null);
    setError('');
    setMessage('');
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 500 }}>
      <h2 className="mb-4">Check-in de Boletos</h2>

      <div className="input-group mb-3">
        <input
          className="form-control form-control-lg"
          placeholder="Código del boleto"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
        />
        <button className="btn btn-primary" onClick={handleValidate}>Validar</button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {ticket && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">{ticket.event_name}</h5>
            <p className="text-muted small">
              {new Date(ticket.event_date).toLocaleDateString()} – {ticket.event_location}
            </p>
            <hr />
            <p><strong>Comprador:</strong> {ticket.buyer_name}</p>
            <p><strong>Estado:</strong>{' '}
              <span className={`badge bg-${ticket.status === 'active' ? 'success' : ticket.status === 'used' ? 'secondary' : 'danger'}`}>
                {ticket.status}
              </span>
            </p>
            {ticket.checked_in_at && (
              <p><strong>Check-in:</strong> {new Date(ticket.checked_in_at).toLocaleString()}</p>
            )}
            <div className="d-flex gap-2">
              {ticket.status === 'active' && (
                <button className="btn btn-success w-100" onClick={handleCheckIn} disabled={loading}>
                  {loading ? 'Procesando...' : '✅ Confirmar Check-in'}
                </button>
              )}
              <button className="btn btn-outline-secondary" onClick={handleReset}>Nuevo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
