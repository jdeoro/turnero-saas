import { executeProcedure } from '@/lib/db';
import { Usuario } from '@/types';

export class UsuarioRepository {
  /**
   * Autentica un usuario por DNI y clave dentro del tenant
   */
  static async autenticar(tenantId: number, dni: string, clave: string): Promise<Usuario | null> {
    const rows = await executeProcedure<Usuario>('sp_usuario_autenticar', [
      tenantId,
      dni,
      clave,
    ]);
    return rows[0] || null;
  }

  /**
   * Obtiene la asignación de box/puesto del operador
   */
  static async getBoxOperador(tenantId: number, idUsuario: number): Promise<any | null> {
    const rows = await executeProcedure('spGetBoxOperador', [tenantId, idUsuario]);
    return rows[0] || null;
  }
}
