-- =====================================================================
-- ESQUEMA SAAS MULTI-TENANT — SISTEMA SEGUIMIENTO DE TURNOS (TURNERO)
-- Compatible con MariaDB 10.11+ y MySQL 8.0+
-- Diseñado para cPanel / phpMyAdmin (sin cláusulas DEFINER rígidas)
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 0. LIMPIEZA DE TABLAS ANTERIORES DE desarro2_turnosmedicos
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `ausencias_medico`;
DROP TABLE IF EXISTS `consultas`;
DROP TABLE IF EXISTS `especialidades`;
DROP TABLE IF EXISTS `evoluciones`;
DROP TABLE IF EXISTS `medico_sucursal_horario`;
DROP TABLE IF EXISTS `obras_sociales`;
DROP TABLE IF EXISTS `pacientes`;
DROP TABLE IF EXISTS `turnos`;
DROP TABLE IF EXISTS `usuario_sucursal`;
DROP TABLE IF EXISTS `medicos`;
DROP TABLE IF EXISTS `sucursales`;
DROP TABLE IF EXISTS `clinicas`;
DROP TABLE IF EXISTS `usuarios`;

-- ---------------------------------------------------------------------
-- 1. TABLA SAAS: saas_tenant (Clínicas, Consultorios, Negocios)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `saas_tenant`;
CREATE TABLE `saas_tenant` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slug` varchar(50) NOT NULL COMMENT 'Identificador único en URL (ej: demo, clinica-sol)',
  `nombre_empresa` varchar(100) NOT NULL COMMENT 'Razón social o nombre público',
  `email_contacto` varchar(100) NOT NULL COMMENT 'Email del administrador de la cuenta',
  `telefono` varchar(50) DEFAULT NULL,
  `plan` enum('TRIAL','BASICO','PRO','ENTERPRISE') NOT NULL DEFAULT 'TRIAL',
  `estado` enum('TRIAL_ACTIVO','ACTIVO','EXPIRADO','SUSPENDIDO') NOT NULL DEFAULT 'TRIAL_ACTIVO',
  `trial_fin` datetime NOT NULL COMMENT 'Fecha de corte de la prueba gratuita',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_alta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_slug` (`slug`),
  KEY `idx_tenant_estado` (`estado`, `trial_fin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. TABLA PARÁMETROS INSTITUCIONALES POR TENANT
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `cfg_parametros`;
CREATE TABLE `cfg_parametros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL DEFAULT '1',
  `clave` varchar(50) NOT NULL,
  `valor` text,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_clave` (`tenant_id`, `clave`),
  CONSTRAINT `fk_cfg_param_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `saas_tenant` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. TABLA SECTORES / SALAS / TRÁMITES
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `cfg_sector`;
CREATE TABLE `cfg_sector` (
  `id_sector` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL DEFAULT '1',
  `descripcion` varchar(100) NOT NULL COMMENT 'Nombre del sector (ej: Guardia, Vacunatorio)',
  `piso` varchar(30) NOT NULL DEFAULT 'Planta Baja',
  `letraTicket` varchar(2) NOT NULL COMMENT 'Prefijo del ticket (ej: G, V, A)',
  `tiempo_estimado` int(11) NOT NULL DEFAULT '10' COMMENT 'Minutos promedio por atención',
  `pausado` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Pausa temporal de emisión',
  `activo` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=Habilitado, 0=Baja lógica',
  `fecha_alta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sector`),
  KEY `idx_sector_tenant` (`tenant_id`, `activo`),
  CONSTRAINT `fk_cfg_sector_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `saas_tenant` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. ROLES DEL SISTEMA (Compartidos a nivel plataforma)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `seg_rol`;
CREATE TABLE `seg_rol` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rol_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. USUARIOS OPERADORES Y SUPERVISORES POR TENANT
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `seg_usuario`;
CREATE TABLE `seg_usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL DEFAULT '1',
  `nombre` varchar(100) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `clave` varchar(255) NOT NULL COMMENT 'Hash seguro (bcrypt) o compatible legacy',
  `email` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_alta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_baja` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_dni` (`tenant_id`, `dni`),
  KEY `idx_usuario_tenant` (`tenant_id`, `estado`),
  CONSTRAINT `fk_seg_usuario_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `saas_tenant` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. ASOCIACIÓN USUARIO - ROL
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `seg_usuario_rol`;
CREATE TABLE `seg_usuario_rol` (
  `usuario_id` int(11) NOT NULL,
  `rol_id` int(11) NOT NULL,
  PRIMARY KEY (`usuario_id`, `rol_id`),
  CONSTRAINT `fk_seg_ur_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `seg_usuario` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_seg_ur_rol` FOREIGN KEY (`rol_id`) REFERENCES `seg_rol` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. PUESTOS / BOXES / CONSULTORIOS
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `cfg_puesto`;
CREATE TABLE `cfg_puesto` (
  `id_puesto` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL DEFAULT '1',
  `id_sector` int(11) NOT NULL,
  `descripcion` varchar(50) NOT NULL COMMENT 'Ej: Box 1, Ventanilla 2',
  `id_usuario_operador` int(11) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_alta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_puesto`),
  KEY `idx_puesto_tenant` (`tenant_id`, `activo`),
  KEY `fk_puesto_sector` (`id_sector`),
  KEY `fk_puesto_operador` (`id_usuario_operador`),
  CONSTRAINT `fk_cfg_puesto_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `saas_tenant` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cfg_puesto_sector` FOREIGN KEY (`id_sector`) REFERENCES `cfg_sector` (`id_sector`) ON UPDATE CASCADE,
  CONSTRAINT `fk_cfg_puesto_operador` FOREIGN KEY (`id_usuario_operador`) REFERENCES `seg_usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. TURNOS EMITIDOS (COLA DE ATENCIÓN)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `trn_turno`;
CREATE TABLE `trn_turno` (
  `id_turno` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL DEFAULT '1',
  `codigoTicket` varchar(10) NOT NULL COMMENT 'Ej: G-001, A-042',
  `dni` varchar(20) NOT NULL,
  `titnroafi` int(11) NOT NULL DEFAULT '0' COMMENT 'Número de afiliado / historia clínica',
  `id_sector` int(11) NOT NULL,
  `id_puesto` int(11) DEFAULT NULL,
  `id_usuario_operador` int(11) DEFAULT NULL,
  `estado` varchar(25) NOT NULL DEFAULT 'EN_ESPERA' COMMENT 'EN_ESPERA, DERIVADO_EN_ESPERA, LLAMADO, EN_ATENCION, FINALIZADO, AUSENTE',
  `es_prioritario` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1=Prioridad especial / Urgencia',
  `observaciones` varchar(500) DEFAULT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_llamado` datetime DEFAULT NULL,
  `fecha_inicio_atencion` datetime DEFAULT NULL,
  `fecha_fin_atencion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_turno`),
  KEY `idx_turno_tenant_cola` (`tenant_id`, `id_sector`, `estado`, `es_prioritario`, `fecha_emision`),
  KEY `idx_turno_llamado` (`tenant_id`, `fecha_llamado`),
  CONSTRAINT `fk_trn_turno_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `saas_tenant` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_trn_turno_sector` FOREIGN KEY (`id_sector`) REFERENCES `cfg_sector` (`id_sector`) ON UPDATE CASCADE,
  CONSTRAINT `fk_trn_turno_puesto` FOREIGN KEY (`id_puesto`) REFERENCES `cfg_puesto` (`id_puesto`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_trn_turno_operador` FOREIGN KEY (`id_usuario_operador`) REFERENCES `seg_usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- DATOS INICIALES / SEED
-- =====================================================================

-- 1. Tenant Inicial (Demo / Modelo)
INSERT INTO `saas_tenant` (`id`, `slug`, `nombre_empresa`, `email_contacto`, `telefono`, `plan`, `estado`, `trial_fin`, `activo`, `fecha_alta`) VALUES
(1, 'demo', 'Clínica Modelo (Sede Central)', 'admin@turnos.desarrollosweb.net.ar', '11-4000-0000', 'PRO', 'ACTIVO', DATE_ADD(NOW(), INTERVAL 365 DAY), 1, NOW());

-- 2. Parámetros institucionales del tenant 1
INSERT INTO `cfg_parametros` (`tenant_id`, `clave`, `valor`, `descripcion`) VALUES
(1, 'colorId', '#1A95E2', 'Color institucional principal'),
(1, 'logoApp', '/logo.png', 'Logo de la clínica'),
(1, 'tituloApp', 'Gestión de Turnos', 'Nombre institucional'),
(1, 'zocalo', 'Bienvenido a Clínica Modelo • Por favor permanezca atento a la pantalla • Conserve su ticket', 'Texto del zócalo de TV'),
(1, 'zocaloVisible', '1', 'Visibilidad del zócalo: 1=Visible, 0=Oculto'),
(1, 'zocaloRefrescoMinutos', '10', 'Refresco del zócalo en minutos'),
(1, 'carteleriaTema', 'oscuro', 'Tema visual de la cartelería: oscuro o claro');

-- 3. Roles estándar
INSERT INTO `seg_rol` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Supervisor', 'Control total y reportes'),
(2, 'Operador', 'Atención de turnos en puestos'),
(3, 'Administrador', 'Configuración integral del sistema');

-- 4. Sectores iniciales para tenant 1
INSERT INTO `cfg_sector` (`id_sector`, `tenant_id`, `descripcion`, `piso`, `letraTicket`, `tiempo_estimado`, `pausado`, `activo`, `fecha_alta`) VALUES
(1, 1, 'Mesa de Entrada', 'Planta Baja', 'M', 5, 0, 1, NOW()),
(2, 1, 'Afiliaciones', '1er Subsuelo', 'A', 15, 0, 1, NOW()),
(3, 1, 'Consultorios Médicos', 'Piso 1', 'C', 15, 0, 1, NOW()),
(4, 1, 'Laboratorio y Análisis', 'Piso 1', 'L', 10, 0, 1, NOW()),
(5, 1, 'Facturación y Cajas', 'Planta Baja', 'F', 8, 0, 1, NOW());

-- 5. Usuarios iniciales para tenant 1
INSERT INTO `seg_usuario` (`id`, `tenant_id`, `nombre`, `dni`, `clave`, `email`, `estado`, `fecha_alta`) VALUES
(1, 1, 'Supervisor General', '10000001', '123456', 'supervisor@desarrollosweb.net.ar', 1, NOW()),
(2, 1, 'Operador Recepción', '10000002', '123456', 'recepcion@desarrollosweb.net.ar', 1, NOW()),
(3, 1, 'Operador Consultorios', '10000003', '123456', 'consultorios@desarrollosweb.net.ar', 1, NOW());

-- 6. Asignación de roles
INSERT INTO `seg_usuario_rol` (`usuario_id`, `rol_id`) VALUES
(1, 3),
(1, 1),
(2, 2),
(3, 2);

-- 7. Puestos iniciales para tenant 1
INSERT INTO `cfg_puesto` (`id_puesto`, `tenant_id`, `id_sector`, `descripcion`, `id_usuario_operador`, `activo`, `fecha_alta`) VALUES
(1, 1, 1, 'Ventanilla 1', 2, 1, NOW()),
(2, 1, 1, 'Ventanilla 2', NULL, 1, NOW()),
(3, 1, 3, 'Consultorio 101', 3, 1, NOW()),
(4, 1, 3, 'Consultorio 102', NULL, 1, NOW()),
(5, 1, 4, 'Toma de Muestras 1', NULL, 1, NOW());

-- =====================================================================
-- STORED PROCEDURES SAAS MULTI-TENANT (PORTABLES PARA MARIADB 10.11+)
-- =====================================================================
DELIMITER $$

-- ---------------------------------------------------------------------
-- SP SAAS: Obtener Tenant por Slug y verificar Trial
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_saas_obtener_tenant_por_slug`$$
CREATE PROCEDURE `sp_saas_obtener_tenant_por_slug`(
    IN p_slug VARCHAR(50)
)
BEGIN
    SELECT 
        id,
        slug,
        nombre_empresa,
        email_contacto,
        telefono,
        plan,
        estado,
        trial_fin,
        activo,
        IF(NOW() <= trial_fin OR estado = 'ACTIVO', 1, 0) AS es_vigente
    FROM saas_tenant
    WHERE slug = p_slug AND activo = 1
    LIMIT 1;
END$$

-- ---------------------------------------------------------------------
-- SP SAAS: Registro de Nuevo Tenant con Free Trial (7 días)
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_saas_registrar_cuenta_trial`$$
CREATE PROCEDURE `sp_saas_registrar_cuenta_trial`(
    IN p_slug VARCHAR(50),
    IN p_nombre_empresa VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_telefono VARCHAR(50),
    IN p_admin_nombre VARCHAR(100),
    IN p_admin_dni VARCHAR(20),
    IN p_admin_clave VARCHAR(255)
)
BEGIN
    DECLARE v_tenant_id INT;
    DECLARE v_user_id INT;

    START TRANSACTION;

    INSERT INTO saas_tenant (
        slug, nombre_empresa, email_contacto, telefono, plan, estado, trial_fin, activo, fecha_alta
    ) VALUES (
        LOWER(TRIM(p_slug)), p_nombre_empresa, p_email, p_telefono, 'TRIAL', 'TRIAL_ACTIVO', DATE_ADD(NOW(), INTERVAL 7 DAY), 1, NOW()
    );

    SET v_tenant_id = LAST_INSERT_ID();

    -- Copiar parámetros por defecto
    INSERT INTO cfg_parametros (tenant_id, clave, valor, descripcion) VALUES
    (v_tenant_id, 'colorId', '#1A95E2', 'Color institucional'),
    (v_tenant_id, 'logoApp', '/logo.png', 'Logo de la clínica'),
    (v_tenant_id, 'tituloApp', p_nombre_empresa, 'Nombre institucional'),
    (v_tenant_id, 'zocalo', CONCAT('Bienvenido a ', p_nombre_empresa, ' • Conserve su ticket y aguarde el llamado en pantalla'), 'Zócalo de TV'),
    (v_tenant_id, 'zocaloVisible', '1', 'Visibilidad zócalo'),
    (v_tenant_id, 'zocaloRefrescoMinutos', '10', 'Refresco zócalo'),
    (v_tenant_id, 'carteleriaTema', 'oscuro', 'Tema visual de cartelería');

    -- Crear sector base
    INSERT INTO cfg_sector (tenant_id, descripcion, piso, letraTicket, tiempo_estimado, pausado, activo)
    VALUES (v_tenant_id, 'Recepción General', 'Planta Baja', 'A', 10, 0, 1);

    -- Crear usuario Administrador del nuevo tenant
    INSERT INTO seg_usuario (tenant_id, nombre, dni, clave, email, estado, fecha_alta)
    VALUES (v_tenant_id, p_admin_nombre, p_admin_dni, p_admin_clave, p_email, 1, NOW());

    SET v_user_id = LAST_INSERT_ID();

    -- Asignar rol Administrador (id 3) y Supervisor (id 1)
    INSERT INTO seg_usuario_rol (usuario_id, rol_id) VALUES (v_user_id, 3), (v_user_id, 1);

    COMMIT;

    SELECT v_tenant_id AS id_tenant, v_user_id AS id_usuario;
END$$

-- ---------------------------------------------------------------------
-- Autenticación de Usuario por Tenant y DNI
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_usuario_autenticar`$$
CREATE PROCEDURE `sp_usuario_autenticar`(
    IN p_tenant_id INT,
    IN p_dni VARCHAR(20),
    IN p_clave VARCHAR(255)
)
BEGIN
    SELECT 
        u.id, 
        u.tenant_id,
        u.nombre, 
        u.dni, 
        u.email, 
        u.estado,
        r.id AS rol_id,
        COALESCE(r.nombre, 'Sin Rol') AS rol_nombre,
        p.id_puesto,
        p.descripcion AS puesto_nombre,
        s.id_sector,
        s.descripcion AS sector_nombre
    FROM seg_usuario u
    LEFT JOIN seg_usuario_rol ur ON u.id = ur.usuario_id
    LEFT JOIN seg_rol r ON ur.rol_id = r.id
    LEFT JOIN cfg_puesto p ON p.id_usuario_operador = u.id AND p.activo = 1
    LEFT JOIN cfg_sector s ON p.id_sector = s.id_sector
    WHERE u.tenant_id = IFNULL(p_tenant_id, 1)
      AND u.dni = p_dni 
      AND u.clave = p_clave 
      AND u.estado = 1
    LIMIT 1;
END$$

-- ---------------------------------------------------------------------
-- Obtener Box y Sector del Operador
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `spGetBoxOperador`$$
CREATE PROCEDURE `spGetBoxOperador`(
    IN p_tenant_id INT,
    IN p_id_usuario INT
)
BEGIN
    SELECT 
        p.id_puesto,
        p.descripcion AS puesto,
        s.id_sector,
        s.descripcion AS sector,
        s.piso,
        s.letraTicket,
        s.tiempo_estimado
    FROM cfg_puesto p
    INNER JOIN cfg_sector s ON p.id_sector = s.id_sector
    WHERE p.tenant_id = IFNULL(p_tenant_id, 1)
      AND p.id_usuario_operador = p_id_usuario 
      AND p.activo = 1
    LIMIT 1;
END$$

-- ---------------------------------------------------------------------
-- Llamar Siguiente Turno en Cola
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `spGetSiguiente`$$
CREATE PROCEDURE `spGetSiguiente`(
    IN p_tenant_id INT,
    IN p_id_puesto INT,
    IN p_id_usuario INT,
    IN p_id_sector INT
)
BEGIN
    DECLARE v_id_turno INT DEFAULT NULL;

    START TRANSACTION;

    SELECT id_turno INTO v_id_turno
    FROM trn_turno
    WHERE tenant_id = IFNULL(p_tenant_id, 1)
      AND id_sector = p_id_sector 
      AND estado IN ('EN_ESPERA', 'DERIVADO_EN_ESPERA')
    ORDER BY es_prioritario DESC, fecha_emision ASC
    LIMIT 1
    FOR UPDATE;

    IF v_id_turno IS NOT NULL THEN
        UPDATE trn_turno
        SET estado = 'EN_ATENCION',
            id_puesto = p_id_puesto,
            id_usuario_operador = p_id_usuario,
            fecha_llamado = NOW(),
            fecha_inicio_atencion = NOW()
        WHERE id_turno = v_id_turno;

        COMMIT;

        SELECT 
            id_turno,
            codigoTicket,
            dni,
            titnroafi,
            estado,
            es_prioritario,
            observaciones,
            fecha_llamado,
            fecha_inicio_atencion
        FROM trn_turno
        WHERE id_turno = v_id_turno;
    ELSE
        COMMIT;

        SELECT 
            id_turno,
            codigoTicket,
            dni,
            titnroafi,
            estado,
            es_prioritario,
            observaciones,
            fecha_llamado,
            fecha_inicio_atencion
        FROM trn_turno
        WHERE 1 = 0;
    END IF;
END$$

-- ---------------------------------------------------------------------
-- Turno Actual del Box
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `spGetTurnoActual`$$
CREATE PROCEDURE `spGetTurnoActual`(
    IN p_tenant_id INT,
    IN p_id_puesto INT
)
BEGIN
    SELECT 
        t.id_turno,
        t.codigoTicket,
        t.dni,
        t.titnroafi,
        t.estado,
        t.es_prioritario,
        t.observaciones,
        t.fecha_emision,
        t.fecha_llamado,
        t.fecha_inicio_atencion
    FROM trn_turno t
    WHERE t.tenant_id = IFNULL(p_tenant_id, 1)
      AND t.id_puesto = p_id_puesto 
      AND t.estado IN ('LLAMADO', 'EN_ATENCION')
    ORDER BY t.id_turno DESC
    LIMIT 1;
END$$

-- ---------------------------------------------------------------------
-- Turnos en Cola por Sector
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `spGetTurnoenCola`$$
CREATE PROCEDURE `spGetTurnoenCola`(
    IN p_tenant_id INT,
    IN p_id_sector INT
)
BEGIN
    SELECT 
        t.id_turno,
        t.codigoTicket,
        t.dni,
        t.titnroafi,
        t.es_prioritario,
        t.estado,
        t.observaciones,
        t.fecha_emision,
        TIMESTAMPDIFF(MINUTE, t.fecha_emision, NOW()) AS minutos_espera
    FROM trn_turno t
    WHERE t.tenant_id = IFNULL(p_tenant_id, 1)
      AND t.id_sector = p_id_sector 
      AND t.estado IN ('EN_ESPERA', 'DERIVADO_EN_ESPERA')
    ORDER BY t.es_prioritario DESC, t.fecha_emision ASC;
END$$

-- ---------------------------------------------------------------------
-- Turnos para Pantalla de Cartelería TV
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `spGetTurnosCarteleria`$$
CREATE PROCEDURE `spGetTurnosCarteleria`(
    IN p_tenant_id INT,
    IN p_limite INT,
    IN p_piso VARCHAR(50),
    IN p_id_sector INT
)
BEGIN
    IF p_limite IS NULL OR p_limite <= 0 THEN
        SET p_limite = 6;
    END IF;

    SELECT 
        t.id_turno,
        t.codigoTicket,
        t.dni,
        t.estado,
        t.es_prioritario,
        t.fecha_emision,
        t.fecha_llamado,
        t.fecha_inicio_atencion,
        s.descripcion AS sector_descripcion,
        s.piso,
        p.descripcion AS puesto_descripcion,
        u.nombre AS operador_nombre
    FROM trn_turno t
    INNER JOIN cfg_sector s ON t.id_sector = s.id_sector
    LEFT JOIN cfg_puesto p ON t.id_puesto = p.id_puesto
    LEFT JOIN seg_usuario u ON t.id_usuario_operador = u.id
    WHERE t.tenant_id = IFNULL(p_tenant_id, 1)
      AND t.fecha_llamado IS NOT NULL
      AND DATE(t.fecha_llamado) = CURDATE()
      AND (p_piso IS NULL OR p_piso = '' OR s.piso = p_piso)
      AND (p_id_sector IS NULL OR p_id_sector <= 0 OR t.id_sector = p_id_sector)
    ORDER BY t.fecha_llamado DESC
    LIMIT p_limite;
END$$

-- ---------------------------------------------------------------------
-- Emisión de Turno en Tótem de Autoservicio
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `spInsertTurnoTotem`$$
CREATE PROCEDURE `spInsertTurnoTotem`(
    IN p_tenant_id INT,
    IN p_dni VARCHAR(20),
    IN p_id_sector INT,
    IN p_es_prioritario TINYINT(1),
    IN p_observaciones VARCHAR(500)
)
BEGIN
    DECLARE v_letra VARCHAR(5) DEFAULT 'T';
    DECLARE v_siguiente INT DEFAULT 1;
    DECLARE v_codigoTicket VARCHAR(10);
    DECLARE v_personas_antes INT DEFAULT 0;
    DECLARE v_id_turno INT;
    DECLARE v_t_id INT;

    SET v_t_id = IFNULL(p_tenant_id, 1);

    SELECT IFNULL(letraTicket, 'T') INTO v_letra
    FROM cfg_sector
    WHERE id_sector = p_id_sector AND tenant_id = v_t_id;

    SELECT COUNT(*) INTO v_personas_antes
    FROM trn_turno
    WHERE tenant_id = v_t_id
      AND id_sector = p_id_sector
      AND estado = 'EN_ESPERA'
      AND DATE(fecha_emision) = CURDATE();

    SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(codigoTicket, '-', -1) AS UNSIGNED)), 0) + 1 INTO v_siguiente
    FROM trn_turno
    WHERE tenant_id = v_t_id
      AND id_sector = p_id_sector
      AND DATE(fecha_emision) = CURDATE();

    SET v_codigoTicket = CONCAT(v_letra, '-', LPAD(v_siguiente, 3, '0'));

    INSERT INTO trn_turno (
        tenant_id,
        codigoTicket,
        dni,
        titnroafi,
        id_sector,
        estado,
        es_prioritario,
        observaciones,
        fecha_emision
    ) VALUES (
        v_t_id,
        v_codigoTicket,
        p_dni,
        0,
        p_id_sector,
        'EN_ESPERA',
        p_es_prioritario,
        p_observaciones,
        NOW()
    );

    SET v_id_turno = LAST_INSERT_ID();

    SELECT 
        t.id_turno,
        t.codigoTicket,
        t.dni,
        t.titnroafi,
        t.id_sector,
        t.estado,
        t.es_prioritario,
        t.observaciones,
        t.fecha_emision,
        s.descripcion AS sector_descripcion,
        s.piso,
        v_personas_antes AS personas_antes
    FROM trn_turno t
    INNER JOIN cfg_sector s ON s.id_sector = t.id_sector
    WHERE t.id_turno = v_id_turno;
END$$

-- ---------------------------------------------------------------------
-- Actualizaciones Operativas de Turnos
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `spUpdateFinalizar`$$
CREATE PROCEDURE `spUpdateFinalizar`(
    IN p_tenant_id INT,
    IN p_id_turno INT
)
BEGIN
    UPDATE trn_turno
    SET estado = 'FINALIZADO',
        fecha_fin_atencion = NOW()
    WHERE id_turno = p_id_turno 
      AND tenant_id = IFNULL(p_tenant_id, 1)
      AND estado = 'EN_ATENCION';

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

DROP PROCEDURE IF EXISTS `spUpdateAusente`$$
CREATE PROCEDURE `spUpdateAusente`(
    IN p_tenant_id INT,
    IN p_id_turno INT
)
BEGIN
    UPDATE trn_turno
    SET estado = 'AUSENTE'
    WHERE id_turno = p_id_turno
      AND tenant_id = IFNULL(p_tenant_id, 1)
      AND estado IN ('LLAMADO', 'EN_ATENCION');

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

DROP PROCEDURE IF EXISTS `spUpdateDerivar`$$
CREATE PROCEDURE `spUpdateDerivar`(
    IN p_tenant_id INT,
    IN p_id_turno INT,
    IN p_id_sector_destino INT,
    IN p_es_prioritario TINYINT,
    IN p_observaciones VARCHAR(500)
)
BEGIN
    UPDATE trn_turno
    SET id_sector = p_id_sector_destino,
        estado = 'DERIVADO_EN_ESPERA',
        es_prioritario = p_es_prioritario,
        observaciones = p_observaciones,
        id_puesto = NULL,
        id_usuario_operador = NULL,
        fecha_llamado = NULL
    WHERE id_turno = p_id_turno
      AND tenant_id = IFNULL(p_tenant_id, 1);

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

DROP PROCEDURE IF EXISTS `spRellamarTurno`$$
CREATE PROCEDURE `spRellamarTurno`(
    IN p_tenant_id INT,
    IN p_id_turno INT
)
BEGIN
    UPDATE trn_turno
    SET fecha_llamado = NOW()
    WHERE id_turno = p_id_turno
      AND tenant_id = IFNULL(p_tenant_id, 1);

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

-- ---------------------------------------------------------------------
-- Consultas de Configuración y Gestión
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `spGetSectoresActivos`$$
CREATE PROCEDURE `spGetSectoresActivos`(
    IN p_tenant_id INT
)
BEGIN
    SELECT 
        id_sector,
        descripcion,
        piso,
        letraTicket,
        tiempo_estimado,
        pausado,
        activo,
        fecha_alta
    FROM cfg_sector
    WHERE tenant_id = IFNULL(p_tenant_id, 1) AND activo = 1
    ORDER BY descripcion ASC;
END$$

DROP PROCEDURE IF EXISTS `spGetPuestosAdmin`$$
CREATE PROCEDURE `spGetPuestosAdmin`(
    IN p_tenant_id INT
)
BEGIN
    SELECT 
        p.id_puesto,
        p.descripcion,
        p.id_sector,
        s.descripcion AS sector_descripcion,
        s.piso,
        p.id_usuario_operador,
        u.nombre AS operador_nombre,
        p.activo,
        p.fecha_alta
    FROM cfg_puesto p
    INNER JOIN cfg_sector s ON p.id_sector = s.id_sector
    LEFT JOIN seg_usuario u ON p.id_usuario_operador = u.id
    WHERE p.tenant_id = IFNULL(p_tenant_id, 1)
    ORDER BY p.id_puesto ASC;
END$$

DROP PROCEDURE IF EXISTS `spGetUsuariosAdmin`$$
CREATE PROCEDURE `spGetUsuariosAdmin`(
    IN p_tenant_id INT
)
BEGIN
    SELECT 
        u.id,
        u.nombre,
        u.dni,
        u.email,
        u.estado,
        IFNULL(r.id, 0) AS rol_id,
        IFNULL(r.nombre, 'Sin Rol') AS rol_nombre,
        p.id_puesto,
        p.descripcion AS puesto_nombre,
        s.id_sector,
        s.descripcion AS sector_nombre,
        s.piso AS sector_piso,
        u.fecha_alta
    FROM seg_usuario u
    LEFT JOIN seg_usuario_rol ur ON u.id = ur.usuario_id
    LEFT JOIN seg_rol r ON ur.rol_id = r.id
    LEFT JOIN cfg_puesto p ON p.id_usuario_operador = u.id AND p.activo = 1
    LEFT JOIN cfg_sector s ON p.id_sector = s.id_sector
    WHERE u.tenant_id = IFNULL(p_tenant_id, 1)
    ORDER BY u.id ASC;
END$$

DELIMITER ;
SET FOREIGN_KEY_CHECKS = 1;
