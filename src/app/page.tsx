'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Monitor,
  Tv,
  Users,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Building2,
  Smartphone,
  Flame,
} from 'lucide-react';

import TurnosWebLogo from '@/components/TurnosWebLogo';

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. TOP BAR & NAVBAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(10, 15, 29, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '74px',
          }}
        >
          {/* Logo Distintivo Propio */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <TurnosWebLogo size={42} showText={true} />
          </Link>

          {/* Menú enlaces */}
          <nav
            className="nav-desktop-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}
          >
            <a href="#modulos" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Módulos
            </a>
            <a href="#como-funciona" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Cómo Funciona
            </a>
            <a href="#precios" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Precios
            </a>
            <a href="#faq" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Preguntas
            </a>
          </nav>

          {/* Acciones */}
          <div className="nav-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
              Iniciar Sesión
            </Link>
            <Link href="/registro" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>
              <span>7 Días Gratis</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section
        style={{
          padding: '80px 0 100px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow ambient background */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.22) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
            <span
              className="badge badge-trial"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                fontSize: '0.85rem',
              }}
            >
              <Flame size={16} color="#f59e0b" />
              <span>Prueba gratis 7 días • Sin tarjeta de crédito</span>
            </span>
          </div>

          <h1
            className="hero-heading"
            style={{
              fontSize: '3.6rem',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              maxWidth: '920px',
              margin: '0 auto 24px auto',
            }}
          >
            La forma más ágil de organizar las filas en tu{' '}
            <span className="gradient-text">clínica, consultorio o comercio</span>
          </h1>

          <p
            className="hero-subtitle"
            style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              maxWidth: '720px',
              margin: '0 auto 40px auto',
              lineHeight: 1.6,
            }}
          >
            Emite tickets desde un <strong>tótem táctil</strong>, llama pacientes en una{' '}
            <strong>pantalla de TV con sonido</strong> y gestiona boxes en tiempo real. 100% en la nube, sin instalaciones complejas.
          </p>

          <div
            className="hero-buttons"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '18px',
              flexWrap: 'wrap',
              marginBottom: '50px',
            }}
          >
            <Link href="/registro" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
              <span>Crear cuenta y probar gratis</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/totem"
              target="_blank"
              className="btn btn-secondary"
              style={{ padding: '16px 28px', fontSize: '1.05rem' }}
            >
              <span>Ver Demo en Vivo</span>
            </Link>
          </div>

          {/* Social Proof */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>Listo para usar en 3 minutos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>Funciona en cualquier Smart TV o tablet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>Soporte directo por chat</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE / MÓDULOS DEL SISTEMA */}
      <section
        id="modulos"
        style={{
          padding: '80px 0',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span
              style={{
                color: 'var(--accent-cyan)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Ecosistema Integral
            </span>
            <h2
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginTop: '10px',
              }}
            >
              Todo lo que tu equipo necesita en 3 pantallas
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '14px auto 0 auto' }}>
              Diseñado para que tanto tus clientes como tus recepcionistas y médicos lo entiendan sin necesidad de manuales.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '30px',
            }}
          >
            {/* Card 1: Tótem */}
            <div
              className="glass"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '36px',
                transition: 'transform 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '22px',
                }}
              >
                <Smartphone size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>
                1. Tótem Táctil de Autoservicio
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Colócalo en una tablet o monitor táctil en la entrada. El paciente ingresa su DNI, elige el trámite o sector y recibe su ticket digital o impreso al instante.
              </p>
              <Link
                href="/totem"
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.9rem' }}
                target="_blank"
              >
                <span>Probar pantalla Tótem</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 2: Cartelería TV */}
            <div
              className="glass"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '36px',
                transition: 'transform 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-indigo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '22px',
                }}
              >
                <Tv size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>
                2. Cartelería Widescreen para TV
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Abre la URL en cualquier Smart TV. Avisos sonoros automáticos, visualización clara del box y ticket actual, y zócalo inferior de noticias institucionales.
              </p>
              <Link
                href="/tv"
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.9rem' }}
                target="_blank"
              >
                <span>Probar pantalla TV</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 3: Operador */}
            <div
              className="glass"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '36px',
                transition: 'transform 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '22px',
                }}
              >
                <Monitor size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '12px' }}>
                3. Panel de Operador / Boxes
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Llamar siguiente con 1 clic, rellamar, cronómetro de atención, marcar ausente y derivar a otros consultorios con prioridad de urgencia.
              </p>
              <Link
                href="/operador"
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.9rem' }}
                target="_blank"
              >
                <span>Probar Panel de Box</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRECIOS Y PLANES TRANSPARENTES */}
      <section id="precios" style={{ padding: '90px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span
              style={{
                color: 'var(--accent-emerald)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Planes Flexibles
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '8px' }}>
              Planes simples para cada tamaño de negocio
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
              Todos los planes incluyen 7 días de prueba gratuita completa.
            </p>

            {/* Toggle Anual / Mensual */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-tertiary)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                marginTop: '28px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: billingCycle === 'monthly' ? '#fff' : 'var(--text-secondary)',
                  backgroundColor: billingCycle === 'monthly' ? 'var(--accent-indigo)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: billingCycle === 'annual' ? '#fff' : 'var(--text-secondary)',
                  backgroundColor: billingCycle === 'annual' ? 'var(--accent-indigo)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                Anual <span style={{ fontSize: '0.75rem', color: '#34d399' }}>(2 meses gratis)</span>
              </button>
            </div>
          </div>

          <div
            className="pricing-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '30px',
              maxWidth: '1050px',
              margin: '0 auto',
            }}
          >
            {/* Plan 1: Básico */}
            <div
              className="glass"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Plan Básico</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
                Ideal para consultorios únicos o pequeños comercios.
              </p>
              <div style={{ margin: '24px 0' }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 800 }}>
                  ${billingCycle === 'annual' ? '14.900' : '17.900'}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}> / mes</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} color="#10b981" /> Hasta 2 Boxes / Puestos
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} color="#10b981" /> 1 Pantalla de TV en vivo
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} color="#10b981" /> Tótem de autoservicio digital
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} color="#10b981" /> Soporte por chat
                </li>
              </ul>
              <Link href="/registro" className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }}>
                Comenzar prueba
              </Link>
            </div>

            {/* Plan 2: Profesional (Destacado) */}
            <div
              className="glass"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid var(--accent-cyan)',
                position: 'relative',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-14px',
                  right: '28px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Más Elegido
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Plan Profesional</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
                Para clínicas de salud, bancos, notarías o sedes con múltiples sectores.
              </p>
              <div style={{ margin: '24px 0' }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 800 }}>
                  ${billingCycle === 'annual' ? '28.900' : '34.500'}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}> / mes</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} color="#10b981" /> Hasta 10 Boxes u Operadores
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} color="#10b981" /> Pantallas de TV ilimitadas por piso
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} color="#10b981" /> Múltiples sectores (Guardia, Caja, etc.)
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} color="#10b981" /> Derivaciones entre sectores y urgencias
                </li>
                <li style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={18} color="#10b981" /> Personalización de logo y colores
                </li>
              </ul>
              <Link href="/registro" className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>
                Comenzar prueba gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PREGUNTAS FRECUENTES (FAQ) */}
      <section id="faq" style={{ padding: '70px 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>
            Preguntas Frecuentes
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                q: '¿Qué equipamiento necesito para usar el turnero?',
                a: 'Cualquier dispositivo con navegador web. Puedes usar un Smart TV para la sala de espera, una tablet para el tótem de entrada y computadoras comunes para los operadores.',
              },
              {
                q: '¿Qué sucede cuando finalizan los 7 días de prueba?',
                a: 'Tu cuenta se pausará automáticamente sin cobrarte nada. Podrás elegir cualquiera de los planes para continuar usando el servicio o escribirnos por chat si necesitas más tiempo.',
              },
              {
                q: '¿Se pueden imprimir tickets térmicos?',
                a: 'Sí. El sistema funciona tanto con tickets puramente en pantalla como enviando la orden de impresión a cualquier impresora térmica estándar ESC/POS conectada.',
              },
              {
                q: '¿Puedo personalizar el logo y colores de mi clínica?',
                a: 'Totalmente. Puedes cargar tu logotipo, definir el color institucional y redactar el texto del zócalo de noticias de la pantalla de TV.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="glass"
                style={{
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 24px',
                  cursor: 'pointer',
                }}
                onClick={() => toggleFaq(idx)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={20}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>
                {openFaq === idx && (
                  <p style={{ marginTop: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '40px 0',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: '#fff' }}>TurnosWeb SaaS</span> — Desarrollado por{' '}
            <a
              href="https://desarrollosweb.net.ar"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-cyan)' }}
            >
              Desarrollos Web
            </a>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/totem" target="_blank">Demo Tótem</Link>
            <Link href="/tv" target="_blank">Demo TV</Link>
            <Link href="/operador" target="_blank">Demo Operador</Link>
            <Link href="/login">Acceso Clientes</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
