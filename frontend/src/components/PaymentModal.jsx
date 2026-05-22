import React, { useState } from 'react';

const cardIcons = {
  visa: '💳',
  mastercard: '💳',
  amex: '💳',
};

export default function PaymentModal({ show, total, onClose, onSuccess }) {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [errors, setErrors] = useState({});

  if (!show) return null;

  const handleChange = (field, value) => {
    if (field === 'number') value = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (field === 'expiry') value = value.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/');
    if (field === 'cvc') value = value.replace(/\D/g, '').slice(0, 4);
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Requerido';
    if (form.number.replace(/\s/g, '').length < 16) errs.number = 'Número inválido';
    if (form.expiry.length < 5) errs.expiry = 'Fecha inválida';
    if (form.cvc.length < 3) errs.cvc = 'CVC inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStep('processing');
    setTimeout(() => setStep('success'), 1800);
    setTimeout(() => { onSuccess(); setStep('form'); setForm({ number: '', expiry: '', cvc: '', name: '' }); }, 3200);
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>

          {step === 'form' && (
            <form onSubmit={handleSubmit}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Simular Pago</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body px-4">
                <div className="rounded p-3 mb-3 text-white" style={{ background: 'linear-gradient(135deg, #1E1B2E, #2D1B69)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="small opacity-75">PAGO SIMULADO</span>
                    <span style={{ fontSize: 24 }}>💳</span>
                  </div>
                  <div className="mb-2" style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 2 }}>
                    {form.number || '•••• •••• •••• ••••'}
                  </div>
                  <div className="d-flex justify-content-between small opacity-75">
                    <span>VENCE: {form.expiry || 'MM/AA'}</span>
                    <span>CVC: {form.cvc || '•••'}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-medium">Titular</label>
                  <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} placeholder="Nombre del titular" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-medium">Número de tarjeta</label>
                  <input className={`form-control ${errors.number ? 'is-invalid' : ''}`} placeholder="4242 4242 4242 4242" value={form.number} onChange={(e) => handleChange('number', e.target.value)} />
                  {errors.number && <div className="invalid-feedback">{errors.number}</div>}
                </div>
                <div className="row g-2 mb-2">
                  <div className="col">
                    <label className="form-label small fw-medium">Vence</label>
                    <input className={`form-control ${errors.expiry ? 'is-invalid' : ''}`} placeholder="MM/AA" value={form.expiry} onChange={(e) => handleChange('expiry', e.target.value)} />
                    {errors.expiry && <div className="invalid-feedback">{errors.expiry}</div>}
                  </div>
                  <div className="col">
                    <label className="form-label small fw-medium">CVC</label>
                    <input className={`form-control ${errors.cvc ? 'is-invalid' : ''}`} placeholder="123" value={form.cvc} onChange={(e) => handleChange('cvc', e.target.value)} />
                    {errors.cvc && <div className="invalid-feedback">{errors.cvc}</div>}
                  </div>
                </div>

                <div className="alert alert-info py-2 small mb-0 mt-3">
                  <strong>🧪 Simulación</strong> — No se realizará un cobro real.
                  Usa cualquier número de tarjeta.
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-primary flex-grow-1">
                  Pagar <strong>${total.toFixed(2)}</strong>
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="text-center py-5 px-4">
              <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }}></div>
              <h5>Procesando pago...</h5>
              <p className="text-muted small mb-0">Estamos verificando tu tarjeta</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-5 px-4">
              <div style={{ fontSize: 56, marginBottom: 8 }}>✅</div>
              <h4 className="fw-bold mb-1">¡Pago exitoso!</h4>
              <p className="text-muted small mb-0">Tus boletos están listos</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
