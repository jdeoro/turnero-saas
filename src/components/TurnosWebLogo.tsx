import React from 'react';

interface TurnosWebLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

/**
 * Logotipo e isotipo vectorial distintivo de TurnosWeb SaaS
 * Representa un ticket digital de autoservicio emitiendo ondas dinámicas de llamado en pantalla.
 */
export default function TurnosWebLogo({
  size = 40,
  showText = false,
  className = '',
}: TurnosWebLogoProps) {
  return (
    <div
      className={`turnosweb-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: showText ? '12px' : 0,
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      {/* ISOTIPO VECTORIAL */}
      <div
        style={{
          width: size,
          height: size,
          minWidth: size,
          borderRadius: Math.round(size * 0.28),
          background: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 50%, #6366f1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 18px rgba(2, 132, 199, 0.45), 0 0 10px rgba(99, 102, 241, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Reflejo superior de vidrio */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <svg
          width={Math.round(size * 0.62)}
          height={Math.round(size * 0.62)}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ticket digital estilizado con muescas laterales */}
          <path
            d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V8.5C18.1716 8.5 17.5 9.17157 17.5 10C17.5 10.8284 18.1716 11.5 19 11.5V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V11.5C5.82843 11.5 6.5 10.8284 6.5 10C6.5 9.17157 5.82843 8.5 5 8.5V4Z"
            fill="rgba(255, 255, 255, 0.18)"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Línea punteada de corte */}
          <line
            x1="8"
            y1="10"
            x2="16"
            y2="10"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeDasharray="1.5 2"
            strokeLinecap="round"
          />
          {/* Ondas / Señal digital de llamado */}
          <path
            d="M9 14.5L12 17.5L15 14.5"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Punto de foco / campana de notificación */}
          <circle cx="12" cy="6" r="1.5" fill="#38bdf8" />
        </svg>
      </div>

      {/* TEXTO DEL LOGO (OPCIONAL) */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: `${Math.max(1.15, size * 0.03)}rem`,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              lineHeight: 1.15,
            }}
          >
            Turnos<span className="gradient-text">Web</span>
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.09em',
              fontWeight: 700,
              marginTop: '1px',
            }}
          >
            SaaS Inteligente
          </span>
        </div>
      )}
    </div>
  );
}
