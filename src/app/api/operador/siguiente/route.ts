import { NextResponse } from 'next/server';
import { TurnoService } from '@/services/turnoService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, idPuesto, idUsuario, idSector } = body;

    const turno = await TurnoService.llamarSiguiente({
      tenantId: Number(tenantId || 1),
      idPuesto: Number(idPuesto),
      idUsuario: Number(idUsuario),
      idSector: Number(idSector),
    });

    return NextResponse.json({
      success: true,
      turno, // null si no hay turnos en cola
    });
  } catch (error: any) {
    console.error('Error al llamar siguiente turno:', error);
    return NextResponse.json({ error: error.message || 'Error al llamar siguiente' }, { status: 500 });
  }
}
