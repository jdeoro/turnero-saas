import { NextResponse } from 'next/server';
import { TurnoService } from '@/services/turnoService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accion, tenantId, idTurno, idSectorDestino, esPrioritario, observaciones } = body;
    const tId = Number(tenantId || 1);
    const turnoId = Number(idTurno);

    let ok = false;

    switch (accion) {
      case 'iniciar':
        ok = await TurnoService.iniciarAtencion(tId, turnoId);
        break;
      case 'finalizar':
        ok = await TurnoService.finalizarTurno(tId, turnoId);
        break;
      case 'ausente':
        ok = await TurnoService.marcarAusente(tId, turnoId);
        break;
      case 'rellamar':
        ok = await TurnoService.rellamar(tId, turnoId);
        break;
      case 'derivar':
        ok = await TurnoService.derivarTurno({
          tenantId: tId,
          idTurno: turnoId,
          idSectorDestino: Number(idSectorDestino),
          esPrioritario: !!esPrioritario,
          observaciones: observaciones || 'Derivación interna de box',
        });
        break;
      default:
        return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
    }

    return NextResponse.json({ success: ok });
  } catch (error: any) {
    console.error('Error en acción de operador:', error);
    return NextResponse.json({ error: error.message || 'Error en la operación' }, { status: 500 });
  }
}
