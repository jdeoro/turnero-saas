import { TenantRepository } from '@/repositories/tenantRepository';
import { Tenant } from '@/types';

export class TenantService {
  /**
   * Resuelve el tenant según el slug de URL o variable de entorno por defecto
   */
  static async resolveTenant(slug?: string): Promise<Tenant | null> {
    const targetSlug = slug || process.env.DEFAULT_TENANT_SLUG || 'demo';
    const tenant = await TenantRepository.getBySlug(targetSlug);
    if (!tenant) return null;

    // Verificar vigencia (trial o suscripción activa)
    const hoy = new Date();
    const trialFin = new Date(tenant.trial_fin);
    tenant.es_vigente = tenant.estado === 'ACTIVO' || (tenant.estado === 'TRIAL_ACTIVO' && hoy <= trialFin);

    return tenant;
  }

  /**
   * Registra un nuevo tenant con 7 días de Free Trial
   */
  static async registerTrial(data: {
    nombre_empresa: string;
    email: string;
    telefono?: string;
    admin_nombre: string;
    admin_dni: string;
    admin_clave: string;
  }): Promise<{ tenantId: number; slug: string }> {
    // Generar slug limpio a partir del nombre de la empresa
    const baseSlug = data.nombre_empresa
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'clinica';

    // Asegurar que no esté repetido
    let slug = baseSlug;
    let existing = await TenantRepository.getBySlug(slug);
    let counter = 1;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await TenantRepository.getBySlug(slug);
      counter++;
    }

    const { id_tenant } = await TenantRepository.registrarCuentaTrial({
      slug,
      nombre_empresa: data.nombre_empresa.trim(),
      email: data.email.trim().toLowerCase(),
      telefono: data.telefono?.trim(),
      admin_nombre: data.admin_nombre.trim(),
      admin_dni: data.admin_dni.trim().replace(/\D/g, ''),
      admin_clave: data.admin_clave,
    });

    return { tenantId: id_tenant, slug };
  }
}
