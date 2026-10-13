import { NextResponse } from 'next/server';
import { TurnoService } from '@/services/turnoService';
import { TenantService } from '@/services/tenantService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, dni, idSector, esPrioritario } = body;

    const tenant = await TenantService.resolveTenant(slug);
    if (!tenant) {
      return NextResponse.json({ error: 'Institución no válida' }, { status: 404 });
    }

    if (!tenant.es_vigente) {
      return NextResponse.json(
        { error: 'El período de prueba de la institución ha expirado.' },
        { status: 403 }
      );
    }

    const turno = await TurnoService.emitirTurno({
      tenantId: tenant.id,
      dni: dni || '',
      idSector: Number(idSector),
      esPrioritario: !!esPrioritario,
    });

    return NextResponse.json({ success: true, turno });
  } catch (error: any) {
    console.error('Error al emitir turno en tótem:', error);
    return NextResponse.json({ error: error.message || 'Error al emitir turno' }, { status: 500 });
  }
}
