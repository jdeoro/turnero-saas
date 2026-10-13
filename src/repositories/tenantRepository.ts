import { executeProcedure, query } from '@/lib/db';
import { Tenant } from '@/types';

export class TenantRepository {
  /**
   * Obtiene un tenant por su slug identificador
   */
  static async getBySlug(slug: string): Promise<Tenant | null> {
    const rows = await executeProcedure<Tenant>('sp_saas_obtener_tenant_por_slug', [slug]);
    return rows[0] || null;
  }

  /**
   * Obtiene un tenant por ID numérico
   */
  static async getById(id: number): Promise<Tenant | null> {
    const rows = await query<Tenant[]>(
      `SELECT id, slug, nombre_empresa, email_contacto, telefono, plan, estado, trial_fin, activo,
              IF(NOW() <= trial_fin OR estado = 'ACTIVO', 1, 0) AS es_vigente
       FROM saas_tenant
       WHERE id = ? AND activo = 1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Registra una nueva cuenta / clínica con 7 días de Free Trial
   */
  static async registrarCuentaTrial(params: {
    slug: string;
    nombre_empresa: string;
    email: string;
    telefono?: string;
    admin_nombre: string;
    admin_dni: string;
    admin_clave: string;
  }): Promise<{ id_tenant: number; id_usuario: number }> {
    const rows = await executeProcedure<{ id_tenant: number; id_usuario: number }>(
      'sp_saas_registrar_cuenta_trial',
      [
        params.slug,
        params.nombre_empresa,
        params.email,
        params.telefono || null,
        params.admin_nombre,
        params.admin_dni,
        params.admin_clave,
      ]
    );
    return rows[0] || { id_tenant: 0, id_usuario: 0 };
  }
}
