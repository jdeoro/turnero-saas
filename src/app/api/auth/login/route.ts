import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { TenantService } from '@/services/tenantService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, dni, clave } = body;

    if (!dni || !clave) {
      return NextResponse.json({ error: 'DNI y clave son requeridos' }, { status: 400 });
    }

    const tenant = await TenantService.resolveTenant(slug);
    if (!tenant) {
      return NextResponse.json({ error: 'Institución o clínica no encontrada' }, { status: 404 });
    }

    if (!tenant.es_vigente) {
      return NextResponse.json(
        { error: 'El período de prueba de esta institución ha expirado.' },
        { status: 403 }
      );
    }

    const authResult = await AuthService.login(tenant.id, dni, clave);
    if (!authResult) {
      return NextResponse.json({ error: 'DNI o contraseña incorrectos' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      usuario: authResult.usuario,
    });

    // Guardar token en cookie HttpOnly segura
    response.cookies.set('turnero_token', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 horas
    });

    return response;
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: error.message || 'Error de autenticación' }, { status: 500 });
  }
}
