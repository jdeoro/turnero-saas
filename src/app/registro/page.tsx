'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, User, Mail, Phone, Lock, CreditCard, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import TurnosWebLogo from '@/components/TurnosWebLogo';

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [slugCreado, setSlugCreado] = useState<string>('');

  const [form, setForm] = useState({
    nombre_empresa: '',
    email: '',
    telefono: '',
    admin_nombre: '',
    admin_dni: '',
    admin_clave: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/saas/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      setSlugCreado(data.slug);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <div
          className="glass"
          style={{
            maxWidth: '560px',
            width: '100%',
            padding: '48px',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
            ¡Tu cuenta está lista!
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
            Disfruta de <strong>7 días de prueba completa</strong> sin ningún compromiso. Tu identificador de institución es:
          </p>

          <div
            style={{
              background: 'var(--bg-tertiary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              letterSpacing: '0.05em',
              marginBottom: '32px',
            }}
          >
            slug: {slugCreado}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              href={`/totem?slug=${slugCreado}`}
              className="btn btn-primary"
              style={{ padding: '14px', fontSize: '1rem' }}
            >
              <span>Abrir Tótem de Autoservicio</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="btn btn-secondary"
              style={{ padding: '14px', fontSize: '1rem' }}
            >
              Ir a Iniciar Sesión de Operadores
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 24px',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative',
      }}
    >
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <TurnosWebLogo size={44} showText={true} />
        </Link>
      </div>

      <div
        className="glass"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Comienza tu prueba de 7 días</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
            Sin tarjeta de crédito. Acceso inmediato a todos los módulos.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
              fontSize: '0.9rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Nombre de tu Clínica o Comercio *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="nombre_empresa"
                required
                placeholder="Ej. Clínica San Lucas o Consultorios Belgrano"
                value={form.nombre_empresa}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Email de contacto *
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                name="telefono"
                placeholder="11 2345 6789"
                value={form.telefono}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '6px 0' }} />

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Nombre del Administrador *
            </label>
            <input
              type="text"
              name="admin_nombre"
              required
              placeholder="Ej. Dr. Mario González"
              value={form.admin_nombre}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                DNI / Identificación *
              </label>
              <input
                type="text"
                name="admin_dni"
                required
                placeholder="Solo números"
                value={form.admin_dni}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Contraseña inicial *
              </label>
              <input
                type="password"
                name="admin_clave"
                required
                placeholder="Mínimo 6 caracteres"
                value={form.admin_clave}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: '12px', padding: '14px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Activando cuenta de prueba...' : 'Activar 7 Días Gratis'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '20px' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
