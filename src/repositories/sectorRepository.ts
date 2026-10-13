import { executeProcedure } from '@/lib/db';
import { Sector } from '@/types';

export class SectorRepository {
  /**
   * Obtiene todos los sectores activos para el tenant dado
   */
  static async getActivos(tenantId: number): Promise<Sector[]> {
    return await executeProcedure<Sector>('spGetSectoresActivos', [tenantId]);
  }
}
