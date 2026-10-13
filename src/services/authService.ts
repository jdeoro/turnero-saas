import { UsuarioRepository } from '@/repositories/usuarioRepository';
import { Usuario } from '@/types';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'super_secret_jwt_token_development_key_32bytes'
);

export class AuthService {
  /**
   * Autentica usuario en la BD y genera un token JWT firmado
   */
  static async login(
    tenantId: number,
    dni: string,
    clave: string
  ): Promise<{ usuario: Usuario; token: string } | null> {
    const dniLimpio = dni.replace(/\D/g, '').trim();
    const usuario = await UsuarioRepository.autenticar(tenantId, dniLimpio, clave.trim());
    if (!usuario) return null;

    // Obtener asignación de box si es operador
    const box = await UsuarioRepository.getBoxOperador(tenantId, usuario.id);
    if (box) {
      usuario.id_puesto = box.id_puesto;
      usuario.puesto_nombre = box.puesto;
      usuario.id_sector = box.id_sector;
      usuario.sector_nombre = box.sector;
    }

    const token = await new SignJWT({
      id: usuario.id,
      tenant_id: usuario.tenant_id,
      nombre: usuario.nombre,
      dni: usuario.dni,
      rol_id: usuario.rol_id,
      rol_nombre: usuario.rol_nombre,
      id_puesto: usuario.id_puesto,
      id_sector: usuario.id_sector,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    return { usuario, token };
  }

  /**
   * Verifica un token JWT
   */
  static async verifyToken(token: string): Promise<any | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload;
    } catch {
      return null;
    }
  }
}
