'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Turno } from '@/types';
import { Clock, Tv, Volume2, VolumeX } from 'lucide-react';
import TurnosWebLogo from '@/components/TurnosWebLogo';

function CarteleriaTVContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || 'demo';
  const piso = searchParams.get('piso') || '';

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [config, setConfig] = useState({
    titulo: 'Gestión de Turnos',
    color: '#1A95E2',
    zocalo: 'Por favor preste atención al llamado en pantalla y conserve su ticket impreso.',
    zocaloVisible: true,
  });

  const [hora, setHora] = useState('');
  const [audioHabilitado, setAudioHabilitado] = useState(false);
  const ultimoTicketRef = useRef<string | null>(null);

  // Reloj digital en vivo
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setHora(
        now.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling de llamados cada 3 segundos
  useEffect(() => {
    async function fetchLlamados() {
      try {
        const queryPiso = piso ? `&piso=${encodeURIComponent(piso)}` : '';
        const res = await fetch(`/api/carteleria/llamados?slug=${slug}${queryPiso}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.turnos && data.turnos.length > 0) {
          const primero = data.turnos[0];
          // Detectar nuevo llamado para sonido
          if (ultimoTicketRef.current && ultimoTicketRef.current !== primero.codigoTicket) {
            triggerChime();
          }
          ultimoTicketRef.current = primero.codigoTicket;
          setTurnos(data.turnos);
        } else {
          setTurnos([]);
        }

        if (data.config) {
          setConfig(data.config);
        }
      } catch (err) {
        console.error('Error al actualizar cartelería:', err);
      }
    }

    fetchLlamados();
    const interval = setInterval(fetchLlamados, 3000);
    return () => clearInterval(interval);
  }, [slug, piso]);

  // Sonido tipo "Ding-Dong" de aeropuerto / sala de espera
  const triggerChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Bloqueo de autoplay del navegador
    }
  };

  const primerTurno = turnos[0] || null;
  const turnosAnteriores = turnos.slice(1);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#070b14',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-main)',
      }}
    >
      {/* 1. HEADER SUPERIOR WIDESCREEN */}
      <header
        style={{
          height: '90px',
          padding: '0 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(180deg, rgba(16, 23, 42, 0.9) 0%, rgba(7, 11, 20, 0.95) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <TurnosWebLogo size={50} showText={false} />
          <div>
            <h1 className="tv-header-title" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {config.titulo}
            </h1>
            {piso && (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Sector / Piso: {piso}
              </span>
            )}
          </div>
        </div>

        {/* Audio activator & Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => {
              triggerChime();
              setAudioHabilitado(!audioHabilitado);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: audioHabilitado ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: audioHabilitado ? '#34d399' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {audioHabilitado ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>{audioHabilitado ? 'Sonido Activo' : 'Activar Sonido'}</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#38bdf8',
            }}
          >
            <Clock size={24} color="#38bdf8" />
            <span>{hora}</span>
          </div>
        </div>
      </header>

      {/* 2. BODY SPLIT (PANEL IZQUIERDO: TURNO PRINCIPAL | PANEL DERECHO: HISTORIAL) */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '62% 38%',
          gap: '24px',
          padding: '24px 36px',
          overflow: 'hidden',
        }}
      >
        {/* PANEL IZQUIERDO: LLAMADO DESTACADO */}
        <section
          className="glass ticket-called"
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '28px',
              padding: '6px 20px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              color: '#38bdf8',
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Llamando Ahora
          </div>

          {primerTurno ? (
            <>
              <div
                style={{
                  fontSize: '8.5rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  margin: '20px 0',
                  textShadow: '0 0 40px rgba(56, 189, 248, 0.5)',
                }}
              >
                {primerTurno.codigoTicket}
              </div>

              <div
                style={{
                  fontSize: '3.2rem',
                  fontWeight: 800,
                  color: '#38bdf8',
                  marginBottom: '12px',
                }}
              >
                {primerTurno.puesto_descripcion || 'BOX / CONSULTORIO'}
              </div>

              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                {primerTurno.sector_descripcion} — {primerTurno.piso}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '2rem', fontWeight: 600 }}>
              Aguardando próximos turnos...
            </div>
          )}
        </section>

        {/* PANEL DERECHO: HISTORIAL DE ÚLTIMOS LLAMADOS */}
        <section
          className="glass"
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            Últimos Llamados
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {turnosAnteriores.length > 0 ? (
              turnosAnteriores.map((t) => (
                <div
                  key={t.id_turno}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 24px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '2.4rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        color: '#f8fafc',
                      }}
                    >
                      {t.codigoTicket}
                    </span>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {t.sector_descripcion}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                      {t.puesto_descripcion}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {t.piso}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
                No hay turnos anteriores registrados hoy.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3. ZÓCALO INFERIOR INFORMATIVO */}
      {config.zocaloVisible && (
        <footer
          style={{
            height: '56px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 36px',
            fontWeight: 700,
            fontSize: '1.25rem',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ display: 'inline-block', width: '100%' }}>
            {config.zocalo}
          </div>
        </footer>
      )}
    </div>
  );
}

export default function CarteleriaTVPage() {
  return (
    <React.Suspense
      fallback={
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#070b14', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '2rem' }}>Cargando pantalla de cartelería...</p>
        </div>
      }
    >
      <CarteleriaTVContent />
    </React.Suspense>
  );
}
