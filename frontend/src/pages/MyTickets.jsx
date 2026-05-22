import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TicketQR from '../components/TicketQR';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get('/tickets/mine')
      .then((res) => setTickets(res.data.tickets))
      .catch(() => {});
  }, []);

  const [transferEmail, setTransferEmail] = useState({});

  const handleRefund = async (ticketId) => {
    if (!confirm('¿Solicitar reembolso de este ticket?')) return;
    try {
      await api.post('/payments/refund', { ticketId });
      alert('Reembolso procesado');
      setTickets(tickets.map((t) => t.id === ticketId ? { ...t, status: 'refunded' } : t));
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleTransfer = async (ticketId) => {
    const email = transferEmail[ticketId];
    if (!email) return alert('Ingresa un email');
    try {
      await api.post('/tickets/transfer', { ticketId, newOwnerEmail: email });
      alert('Ticket transferido');
      setTickets(tickets.filter((t) => t.id !== ticketId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al transferir');
    }
  };

  const printTicket = (ticketId) => {
    const content = document.getElementById(`ticket-print-${ticketId}`);
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Ticket</title><style>
      body { font-family: sans-serif; padding: 20px; background: #0F0A1A; color: white; }
      .code { font-family: monospace; font-size: 24px; letter-spacing: 3px; text-align: center; padding: 16px; background: rgba(255,255,255,0.1); border-radius: 8px; }
      @media print { body { padding: 0; } }
    </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="fade-in">
      <div className="hero-section mb-4">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">Mis Tickets</h1>
          <p className="text-white-50 mb-0">Todos tus boletos digitales en un solo lugar</p>
        </div>
      </div>

      <div className="container">
        {tickets.length === 0 ? (
          <div className="card p-5 text-center fade-in-up">
            <span style={{ fontSize: '3rem' }}>🎫</span>
            <h4 className="mt-3">No tienes tickets</h4>
            <p className="text-muted">Compra boletos para tus eventos favoritos.</p>
            <a href="/events" className="btn btn-primary">Ver eventos</a>
          </div>
        ) : (
          <div className="row g-4">
            {tickets.map((t, i) => (
              <div key={t.id} className="col-md-6 fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="card ticket-card p-0 overflow-hidden">
                  <div id={`ticket-print-${t.id}`} className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="small text-purple-300 mb-0 opacity-75">🎟️ ENTRADA DIGITAL</p>
                        <h5 className="card-title text-white mb-1 mt-1">{t.event_name}</h5>
                      </div>
                      <span className={`badge bg-${t.status === 'active' ? 'success' : t.status === 'used' ? 'secondary' : 'danger'} fs-6`}>
                        {t.status === 'active' ? 'Válido' : t.status === 'used' ? 'Usado' : t.status}
                      </span>
                    </div>
                    <p className="text-white-50 small mb-3">
                      📅 {new Date(t.event_date).toLocaleDateString()} &nbsp;📍 {t.event_location}
                    </p>
                    <div className="text-center mb-3">
                      <TicketQR code={t.unique_code} size={140} />
                    </div>
                    <div className="ticket-code text-center mb-3">
                      {t.unique_code}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-white-50">
                        🕐 {new Date(t.purchase_date).toLocaleDateString()}
                      </small>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-light" onClick={() => printTicket(t.id)}>
                          🖨️ Imprimir
                        </button>
                        {t.status === 'active' && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRefund(t.id)}>
                            💰 Reembolsar
                          </button>
                        )}
                      </div>
                    </div>
                    {t.status === 'active' && (
                      <div className="input-group input-group-sm mt-2">
                        <input className="form-control" placeholder="Email para transferir" value={transferEmail[t.id] || ''} onChange={(e) => setTransferEmail({ ...transferEmail, [t.id]: e.target.value })} />
                        <button className="btn btn-outline-warning" onClick={() => handleTransfer(t.id)}>Transferir</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
