import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function TicketQR({ code, size = 160 }) {
  return (
    <div className="d-inline-block p-2 rounded" style={{ background: 'white' }}>
      <QRCodeSVG value={code} size={size} level="H" />
    </div>
  );
}
