import React, { useState } from 'react';
import api from '../services/api';
import TicketQR from '../components/TicketQR';

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
    <div className="fade-in">
      <div className="hero-section mb-4">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">Check-in</h1>
          <p className="text-white-50 mb-0">Valida el código del boleto para permitir el acceso</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card p-4 fade-in-up">
          <label className="fw-bold mb-2">Código del boleto</label>
          <div className="input-group mb-3">
            <input
              className="form-control checkin-input"
              placeholder="Ingresa el código..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            />
            <button className="btn btn-primary px-4" onClick={handleValidate}>
              Validar
            </button>
          </div>

          {error && <div className="alert alert-danger slide-down">{error}</div>}
          {message && <div className="alert alert-success slide-down">{message}</div>}

          {ticket && (
            <div className="slide-down">
              <div className="text-center mb-3">
                <TicketQR code={ticket.unique_code || code} size={160} />
              </div>
              <hr />
              <h5 className="mb-1">{ticket.event_name}</h5>
              <p className="text-muted small mb-3">
                📅 {new Date(ticket.event_date).toLocaleDateString()} 📍 {ticket.event_location}
              </p>

              <div className="d-flex justify-content-between mb-2 p-3 rounded" style={{ background: '#F8F7FF' }}>
                <span className="fw-medium">Comprador:</span>
                <span>{ticket.buyer_name}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 p-3 rounded" style={{ background: '#F8F7FF' }}>
                <span className="fw-medium">Estado:</span>
                <span className={`badge bg-${ticket.status === 'active' ? 'success' : ticket.status === 'used' ? 'secondary' : 'danger'}`}>
                  {ticket.status === 'active' ? 'Válido' : ticket.status === 'used' ? 'Ya usado' : ticket.status}
                </span>
              </div>

              {ticket.checked_in_at && (
                <div className="d-flex justify-content-between mb-3 p-3 rounded" style={{ background: '#F8F7FF' }}>
                  <span className="fw-medium">Check-in:</span>
                  <span>{new Date(ticket.checked_in_at).toLocaleString()}</span>
                </div>
              )}

              <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
                {ticket.status === 'active' && (
                  <button className="btn btn-success flex-fill" onClick={handleCheckIn} disabled={loading}>
                    {loading ? 'Procesando...' : '✅ Confirmar ingreso'}
                  </button>
                )}
                <button className="btn btn-outline-secondary" onClick={handleReset}>
                  Nuevo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
