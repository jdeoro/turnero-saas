import { NextResponse } from 'next/server';
import { TenantService } from '@/services/tenantService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre_empresa, email, telefono, admin_nombre, admin_dni, admin_clave } = body;

    if (!nombre_empresa || !email || !admin_nombre || !admin_dni || !admin_clave) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben completarse' },
        { status: 400 }
      );
    }

    const result = await TenantService.registerTrial({
      nombre_empresa,
      email,
      telefono,
      admin_nombre,
      admin_dni,
      admin_clave,
    });

    return NextResponse.json({
      success: true,
      mensaje: 'Cuenta creada con 14 días de prueba gratis.',
      slug: result.slug,
      tenantId: result.tenantId,
    });
  } catch (error: any) {
    console.error('Error al registrar cuenta:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al registrar la cuenta' },
      { status: 500 }
    );
  }
}
