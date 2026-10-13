'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Turno, Sector } from '@/types';
import {
  UserCheck,
  PhoneCall,
  Play,
  CheckCircle,
  UserX,
  Share2,
  Clock,
  AlertCircle,
  LogOut,
  RefreshCw,
  Send,
  X,
} from 'lucide-react';
import TurnosWebLogo from '@/components/TurnosWebLogo';

export default function OperadorPage() {
  const [tenantId, setTenantId] = useState<number>(1);
  const [idPuesto, setIdPuesto] = useState<number>(1);
  const [idUsuario, setIdUsuario] = useState<number>(1);
  const [idSector, setIdSector] = useState<number>(1);

  const [actual, setActual] = useState<Turno | null>(null);
  const [cola, setCola] = useState<Turno[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cronómetro de atención
  const [segundosAtencion, setSegundosAtencion] = useState<number>(0);

  // Modal derivar
  const [modalDerivarOpen, setModalDerivarOpen] = useState(false);
  const [sectorDestino, setSectorDestino] = useState<number>(0);
  const [derivarPrioritario, setDerivarPrioritario] = useState<boolean>(true);
  const [observacionesDerivar, setObservacionesDerivar] = useState<string>('');

  // Cargar estado inicial y sesión
  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const resMe = await fetch('/api/auth/me');
        const dataMe = await resMe.json();
        if (dataMe.authenticated && dataMe.usuario) {
          setTenantId(dataMe.usuario.tenant_id);
          setIdUsuario(dataMe.usuario.id);
          if (dataMe.usuario.id_puesto) setIdPuesto(dataMe.usuario.id_puesto);
          if (dataMe.usuario.id_sector) setIdSector(dataMe.usuario.id_sector);
        }
      } catch {
        // Continuar con defaults para prueba local
      } finally {
        setLoading(false);
      }
    }
    checkAuthAndLoad();
  }, []);

  // Polling del Box cada 4 segundos
  useEffect(() => {
    if (!idPuesto || !idSector) return;

    async function loadBox() {
      try {
        const res = await fetch(
          `/api/operador/box?tenantId=${tenantId}&idPuesto=${idPuesto}&idSector=${idSector}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setActual(data.actual);
        setCola(data.cola || []);
        setSectores(data.sectores || []);
      } catch (err) {
        console.error('Error al actualizar box:', err);
      }
    }

    loadBox();
    const interval = setInterval(loadBox, 4000);
    return () => clearInterval(interval);
  }, [tenantId, idPuesto, idSector]);

  // Cronómetro activo cuando el turno está EN_ATENCION
  useEffect(() => {
    let timer: any = null;
    if (actual && actual.estado === 'EN_ATENCION') {
      timer = setInterval(() => {
        setSegundosAtencion((prev) => prev + 1);
      }, 1000);
    } else {
      setSegundosAtencion(0);
    }
    return () => clearInterval(timer);
  }, [actual]);

  // Ejecutar acciones de turno
  const ejecutarAccion = async (accion: string, extraData: any = {}) => {
    setError(null);
    try {
      const res = await fetch('/api/operador/acciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion,
          tenantId,
          idTurno: actual?.id_turno,
          ...extraData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en la acción');

      // Refrescar estado inmediato
      const refreshRes = await fetch(
        `/api/operador/box?tenantId=${tenantId}&idPuesto=${idPuesto}&idSector=${idSector}`
      );
      const refreshData = await refreshRes.json();
      setActual(refreshData.actual);
      setCola(refreshData.cola || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Llamar siguiente
  const handleLlamarSiguiente = async () => {
    setError(null);
    try {
      const res = await fetch('/api/operador/siguiente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          idPuesto,
          idUsuario,
          idSector,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al llamar');
      if (!data.turno) {
        setError('No hay turnos pendientes en cola para este sector');
      } else {
        setActual(data.turno);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Derivar turno
  const handleConfirmarDerivar = async () => {
    if (!sectorDestino) {
      setError('Seleccione un sector destino para derivar');
      return;
    }
    await ejecutarAccion('derivar', {
      idSectorDestino: sectorDestino,
      esPrioritario: derivarPrioritario,
      observaciones: observacionesDerivar,
    });
    setModalDerivarOpen(false);
    setObservacionesDerivar('');
  };

  const formatearTiempo = (seg: number) => {
    const mins = Math.floor(seg / 60);
    const s = seg % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* HEADER OPERADOR */}
      <header
        className="operador-header"
        style={{
          minHeight: '70px',
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <TurnosWebLogo size={36} showText={false} />
          <div
            style={{
              padding: '6px 14px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-cyan)',
              fontWeight: 800,
              fontSize: '1.1rem',
            }}
          >
            Box #{idPuesto}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Operador de Atención</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sector:</span>
              <select
                value={idSector}
                onChange={(e) => setIdSector(Number(e.target.value))}
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '3px 8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {sectores.length > 0 ? (
                  sectores.map((sec) => (
                    <option key={sec.id_sector} value={sec.id_sector}>
                      {sec.descripcion} ({sec.letraTicket})
                    </option>
                  ))
                ) : (
                  <option value={idSector}>Sector {idSector}</option>
                )}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/tv" target="_blank" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Abrir Pantalla TV
          </Link>
          <Link href="/" className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <LogOut size={16} />
            <span>Salir</span>
          </Link>
        </div>
      </header>

      {error && (
        <div
          style={{
            margin: '16px 28px 0 28px',
            padding: '12px 18px',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL: ATENCIÓN + COLA */}
      <main
        className="operador-grid"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '24px',
          padding: '24px 28px',
        }}
      >
        {/* PANEL IZQUIERDO: TURNO EN ATENCIÓN Y COMANDOS */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            className="glass"
            style={{
              padding: '36px',
              borderRadius: 'var(--radius-lg)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {actual ? (
              <>
                <div
                  className="badge"
                  style={{
                    backgroundColor:
                      actual.estado === 'EN_ATENCION'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
                    color: actual.estado === 'EN_ATENCION' ? '#34d399' : '#fbbf24',
                    marginBottom: '16px',
                    fontSize: '0.9rem',
                    padding: '6px 16px',
                  }}
                >
                  {actual.estado === 'EN_ATENCION' ? 'En Consulta / Atención' : 'Llamado a Pantalla'}
                </div>

                <div
                  style={{
                    fontSize: '6rem',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#ffffff',
                    lineHeight: 1,
                    marginBottom: '10px',
                  }}
                >
                  {actual.codigoTicket}
                </div>

                <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  DNI: <strong>{actual.dni || 'Sin DNI'}</strong>
                </div>

                {/* Cronómetro */}
                {actual.estado === 'EN_ATENCION' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: '#34d399',
                      margin: '12px 0 24px 0',
                    }}
                  >
                    <Clock size={24} />
                    <span>{formatearTiempo(segundosAtencion)}</span>
                  </div>
                )}

                {/* BOTONES DE ACCIÓN */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginTop: '20px',
                  }}
                >
                  <button
                    onClick={() => ejecutarAccion('rellamar')}
                    className="btn btn-secondary"
                    style={{ padding: '12px 20px' }}
                  >
                    <PhoneCall size={18} />
                    <span>Rellamar a TV</span>
                  </button>

                  {actual.estado === 'LLAMADO' && (
                    <button
                      onClick={() => ejecutarAccion('iniciar')}
                      className="btn btn-success"
                      style={{ padding: '12px 24px' }}
                    >
                      <Play size={18} />
                      <span>Iniciar Atención</span>
                    </button>
                  )}

                  {actual.estado === 'EN_ATENCION' && (
                    <button
                      onClick={() => ejecutarAccion('finalizar')}
                      className="btn btn-success"
                      style={{ padding: '12px 24px' }}
                    >
                      <CheckCircle size={18} />
                      <span>Finalizar Atención</span>
                    </button>
                  )}

                  <button
                    onClick={() => ejecutarAccion('ausente')}
                    className="btn btn-danger"
                    style={{ padding: '12px 20px' }}
                  >
                    <UserX size={18} />
                    <span>Marcar Ausente</span>
                  </button>

                  <button
                    onClick={() => setModalDerivarOpen(true)}
                    className="btn btn-secondary"
                    style={{ padding: '12px 20px' }}
                  >
                    <Share2 size={18} />
                    <span>Derivar a Sector</span>
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Box libre. Presione el botón para atender al siguiente visitante.
                </p>
                <button
                  onClick={handleLlamarSiguiente}
                  className="btn btn-primary"
                  style={{ padding: '18px 40px', fontSize: '1.2rem' }}
                >
                  <UserCheck size={24} />
                  <span>Llamar Siguiente Turno</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* PANEL DERECHO: COLA DE ESPERA EN VIVO */}
        <aside
          className="glass"
          style={{
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Cola de Espera ({cola.length})
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>En tiempo real</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
            {cola.length > 0 ? (
              cola.map((item, idx) => (
                <div
                  key={item.id_turno}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          color: '#fff',
                        }}
                      >
                        {item.codigoTicket}
                      </span>
                      {item.es_prioritario === 1 && (
                        <span className="badge badge-trial" style={{ fontSize: '0.65rem' }}>
                          Prioritario
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      DNI: {item.dni || 'Sin DNI'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      <span>{item.minutos_espera ?? 0} min</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                No hay turnos en cola para este sector.
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* MODAL DERIVAR A OTRO SECTOR */}
      {modalDerivarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="glass"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Derivar Turno {actual?.codigoTicket}</h3>
              <button onClick={() => setModalDerivarOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Sector Destino *
              </label>
              <select
                value={sectorDestino}
                onChange={(e) => setSectorDestino(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.95rem',
                }}
              >
                <option value={0}>Seleccione sector...</option>
                {sectores.map((s) => (
                  <option key={s.id_sector} value={s.id_sector}>
                    {s.descripcion} ({s.piso})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Observaciones / Indicaciones para el médico u operador
              </label>
              <textarea
                rows={3}
                value={observacionesDerivar}
                onChange={(e) => setObservacionesDerivar(e.target.value)}
                placeholder="Ej. Paciente con estudios previos en mano..."
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleConfirmarDerivar} className="btn btn-primary" style={{ flex: 1 }}>
                <Send size={16} />
                <span>Confirmar Derivación</span>
              </button>
              <button onClick={() => setModalDerivarOpen(false)} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
