# Matriz de Mapeo y Protocolo de Actualizaciones
## Visual Studio (C# ASP.NET WebForms Legacy) vs. Next.js SaaS Multi-Tenant (TypeScript)

> **Propósito:** Esta guía permite **discriminar con precisión quirúrgica** qué componentes pertenecen al proyecto original en Visual Studio (`C:\SeguimientoGestion.Web`) y cuáles son propios de la nueva arquitectura SaaS Multi-Tenant. Sirve de manual operativo para cuando se incorporen futuras actualizaciones desde Visual Studio sin romper el sistema SaaS.

---

## 1. Mapeo Integral de Equivalencias por Capas

| Capa Funcional | Visual Studio C# (Legacy `_legacy/`) | Next.js SaaS (`src/`) | Responsabilidad |
|---|---|---|---|
| **Base de Datos** | MySQL 5.x / ADO.NET manual | MariaDB 10.11+ / Pool `mysql2/promise` (`src/lib/db.ts`) | Conexiones, transacciones y procedimientos |
| **Acceso a Datos** | `App_Code/DAL/TurnoDal.cs` | `src/repositories/turnoRepository.ts` | Ejecución de `sp_*` de turnos y mapeo |
| **Acceso a Datos** | `App_Code/DAL/SectorDal.cs` | `src/repositories/sectorRepository.ts` | Consulta y gestión de sectores/salas |
| **Acceso a Datos** | `App_Code/DAL/PuestoDal.cs` | `src/repositories/puestoRepository.ts` | Puestos de atención y boxes |
| **Acceso a Datos** | `App_Code/DAL/UsuarioDal.cs` | `src/repositories/usuarioRepository.ts` | Operadores, supervisores y credenciales |
| **Lógica Negocio** | `App_Code/Negocio/Turno.cs` | `src/services/turnoService.ts` | Validaciones, tiempos, estados y colas |
| **Lógica Negocio** | `App_Code/Negocio/Sector.cs` | `src/services/sectorService.ts` | Reglas de sectores y pisos |
| **Lógica Negocio** | `App_Code/Negocio/Usuario.cs` | `src/services/authService.ts` | Autenticación, contraseñas y tokens JWT |
| **Autenticación** | `BasePage.cs` (`Session["Usuario"]`) | Cookies HttpOnly + JWT (`jose`) | Sesión stateless segura |
| **API Backend** | `Totem.aspx.cs` (`[WebMethod]`) | `src/app/api/totem/*/route.ts` | Endpoint REST JSON para kiosco |
| **API Backend** | `Operador.aspx.cs` (`[WebMethod]`) | `src/app/api/operador/*/route.ts` | Endpoint REST para boxes y llamadas |
| **API Backend** | `Carteleria.aspx.cs` (`[WebMethod]`) | `src/app/api/carteleria/*/route.ts` | Endpoint REST para pantallas TV |
| **Interfaz UI** | `Totem.aspx` + `js/totem.js` | `src/app/totem/page.tsx` | Kiosco táctil autoservicio (Tablet Portrait) |
| **Interfaz UI** | `Operador.aspx` + `js/operador.js` | `src/app/operador/page.tsx` | Panel de llamado y cronómetro de box |
| **Interfaz UI** | `Carteleria.aspx` + `js/carteleria.js`| `src/app/tv/page.tsx` | Cartelería widescreen con audio chime |
| **Interfaz UI** | `Login.aspx` | `src/app/login/page.tsx` | Acceso con credenciales seguras |

---

## 2. Matriz de Discriminación: ¿Qué es Nuevo SaaS vs. Qué es Dominio Base?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CAPA SAAS MULTI-TENANT                           │
│  (Exclusivo de Next.js — NO existe en el proyecto de Visual Studio)        │
│                                                                             │
│  • Tabla `saas_tenant` (Planes, Slugs, Estados, Free Trial 7 días)         │
│  • Landing Comercial con SEO (`src/app/page.tsx`)                          │
│  • Formulario de Auto-registro (`src/app/registro/page.tsx`)                │
│  • Multi-Tenancy dinámico por URL (`?slug=clinica-norte`)                   │
│  • `tenant_id` transversal en cada tabla y Stored Procedure                 │
│  • Parámetros institucionales aislados (`cfg_parametros` por tenant)        │
│  • Isotipo Vectorial propio (`TurnosWebLogo`)                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOMINIO BASE COMPARTIDO                          │
│  (Lógica que evoluciona en Visual Studio y se replica en Next.js)           │
│                                                                             │
│  • Ciclo de Vida del Turno:                                                 │
│    EN_ESPERA ──► LLAMADO ──► EN_ATENCION ──► FINALIZADO                     │
│         ▲                                         │                         │
│         └── DERIVADO_EN_ESPERA / AUSENTE ◄────────┘                         │
│                                                                             │
│  • Procedimientos de Emisión en Tótem (`spInsertTurnoTotem`)                │
│  • Prioridades de llamada (derivaciones y urgencias primero)                │
│  • Algoritmo de Box / Puesto (`spGetSiguiente`, `spGetTurnoActual`)         │
│  • Cartelería TV con chime de audio y zócalo de noticias                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mapeo de Stored Procedures (Legacy vs. SaaS)

