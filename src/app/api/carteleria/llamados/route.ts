import { NextResponse } from 'next/server';
import { TurnoService } from '@/services/turnoService';
import { TenantService } from '@/services/tenantService';
import { query } from '@/lib/db';
import { ParametroApp } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || undefined;
    const piso = searchParams.get('piso') || undefined;
    const idSector = searchParams.get('idSector') ? Number(searchParams.get('idSector')) : undefined;
    const limite = searchParams.get('limite') ? Number(searchParams.get('limite')) : 6;

    const tenant = await TenantService.resolveTenant(slug);
    if (!tenant) {
      return NextResponse.json({ error: 'Institución no encontrada' }, { status: 404 });
    }

    const [turnos, parametros] = await Promise.all([
      TurnoService.getCarteleria(tenant.id, limite, piso, idSector),
      query<ParametroApp[]>('SELECT clave, valor FROM cfg_parametros WHERE tenant_id = ?', [tenant.id]),
    ]);

    // Reducir parámetros a un objeto clave-valor
    const cfg = (parametros || []).reduce((acc: Record<string, string>, item) => {
      acc[item.clave] = item.valor;
      return acc;
    }, {});

    return NextResponse.json({
      turnos,
      config: {
        titulo: cfg.tituloApp || tenant.nombre_empresa,
        color: cfg.colorId || '#1A95E2',
        zocalo: cfg.zocalo || 'Por favor preste atención al llamado en pantalla y conserve su ticket.',
        zocaloVisible: cfg.zocaloVisible === '1',
        tema: cfg.carteleriaTema || 'oscuro',
      },
    });
  } catch (error: any) {
    console.error('Error al obtener llamados para cartelería:', error);
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
