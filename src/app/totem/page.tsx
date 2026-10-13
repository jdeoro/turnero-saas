'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sector, Turno } from '@/types';
import {
  Printer,
  CheckCircle,
  Delete,
  AlertTriangle,
  Clock,
  UserCheck,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import TurnosWebLogo from '@/components/TurnosWebLogo';

function TotemContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || 'demo';

  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de flujo
  const [sectorSeleccionado, setSectorSeleccionado] = useState<Sector | null>(null);
  const [dni, setDni] = useState('');
  const [esPrioritario, setEsPrioritario] = useState(false);
  const [turnoEmitido, setTurnoEmitido] = useState<Turno | null>(null);
  const [emitiendo, setEmitiendo] = useState(false);

  // Cargar sectores activos
  useEffect(() => {
    async function loadSectores() {
      try {
        setLoading(true);
        const res = await fetch(`/api/totem/sectores?slug=${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al conectar con el servidor');
        setSectores(data.sectores || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSectores();
  }, [slug]);

  // Teclado numérico táctil
  const handleNumClick = (val: string) => {
    if (dni.length < 10) setDni((prev) => prev + val);
  };

  const handleBackspace = () => {
    setDni((prev) => prev.slice(0, -1));
  };

  // Emitir el ticket
  const handleEmitir = async () => {
    if (!sectorSeleccionado) return;
    setEmitiendo(true);
    setError(null);

    try {
      const res = await fetch('/api/totem/emitir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          dni: dni || '0',
          idSector: sectorSeleccionado.id_sector,
          esPrioritario,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo emitir el turno');

      setTurnoEmitido(data.turno);

      // Reproducir sonido de confirmación breve
      playBeep();

      // Auto-reset después de 8 segundos
      setTimeout(() => {
        handleReset();
      }, 8000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEmitiendo(false);
    }
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // AudioContext no soportado o bloqueado
    }
  };

  const handleReset = () => {
    setSectorSeleccionado(null);
    setDni('');
    setEsPrioritario(false);
    setTurnoEmitido(null);
    setError(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)' }}>Cargando terminal de turnos...</p>
      </div>
    );
  }

  // PANTALLA: TICKET EMITIDO CON ÉXITO (MODAL O PANTALLA COMPLETA)
  if (turnoEmitido) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <div
          className="glass animate-pulse-glow"
          style={{
            maxWidth: '500px',
            width: '100%',
            padding: '48px 36px',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            color: '#0f172a',
          }}
        >
          <div style={{ color: '#059669', marginBottom: '12px' }}>
            <CheckCircle size={56} style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
            Su Turno Ha Sido Emitido
          </h2>

          <div
            style={{
              fontSize: '4.8rem',
              fontWeight: 900,
              color: '#0284c7',
              letterSpacing: '-0.04em',
              margin: '16px 0',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {turnoEmitido.codigoTicket}
          </div>

          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
            {turnoEmitido.sector_descripcion}
          </div>
          <div style={{ fontSize: '1rem', color: '#64748b', marginBottom: '24px' }}>
            Ubicación: <strong>{turnoEmitido.piso}</strong>
          </div>

          <div
            style={{
              background: '#f1f5f9',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              color: '#334155',
              marginBottom: '28px',
            }}
          >
            Personas en espera antes de usted:{' '}
            <strong style={{ fontSize: '1.1rem', color: '#0284c7' }}>
              {turnoEmitido.personas_antes ?? 0}
            </strong>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.print()}
              className="btn btn-primary"
              style={{ flex: 1, padding: '14px' }}
            >
              <Printer size={18} />
              <span>Imprimir Ticket</span>
            </button>
            <button
              onClick={handleReset}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '14px', backgroundColor: '#e2e8f0', color: '#0f172a' }}
            >
              <RotateCcw size={18} />
              <span>Finalizar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="totem-container"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)',
        padding: '24px',
      }}
    >
      {/* Encabezado del Tótem */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '28px',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <TurnosWebLogo size={46} showText={false} />
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Tótem de Autoservicio</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Seleccione el trámite deseado para obtener su ticket
            </p>
          </div>
        </div>

        {sectorSeleccionado && (
          <button onClick={handleReset} className="btn btn-secondary">
            <RotateCcw size={16} />
            <span>Volver al inicio</span>
          </button>
        )}
      </header>

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* PASO 1: SELECCIONAR SECTOR / TRÁMITE */}
      {!sectorSeleccionado ? (
        <div
          className="totem-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            flex: 1,
            alignContent: 'center',
          }}
        >
          {sectores.map((sec) => (
            <button
              key={sec.id_sector}
              onClick={() => setSectorSeleccionado(sec)}
              className="glass totem-card-sector touch-btn"
              style={{
                padding: '36px 28px',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '190px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-block',
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-cyan)',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    lineHeight: '44px',
                    marginBottom: '16px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {sec.letraTicket}
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                  {sec.descripcion}
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{sec.piso}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} />
                  <span>~{sec.tiempo_estimado} min</span>
                </div>
                <ChevronRight size={18} />
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* PASO 2: INGRESO DNI + PRIORIDAD */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            maxWidth: '520px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            className="glass"
            style={{
              width: '100%',
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
            }}
          >
            <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Trámite Seleccionado
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '24px' }}>
              {sectorSeleccionado.descripcion}
            </h2>

            {/* Display DNI */}
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '2rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                letterSpacing: '0.1em',
                minHeight: '68px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)',
                marginBottom: '20px',
              }}
            >
              {dni || <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Ingrese DNI (Opcional)</span>}
            </div>

            {/* Teclado numérico */}
            <div
              className="totem-keypad"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                <button
                  key={n}
                  onClick={() => handleNumClick(n)}
                  className="touch-btn-lg"
                  style={{
                    padding: '18px',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setDni('')}
                style={{
                  padding: '18px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(244, 63, 94, 0.1)',
                  color: '#fb7185',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                }}
              >
                Limpiar
              </button>
              <button
                onClick={() => handleNumClick('0')}
                style={{
                  padding: '18px',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                style={{
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <Delete size={22} />
              </button>
            </div>

            {/* Checkbox Prioridad */}
            <div
              onClick={() => setEsPrioritario(!esPrioritario)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: esPrioritario ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${esPrioritario ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                marginBottom: '24px',
              }}
            >
              <input
                type="checkbox"
                checked={esPrioritario}
                onChange={() => {}}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '0.95rem', color: esPrioritario ? '#fbbf24' : 'var(--text-secondary)' }}>
                Atención Prioritaria (Embarazadas, Movilidad Reducida, Adultos Mayores)
              </span>
            </div>

            <button
              onClick={handleEmitir}
              disabled={emitiendo}
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            >
              {emitiendo ? 'Emitiendo Ticket...' : 'Emitir Mi Ticket Ahora'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TotemPage() {
  return (
    <React.Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)' }}>Cargando terminal de turnos...</p>
        </div>
      }
    >
      <TotemContent />
    </React.Suspense>
  );
}
