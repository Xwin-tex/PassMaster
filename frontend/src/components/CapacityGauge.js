import React from 'react';

export default function CapacityGauge({ sold, capacity }) {
  const pct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
  const color = pct >= 90 ? 'danger' : pct >= 70 ? 'warning' : 'success';

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between small mb-1">
        <span>Aforo: {sold}/{capacity}</span>
        <span>{pct}%</span>
      </div>
      <div className="progress" style={{ height: '24px' }}>
        <div
          className={`progress-bar bg-${color} progress-bar-striped progress-bar-animated`}
          role="progressbar"
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {pct}%
        </div>
      </div>
    </div>
  );
}
