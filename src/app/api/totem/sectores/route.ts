import { NextResponse } from 'next/server';
import { TurnoService } from '@/services/turnoService';
import { TenantService } from '@/services/tenantService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || undefined;
    const tenant = await TenantService.resolveTenant(slug);

    if (!tenant) {
      return NextResponse.json({ error: 'Institución o clínica no encontrada' }, { status: 404 });
    }

    if (!tenant.es_vigente) {
      return NextResponse.json(
        { error: 'El período de prueba o suscripción de esta institución ha vencido' },
        { status: 403 }
      );
    }

    const sectores = await TurnoService.getSectoresDisponibles(tenant.id);
    return NextResponse.json({ tenant, sectores });
  } catch (error: any) {
    console.error('Error al obtener sectores del tótem:', error);
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