Cuando Visual Studio modifique o agregue un procedimiento, debe traducirse siguiendo este patrón:

| Procedimiento Original (C# Legacy) | Procedimiento SaaS (Next.js MariaDB) | Diferencia Clave SaaS |
|---|---|---|
| `spGetTurnoActual(p_id_puesto)` | `spGetTurnoActual(p_id_puesto, p_tenant_id)` | Filtra por box Y tenant |
| `spGetTurnoenCola(p_id_sector)` | `spGetTurnoenCola(p_id_sector, p_tenant_id)` | Ordena por urgencia + tenant |
| `spGetSiguiente(p_puesto, p_usuario, p_sector)` | `spGetSiguiente(p_puesto, p_usuario, p_sector, p_tenant_id)` | Asigna turno respetando aislamiento |
| `spInsertTurnoTotem(dni, sector, prioritario, obs)` | `spInsertTurnoTotem(dni, sector, prioritario, obs, p_tenant_id)` | Genera código único `A-001` por tenant |
| `spGetTurnosCarteleria(limite, piso, sector)` | `spGetTurnosCarteleria(limite, piso, sector, p_tenant_id)` | Devuelve últimos llamados del tenant |
| `sp_usuario_autenticar(dni, clave)` | `sp_usuario_autenticar(dni, clave, p_slug)` | Autentica contra el tenant de la URL |

> **Regla de Oro en Procedimientos:**  
> Todo procedimiento que venga de Visual Studio **debe recibir `IN p_tenant_id INT`** y tener la condición:  
> `WHERE tenant_id = IFNULL(p_tenant_id, 1)`  
> De este modo, si se omite el tenant o se prueba como stand-alone, funciona sin errores en el tenant por defecto (1).

---

## 4. Protocolo para Incorporar Actualizaciones Futuras de Visual Studio

Cuando el desarrollador o líder técnico traiga cambios desde Visual Studio:

### Paso 1: Recepción del Cambio
* Copiar los archivos nuevos o actualizados en una carpeta temporal `_legacy_updates/`.
* Identificar qué capa fue modificada:
  1. ¿Es un Stored Procedure o consulta SQL?
  2. ¿Es un archivo `.cs` de `Negocio/` o `DAL/`?
  3. ¿Es un método `[WebMethod]` en un `.aspx.cs`?
  4. ¿Es un cambio de comportamiento en la interfaz `js/*.js`?

### Paso 2: Análisis de Diferencias (Diff)
* Comparar el archivo nuevo contra el snapshot base en `turnero/_legacy/`.
* Aislar únicamente la **nueva regla de negocio** o **nuevo campo**.

### Paso 3: Traducción Arquitectónica a Next.js (SoC Estricto)
1. **Si agregó un campo o tabla en la BD:**
   * Agregar el campo a la tabla en `db/schema_saas.sql` asegurando el `tenant_id`.
   * Actualizar el procedimiento correspondiente con `p_tenant_id`.
   * Actualizar los tipos TypeScript en `src/types/index.ts`.
2. **Si modificó lógica en `TurnoDal.cs` o `Turno.cs`:**
   * Modificar el repositorio en `src/repositories/turnoRepository.ts`.
   * Adaptar el servicio en `src/services/turnoService.ts`.
3. **Si cambió la lógica de pantalla (Operador, Tótem o TV):**
   * Actualizar la API Route en `src/app/api/...`.
   * Actualizar el componente React (`src/app/operador/page.tsx`, etc.) manteniendo el responsive design y el tema visual.

### Paso 4: Qué NUNCA debe sobreescribirse ni eliminarse
* **NO** eliminar la columna `tenant_id` de ninguna tabla.
* **NO** alterar la lógica de Free Trial de 7 días (`saas_tenant.trial_fin`).
* **NO** sobreescribir `src/components/TurnosWebLogo.tsx` ni el sistema responsive en `globals.css`.
* **NO** volver a poner conexiones hardcodeadas o claves en texto plano.

---

## 5. Resumen de Versión Actual Sincronizada
* **Snapshot Legacy Sincronizado:** Versión 1.0 de `C:\SeguimientoGestion.Web` (59 archivos en `turnero/_legacy/`).
* **Esquema de BD:** MariaDB 10.11 `desarro2_turnosmedicos` con 8 tablas multi-tenant y 16 Stored Procedures.
* **Frontend:** Next.js 14 App Router, TypeScript, Responsive Tablet-First, 7 días de Free Trial.
