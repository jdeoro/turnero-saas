# recordatorio.md — Migración "Seguimiento de Turnos" (VS/C# → Next.js)

> Última actualización: 2026-10-12 14:40
> Estado: **FASE 1 COMPLETADA**. Base de datos adaptada a SaaS MariaDB 10.11 (`db/schema_saas.sql`), arquitectura en capas creada (Data / Business / API / UI), landing comercial con SEO, Tótem, TV y Operador implementados en Next.js. Infraestructura confirmada en WizHosting (`turnos.desarrollosweb.net.ar`).

---

## 1. Contexto y objetivo
- Proyecto origen (Visual Studio): `C:\SeguimientoGestion.Web` (ASP.NET WebForms, .NET Framework 4.8.1, C#).
- Copia de trabajo (sin `bin/obj/packages/.vs`): `turnero/_legacy/` (59 archivos). **No modificar `_legacy`**, es solo referencia.
- Destino: esta carpeta `turnero/` → proyecto Next.js (Node) equivalente.
- Base de datos: **MySQL**, BD `db_queue_manager`. En el MySQL local (5.0.85) la BD existe pero está **vacía** (0 tablas); el esquema real se recuperó del backup (secciones 9 y 10).
- Documento funcional del project leader: `_legacy/Sistema de seguimiento de personas dentro de un edificio.docx`.

### Nota de entorno
- El agente solo accede a `turnero/`. `C:\SeguimientoGestion.Web` daba "Permission denied"; se resolvió copiando con `robocopy` a `_legacy`. `run_command` sí puede leer rutas externas (se copió `C:\dwn\*.nb3` a `_backup/`).

---

## 2. Lineamientos funcionales (documento del PL)
Sistema de seguimiento de personas en un edificio, 4 interfaces:
1. **Tótem / seguridad:** CON TURNO / SIN TURNO → DNI (afiliado/no afiliado) → trámite por sector/piso → ticket térmico (ej. `T-042 - Reintegros - Subsuelo - 3 personas antes`).
2. **Panel Operador/Box:** cola priorizada (derivados/urgencias primero, luego llegada). Llamar siguiente, Rellamar, Iniciar atención (cronómetro), Ausente (cola de ausentes), Finalizar, **Derivar** (sector destino, alta prioridad, notas internas).
3. **Cartelería TV/Audio:** pantalla pasiva widescreen, 2 paneles, llamados en tiempo real por piso/sector.
4. **Recepción Central / Supervisión:** gente esperando por piso en tiempo real, búsqueda por DNI/ticket, pausar colas.

Casos de uso: CU-01 emisión espontánea, CU-02 check-in con cita (ventana ±30 min, si no → ticket Mesa de Entrada), CU-03 llamado/atención, CU-04 derivación (estado `DERIVADO_EN_ESPERA`, mismo ticket, prioridad alta).

---

## 3. Arquitectura detectada (legacy)
- **Patrón:** N-Capas WebForms. Flujo:
  `*.aspx.cs ([WebMethod] static)` → `App_Code/Negocio/*` → `App_Code/DAL/*` → `DatabaseHelper` → MySQL.
- **Todo es `static class`.** Sin DI, sin interfaces, sin ORM, sin Singletons formales.
- **Frontend:** JS vanilla en `_legacy/js/*.js`, `fetch('Pagina.aspx/Metodo')` con JSON. Polling (operador 5 s; cartelería `frecuenciaMs`). Sin WebSockets/SignalR.
- **Sesión:** `BasePage` (App_Code) valida `Session["Usuario"]` en `OnInit`; `RequiereAutenticacion => false` en Login, Totem, Carteleria.
- **Config institucional:** `ConfiguracionApp` lee tabla `cfg_parametros` (clave/valor), caché 30 s. Claves: `colorId`, `logoApp`, `tituloApp`, `zocalo`, `zocaloVisible`, `zocaloRefrescoMinutos`, `carteleriaTema` (`oscuro`/`claro`).
- **Roles:** `Administrador`, `Supervisor`, `Operador`. `Configuracion` solo Admin/Supervisor.
- **Convenciones:** PascalCase C#, nombres en español, prefijos DAL `Get/Update/Insert/Toggle`, parámetros SQL `p_snake_case`. Bajas lógicas con `Toggle*Activo`.
- **Sin AFIP ni APIs externas.** El endpoint de afiliados del documento **NO está integrado** (`TitNroAfi` existe en `TurnoDto`, nunca se consulta).

### Mapa de archivos legacy
| Capa | Archivos |
|---|---|
| Páginas | `Login`, `Default`, `Operador`, `Totem`, `Carteleria`, `Configuracion`, `Site.Master` (+ `.cs`) |
| Base | `App_Code/BasePage.cs`, `ConfiguracionApp.cs`, `MysqlCon.cs` |
| DAL | `DatabaseHelper`, `TurnoDal`, `UsuarioDal`, `PuestoDal`, `SectorDal` |
| Negocio | `Turno`, `Usuario`, `Puesto`, `Sector` |
| DTOs | `TurnoDto`, `UsuarioDto`, `PuestoDto`, `SectorDto`, `RolDto` |
| Estáticos | `css/{styles,totem,carteleria,configuracion}.css`, `js/{totem,operador,carteleria,configuracion}.js`, `img/logo.png` |

---

## 4. Persistencia (MySQL)
- **100 % Stored Procedures** vía ADO.NET (`MySqlCommand` + `CommandType.StoredProcedure`). Única excepción: `SELECT clave, valor FROM cfg_parametros` en `ConfiguracionApp`.
- Cadena de conexión (Web.config): BD `db_queue_manager`, `pooling=false`, `Allow Zero Datetime=True`, `CharSet=utf8mb4`.
  - `DatabaseHelper`: `connectionStrings["mysqlcnx"]` → fallback `appSettings` (`mysqlcnx`, `PsicoFisicoPruebas`).
  - `MysqlCon`: solo `appSettings`, con defaults hardcodeados.
- Ciclo: 1 conexión por llamada (`using`). Mapeo manual por nombre de columna (`switch`).
- **Transacciones:** hay sobrecarga con `MySqlTransaction` en `DatabaseHelper`, **no se usa**. La atomicidad vive en los SP.
- **Los SP NO están en el repo** (0 resultados de `CREATE PROCEDURE`). Hay que **reconstruirlos** desde los contratos de la DAL.

### Contratos de Stored Procedures (parámetros → resultado)

**Turnos**
| SP | Parámetros | Resultado |
|---|---|---|
| `spGetTurnoActual` | `p_id_puesto INT` | 1 fila turno (o vacío) |
| `spGetTurnoenCola` | `p_id_sector INT` | N filas, orden prioridad + llegada, con `minutos_espera` |
| `spGetSiguiente` | `p_id_puesto, p_id_usuario, p_id_sector` | turno pasado a LLAMADO (o vacío) |
| `spUpdateInicioAtencion` | `p_id_turno` | escalar >0 = ok (→ EN_ATENCION, `fecha_inicio_atencion`) |
| `spUpdateFinalizar` | `p_id_turno` | escalar >0 (→ FINALIZADO) |
| `spUpdateAusente` | `p_id_turno` | escalar >0 (→ AUSENTE) |
| `spUpdateDerivar` | `p_id_turno, p_id_sector_destino, p_es_prioritario TINYINT, p_observaciones VARCHAR(500)` | escalar >0 |
| `spInsertTurnoTotem` | `p_dni VARCHAR(20) NULL, p_id_sector, p_es_prioritario, p_observaciones VARCHAR(500)` | turno emitido con `codigoticket`, `personas_antes` |
| `spRellamarTurno` | `p_id_turno` | escalar >0 |
| `spGetTurnosAusentes` | `p_id_sector` | N filas (ausentes del día) |
| `spReactivarTurnoAusente` | `p_id_turno` | escalar >0 (vuelve a cola, prioridad alta) |
| `spGetTurnosCarteleria` | `p_limite INT, p_piso VARCHAR(50) NULL, p_id_sector INT NULL` | últimos llamados/en atención del día |

Columnas que devuelven los SP de turno (las que mapea `TurnoDal.MapearTurno`):
`id_turno, codigoticket, dni, titnroafi, id_sector, id_puesto, id_usuario_operador, estado, es_prioritario, observaciones, fecha_emision, fecha_llamado, fecha_inicio_atencion, fecha_fin_atencion, minutos_espera, sector_descripcion, puesto_descripcion, operador_nombre, personas_antes, piso`.

**Usuarios**
| SP | Parámetros | Resultado |
|---|---|---|
| `sp_usuario_autenticar` | `p_dni VARCHAR(20), p_clave VARCHAR(50)` | usuario (`id, nombre, dni, email, estado, rol_id, rol_nombre` + opcionales `id_puesto, puesto_nombre, id_sector, sector_nombre, sector_piso`) |
| `sp_usuario_obtener_por_id` | `p_id` | idem |
| `spGetUsuariosAdmin` | — | N usuarios |
| `spGetRoles` | — | `id, nombre, descripcion` |
| `spInsertUsuario` | `p_nombre(100), p_dni(20), p_clave(50), p_email(100) NULL, p_rol_id` | escalar = id nuevo |
| `spUpdateUsuario` | `p_id_usuario, p_nombre, p_dni, p_clave NULL (null = conservar), p_email NULL, p_rol_id, p_estado TINYINT` | filas afectadas |
| `spToggleUsuarioActivo` | `p_id_usuario` | escalar bool = nuevo estado |

**Puestos**
| SP | Parámetros | Resultado |
|---|---|---|
| `spGetBoxOperador` | `p_id_usuario` | puesto + sector del operador |
| `spGetPuestosAdmin` | — | N puestos (`id_puesto, descripcion/puesto, id_sector, sector, piso, letraticket, tiempo_estimado, id_usuario_operador, activo, fecha_alta, operador_nombre`) |
| `spInsertPuesto` | `p_descripcion(50), p_id_sector, p_id_usuario_operador NULL` | escalar = id |
| `spUpdatePuesto` | `p_id_puesto, p_descripcion, p_id_sector, p_id_usuario_operador NULL, p_activo` | filas |
| `spTogglePuestoActivo` | `p_id_puesto` | escalar bool |

**Sectores**
| SP | Parámetros | Resultado |
|---|---|---|
| `spGetSectoresActivos` | — | N sectores (`id_sector, descripcion, piso, letraticket, tiempo_estimado, pausado, activo, fecha_alta`) |
| `spGetSectoresAdmin` | — | idem, todos |
| `spInsertSector` | `p_descripcion(100), p_piso(30), p_letra_ticket(2), p_tiempo_estimado INT` | escalar = id |
| `spUpdateSector` | `p_id_sector, p_descripcion, p_piso, p_letra_ticket, p_tiempo_estimado, p_pausado, p_activo` | filas |
| `spToggleSectorActivo` | `p_id_sector` | escalar bool |

**Tablas inferidas (no vistas):** `turnos`, `sectores`, `puestos`, `usuarios`, `roles` (+ relación usuario-rol), `cfg_parametros(clave, valor)`.
**Estados de turno (inferidos, confirmar):** `EN_ESPERA`, `LLAMADO`, `EN_ATENCION`, `FINALIZADO`, `AUSENTE`, `DERIVADO_EN_ESPERA`.

---

## 5. Endpoints legacy (WebMethods) a replicar como API
- **Totem:** `ObtenerSectores`, `EmitirTurno(dni, idSector, esPrioritario)`, `ConsultarTurnoProgramado(dni)` *(stub: emite a sector 1 "Mesa de Entrada")*.
- **Operador:** `ObtenerBoxOperador`, `ObtenerActual(idPuesto)`, `ObtenerEnCola(idSector)`, `LlamarSiguiente(idPuesto, idSector)`, `IniciarAtencion`, `Finalizar`, `MarcarAusente`, `Derivar(idTurno, idSectorDestino, esPrioritario, observaciones)`, `Rellamar`, `ObtenerAusentes`, `ReactivarAusente`, `ObtenerSectores`.
- **Carteleria:** `ObtenerLlamadosCarteleria(piso, idSector)` (límite 6), `ObtenerSectoresSalas`, `ObtenerConfiguracionZocalo`. Query params: `?piso=`, `?sector=`, `?tema=claro|oscuro`. `localStorage`: `carteleria_theme`, `carteleria_sector`.
- **Configuracion (Admin/Supervisor):** `ObtenerDatosIniciales`, `GuardarSector`, `ToggleSector`, `GuardarPuesto`, `TogglePuesto`, `GuardarUsuario`, `ToggleUsuario`.
- **Login:** DNI + clave → sesión (`Usuario`, `Usuario_Id/Nombre/DNI/Rol`) → `Default`.

### Reglas de negocio en capa Negocio (portar tal cual)
- IDs `<= 0` → `null`/`false`/lista vacía.
- Textos: `Trim`; vacíos → `null`.
- Usuario: DNI sin `.` ni espacios; clave obligatoria solo al crear; en update clave vacía = conservar.
- Sector: letra ticket `ToUpper`, máx. 2 chars; piso vacío → `"Planta Baja"`; tiempo estimado `<= 0` → 10.
- Autenticar: rechaza si `estado == false`.

---

## 6. Hallazgos / deuda a corregir en la migración
1. **Tótem incompleto:** sin agenda ni ventana ±30 min (CU-02), sin validación afiliado, **sin impresión** de ticket (solo beep).
2. **Pantalla 4 (Recepción Central) NO existe:** sin vista global por piso, sin búsqueda DNI/ticket, sin UI para pausar colas (solo campo `pausado` editable en Configuración).
3. **Seguridad:**
   - Claves en **texto plano** hacia el SP (`p_clave VARCHAR(50)`). → usar hash (bcrypt/argon2).
   - Credenciales `root` en `Web.config`. → variables de entorno.
   - `customErrors Off`.
   - WebMethods de Operador **sin validar sesión/ownership**; los de Configuración **sin validar rol** (solo en `Page_Load`).
4. **Duplicación:** `MysqlCon` y `DatabaseHelper`; sesión guardada en `Usuario` y `Usuario_*`.
5. Transacciones sin uso (atomicidad solo en SP).

---

## 7. Plan propuesto (pendiente de OK del usuario)
1. **`turnero/db/`:** reconstruir esquema MySQL + todos los SP (sección 4) + seeds (roles, usuario admin, sectores, `cfg_parametros`). La BD no existe todavía.
2. **Proyecto Next.js (TypeScript):** misma separación de capas:
   `app/api (rutas) → services (negocio) → repositories (mysql2, CALL sp) → db/pool`.
3. Auth con sesión segura (cookie httpOnly) + middleware por rol + hash de claves.
4. Portar pantallas: Login, Default, Operador, Totem, Carteleria, Configuracion; luego construir Recepción Central.
5. Pruebas unitarias en servicios (reglas de la sección 5).

### Preguntas abiertas
- ¿Existe dump/scripts SQL originales de `db_queue_manager`? Si no → se infieren desde la DAL.
- ¿Estados de turno exactos y reglas de prioridad de `spGetSiguiente`? (inferidos del documento).
- ¿Impresión térmica: cómo se imprimirá en Next.js (`window.print`, ESC/POS, servicio local)?
- ¿Endpoint de afiliados: URL/contrato? ¿Se integra ahora o se deja mockeado?
- ¿Modelo de agenda para CU-02 (tabla propia o sistema externo)?

---

## 8. Registro de acciones realizadas
- [x] Análisis exhaustivo del proyecto legacy (App_Code, code-behind, Web.config, csproj, JS por grep).
- [x] Copia a `turnero/_legacy` (robocopy, 59 archivos, 0 errores).
- [x] Creación de este `recordatorio.md`.
- [x] Backup `.nb3` copiado a `turnero/_backup/`, extraído y decodificado (sección 9).
- [x] Generado `turnero/db/db_queue_manager.sql` (7 tablas + datos + 30 SP) con `_backup/tools/build-restore-sql.mjs`.
- [ ] **Restaurar en un MySQL moderno** (el local 5.0.85 no puede, sección 9).
- [ ] Scaffolding Next.js.

---

## 9. Backup Navicat y restauración (2026-10-12)

### Formato del `.nb3`
- `20261012011627.nb3` (60 KB) es un **TAR** con `meta.json` + por objeto `*.meta.json.gz` (contiene el DDL) y `*.data.NNNNN.sql.gz` (filas `(v1,v2,...)` separadas por el byte `0x1E`, sin `INSERT`).
- No lo lee `mysql`/Workbench: solo Navicat. Se puede extraer con `tar -xf` + gunzip.
- Copia en `turnero/_backup/`; extraído en `_backup/extracted/` y `_backup/extracted/out/` (descomprimido).

### Contenido real (reemplaza lo inferido de la sección 4)
- **7 tablas:** `cfg_parametros` (7 filas), `cfg_sector` (6), `seg_rol` (3), `seg_usuario` (3), `seg_usuario_rol` (3), `cfg_puesto` (8), `trn_turno` (19).
- **30 procedimientos:** los 29 de la sección 4 + `Sp_getLoginId` (no usado por la DAL).
- **Charset/collation:** `utf8mb4` / `utf8mb4_unicode_ci`, InnoDB.
- **`trn_turno`** (confirmado): `id_turno, codigoTicket varchar(10), dni varchar(20), titnroafi int (0 = no afiliado), id_sector, id_puesto NULL, id_usuario_operador NULL, estado varchar(25) DEFAULT 'EN_ESPERA', es_prioritario tinyint, observaciones varchar(500), fecha_emision DEFAULT CURRENT_TIMESTAMP, fecha_llamado, fecha_inicio_atencion, fecha_fin_atencion`. Índice de cola `(id_sector, estado, es_prioritario, fecha_emision)`. FKs a `cfg_sector` (restrict), `cfg_puesto` y `seg_usuario` (SET NULL).
- **Estados confirmados:** `EN_ESPERA, DERIVADO_EN_ESPERA, LLAMADO, EN_ATENCION, FINALIZADO, AUSENTE`.
- **Login:** `sp_usuario_autenticar` compara `u.clave = p_clave` en **texto plano**, `estado = 1`, `LEFT JOIN seg_usuario_rol/seg_rol`.
- Orden de carga por FKs: `cfg_parametros, cfg_sector, seg_rol, seg_usuario, seg_usuario_rol, cfg_puesto, trn_turno`, luego los SP.

### Por qué falla la restauración en el servidor local
- `127.0.0.1:3306` (servicio Windows `MySQL`, `mysqld-nt`) es **MySQL 5.0.85-community (2009)**.
- Error: `ER_UNKNOWN_CHARACTER_SET: 'utf8mb4'` (utf8mb4 existe desde 5.5.3).
- Además 5.0 **no admite `DATETIME DEFAULT CURRENT_TIMESTAMP`** (`trn_turno.fecha_emision`; solo TIMESTAMP). Otros fallos probables.
- La BD `db_queue_manager` local sigue **vacía (0 tablas)**; no se modificó nada.
- El cliente `mysql.exe` del PATH también es 5.0 (`C:\Program Files (x86)\MySQL\MySQL Server 5.0\bin`): no sirve. Se usa `mysql2` de Node.
- El proyecto legacy apuntaba a `172.16.10.2:33306` (servidor moderno).

### Opciones (pendiente de decisión)
1. **Recomendada:** MySQL 8.x o MariaDB 10.x en otro puerto (p. ej. 3307) o Docker, sin tocar el 5.0 que usan las otras BD de Navicat (`desarro2_data`, `turnos_medicos`, etc.).
2. Degradar el DDL a `utf8` + `TIMESTAMP` (diverge del original; pierde caracteres de 4 bytes). No recomendada.
3. Apuntar la app a otro servidor moderno ya existente.

### Cómo restaurar cuando haya un servidor moderno
```powershell
cd turnero\_backup\tools
$env:DB_HOST='127.0.0.1'; $env:DB_PORT='3307'; $env:DB_USER='root'; $env:DB_PASSWORD='<clave>'; $env:DB_NAME='db_queue_manager'
node build-restore-sql.mjs --run   # crea tablas, inserta datos y crea los 30 SP
```
- Alternativa: ejecutar `turnero/db/db_queue_manager.sql` (usa `DELIMITER $$`, para cliente `mysql` moderno).
- Credenciales: **nunca** en el repo; irán en `turnero/.env.local` (gitignored). La clave de `root` circuló por chat → rotarla.
- Navicat: la conexión `localhost-prueba` es solo el nombre de la conexión en Navicat (no un host). Verificar en sus propiedades host/puerto/versión.

---

## 10. PUNTO DE RETOMA (leer esto primero al continuar)

### Dónde estamos
- Análisis del legacy: **completo** (secciones 3–6).
- Backup decodificado y script de restauración listo: **completo** (sección 9).
- Restauración efectiva: **bloqueada** por MySQL 5.0.85 local sin `utf8mb4`.
- Código Next.js: **no iniciado** (esperando OK del usuario al plan de la sección 7).

### Decisión pendiente del usuario (desbloquea todo)
Elegir servidor MySQL moderno para `db_queue_manager`:
1. (Recomendada) MySQL 8 / MariaDB 10 en otro puerto (ej. 3307) o Docker.
2. Servidor moderno ya existente (ej. `172.16.10.2:33306` del legacy): pasar host/puerto.
3. Degradar a `utf8` + `TIMESTAMP` (no recomendada).
Además: confirmar versión/host/puerto reales de la conexión Navicat `localhost-prueba`.

### Inventario de archivos creados en `turnero/`
| Ruta | Contenido |
|---|---|
| `recordatorio.md` | Este registro |
| `_legacy/` | Copia del proyecto C# (solo lectura, 59 archivos) |
| `_backup/20261012011627.nb3` | Backup Navicat original (copia) |
| `_backup/extracted/` | TAR extraído (`meta.json` + `.gz`) |
| `_backup/extracted/out/` | `.gz` descomprimidos (DDL en `*.meta.json`, filas en `*.data.*.sql`) |
| `_backup/tools/build-restore-sql.mjs` | Genera el SQL y, con `--run`, lo ejecuta con `mysql2` |
| `_backup/tools/package.json`, `node_modules/` | Solo dependencia `mysql2` (herramienta auxiliar) |
| `db/db_queue_manager.sql` | SQL completo generado: 7 tablas + datos + 30 SP |

### Próximos pasos (en orden, tras la decisión anterior)
1. Restaurar la BD en el servidor moderno (`node build-restore-sql.mjs --run`) y verificar: `SHOW TABLES` = 7, `SHOW PROCEDURE STATUS` = 30, conteos de filas (7/6/3/3/3/8/19).
2. Leer los DDL reales de los 30 SP desde `_backup/extracted/out/*.meta.json` y dejar `db/` ordenado (`schema.sql`, `procedures.sql`, `seed.sql`).
3. Crear proyecto Next.js + TypeScript con capas: `app/api` → `services` → `repositories` (`mysql2`, `CALL sp_*`) → `db/pool`.
4. Auth: cookie httpOnly + middleware por rol (Administrador/Supervisor/Operador); migrar claves a hash (los SP actuales comparan texto plano → habrá que adaptar `sp_usuario_autenticar`/`spInsertUsuario`/`spUpdateUsuario`).
5. Portar pantallas: Login, Default, Operador, Totem, Carteleria, Configuracion; luego Recepción Central (nueva).
6. Tests unitarios de servicios (reglas de la sección 5).

### Reglas de trabajo del usuario (recordar)
- Antes de ejecutar: presentar **Interpretación (QUÉ)** + **Propuesta (CÓMO)** ultra breves y esperar **un único OK**; luego ejecución autónoma.
- Preguntas de sí/no → responder solo "Sí"/"No".
- **No** ejecutar build/dev/compilación por iniciativa propia (solo si el usuario lo pide expresamente).
- Cambios atómicos y no destructivos; separación estricta Lógica de negocio / Datos / UI.
- Validar por resultado real (indicar origen de datos, null/undefined, condición de render, cómo se verificó).
- PowerShell: no usar `&&` (usar `;`).
- Secretos solo en `.env.local`; nunca en el repo ni en este archivo.

### Seguridad pendiente
- Rotar la clave de `root` (circuló por chat).
- Crear usuario MySQL dedicado para la app (solo permisos sobre `db_queue_manager`).
- Reemplazar claves en texto plano por hash.

---

## 11. Arquitectura SaaS Multi-Tenant y Avance (2026-10-12)

### Infraestructura Confirmada en WizHosting
- **Motor DB:** MariaDB 10.11.19 (`desarro2_turnosmedicos`) en cPanel (`localhost:3306`), totalmente compatible con `utf8mb4` y Stored Procedures.
- **Subdominio activo con SSL:** `turnos.desarrollosweb.net.ar`.
- **Node.js en cPanel:** Mismo patrón probado de Express/Passenger con ES Modules (`loader.cjs`).

### Archivos Implementados (SoC Estricto)
1. **Base de Datos Multi-Tenant:**
   - `db/schema_saas.sql`: Importado con éxito en `desarro2_turnosmedicos` en WizHosting (71 consultas ejecutadas).
2. **Compilación de Producción:**
   - `turnero_deploy.zip` (9.5 MB): Compilación exitosa (`npm run build`), incluye `.next`, `server.js`, `package.json`, `.env` y configuración para Phusion Passenger en cPanel.
2. **Capa de Datos:**
   - `src/lib/db.ts`: Pool singleton de `mysql2/promise` y helper de procedimientos.
   - `src/repositories/`: `tenantRepository.ts`, `turnoRepository.ts`, `sectorRepository.ts`, `usuarioRepository.ts`.
3. **Capa de Negocio:**
   - `src/services/`: `tenantService.ts` (resolución de slugs y control de trial), `turnoService.ts` (reglas de emisión, llamada y derivación), `authService.ts` (tokens JWT firmados con Jose).
4. **Endpoints API:**
   - `src/app/api/saas/register/route.ts`: Auto-registro de prueba 14 días.
   - `src/app/api/totem/sectores/route.ts` & `emitir/route.ts`: Flujo del tótem.
   - `src/app/api/operador/box/route.ts`, `siguiente/route.ts`, `acciones/route.ts`: Box y cola de atención.
   - `src/app/api/carteleria/llamados/route.ts`: Datos para cartelería de TV.
   - `src/app/api/auth/login/route.ts`, `me/route.ts`, `logout/route.ts`: Sesión en cookie HttpOnly.
5. **Capa de UI:**
   - `src/app/globals.css`: Sistema de diseño moderno, tema oscuro, responsive y sin dependencias de Tailwind.
   - `src/app/layout.tsx`: SEO completo con metadatos estructurados (JSON-LD, OpenGraph, Canonical).
   - `src/app/page.tsx`: Landing page comercial orientada a conversión y SEO.
   - `src/app/registro/page.tsx`: Formulario de autoservicio de prueba gratis.
   - `src/app/totem/page.tsx`: Terminal táctil con teclado numérico e impresión de ticket.
   - `src/app/tv/page.tsx`: Cartelería digital widescreen con audio chime y zócalo.
   - `src/app/operador/page.tsx`: Panel de box con cronómetro, llamadas y derivaciones.
   - `src/app/login/page.tsx`: Acceso de operadores y supervisores.

---

## 12. Puesta en Producción Exitosa y Optimización Continua (2026-10-12)

### Hitos de Despliegue en WizHosting (`turnos.desarrollosweb.net.ar`)
1. **Configuración de CloudLinux Node.js Selector:**
   - Application root fijado en: `public_html/turnos.desarrollosweb.net.ar`.
   - Node.js versión: `20.20.2` (Production mode).
   - Startup file: `server.js`.
   - Dependencias instaladas en terminal vía virtualenv: `npm install --omit=dev`.
2. **Resolución de Bloqueos de Permisos y Apache:**
   - *Permisos EACCES*: Resuelto con `chmod -R 755 .next` para permitir la lectura y ejecución de bundles compilados en el entorno Linux.
   - *Punto de Montaje de Passenger*: Incorporado `dir: __dirname` en `server.js` para asegurar que Next.js resuelva `.next` en la ruta absoluta de la app y no en `/home/desarro2/`.
   - *Limpieza de `.htaccess`*: Eliminadas reglas obsoletas de SPA/Vite que redirigían erróneamente a `/index.html` (provocando falsos 404).
   - *Assets Estáticos*: Ejecutado `cp -r .next/static _next && chmod -R 755 _next` para que Apache entregue CSS y chunks con máxima velocidad y códigos 200 sin depender de symlinks restringidos.

### Validación en Runtime Real (Base de Datos MariaDB)
- **Emisión en Vivo:** Verificada en phpMyAdmin la inserción exitosa del primer turno `C-001` (DNI: `12689745`, Sector: 3 Consultorios Médicos, Estado: `EN_ESPERA`) generado desde la pantalla del Tótem.
- **Conexión Localhost:** Confirmado funcionamiento estable del pool `mysql2` contra `localhost:3306` en WizHosting.

### Actualizaciones Funcionales y de Identidad Visual
- **Ajuste Comercial Free Trial:**
  - Unificado de 14 a 7 días en landing page, planes, FAQ, registro, login, metadatos SEO y procedimiento `sp_saas_registrar_cuenta_trial` (`INTERVAL 7 DAY`).
- **Identidad Visual Distintiva:**
  - Creado isotipo propio `<TurnosWebLogo />` e icono `public/icon.svg` / `src/app/icon.svg` representando un ticket digital con ondas dinámicas de llamado en gradiente Cyan/Blue/Indigo neón.
- **Estrategia Responsive-First (Tablets Portrait / Kioscos):**
  - Incorporadas clases y media queries para tablets verticales (`<= 768px`) con botones táctiles ergonómicos de 64px (`.touch-btn-lg`), teclado numérico amplio y grillas adaptables.
  - Panel de operador apilable para pantallas reducidas y agregado selector de sector interactivo en cabecera para cambio de box en caliente.

