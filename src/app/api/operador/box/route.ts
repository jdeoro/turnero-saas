import { NextResponse } from 'next/server';
import { TurnoService } from '@/services/turnoService';
import { SectorRepository } from '@/repositories/sectorRepository';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = Number(searchParams.get('tenantId') || 1);
    const idPuesto = Number(searchParams.get('idPuesto') || 0);
    const idSector = Number(searchParams.get('idSector') || 0);

    if (!idPuesto || !idSector) {
      return NextResponse.json(
        { error: 'Puesto y Sector son requeridos para consultar el box' },
        { status: 400 }
      );
    }

    const [actual, cola, sectores] = await Promise.all([
      TurnoService.getActual(tenantId, idPuesto),
      TurnoService.getCola(tenantId, idSector),
      SectorRepository.getActivos(tenantId),
    ]);

    return NextResponse.json({
      actual,
      cola,
      sectores,
    });
  } catch (error: any) {
    console.error('Error al obtener estado del box:', error);
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
