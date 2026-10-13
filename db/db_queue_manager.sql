-- Generado desde backup Navicat (20261012011627.nb3). Origen: db_queue_manager.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DELIMITER $$
CREATE TABLE `cfg_parametros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `valor` text,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4$$

INSERT INTO `cfg_parametros` (`id`, `clave`, `valor`, `descripcion`) VALUES
(1, 'colorId', '#1A95E2', 'Color institucional principal (hexadecimal)'),
(2, 'logoApp', '~/img/logo.png', 'Ruta relativa del logo de la aplicación'),
(3, 'tituloApp', 'Gestión Turnos', 'Título o nombre institucional de la aplicación'),
(4, 'zocalo', 'Bienvenido a nuestra sede central • Por favor permanezca atento a la pantalla y conserve su ticket impreso • Se ruega respetar el orden de llamado', 'Texto del zócalo informativo de la sala de espera (TV)'),
(5, 'zocaloVisible', '1', 'Visibilidad del zócalo en pantalla de TV: 1=Visible, 0=Oculto'),
(6, 'zocaloRefrescoMinutos', '10', 'Intervalo en minutos para consultar cambios del zócalo en TV'),
(7, 'carteleriaTema', 'oscuro', 'Opciones : oscuro/claro esto es para la carteleria')$$

CREATE TABLE `cfg_sector` (
  `id_sector` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre descriptivo del sector o trámite',
  `piso` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ubicación física en el edificio',
  `letraTicket` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Letra prefijo del ticket para este sector',
  `tiempo_estimado` int(11) DEFAULT '10' COMMENT 'Tiempo estimado de atención en minutos',
  `pausado` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0: Activa, 1: Pausada temporalmente',
  `activo` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: Habilitado, 0: Baja lógica',
  `fecha_alta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sector`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci$$

INSERT INTO `cfg_sector` (`id_sector`, `descripcion`, `piso`, `letraTicket`, `tiempo_estimado`, `pausado`, `activo`, `fecha_alta`) VALUES
(1, 'Mesa de Entrada', 'Planta Baja', 'M', 5, 0, 1, '2026-10-05 13:47:32'),
(2, 'Afiliaciones', '1er Subsuelo', 'A', 15, 0, 1, '2026-10-05 13:47:32'),
(3, 'Reintegros', 'Piso 1', 'R', 10, 0, 1, '2026-10-05 13:47:32'),
(4, 'Turismo', 'Piso 1', 'T', 15, 0, 1, '2026-10-05 13:47:32'),
(5, 'Contaduría', 'Piso 3', 'C', 10, 0, 1, '2026-10-05 13:47:32'),
(6, 'Reclamos', 'Piso 6', 'X', 20, 0, 1, '2026-10-05 13:47:32')$$

CREATE TABLE `seg_rol` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4$$

INSERT INTO `seg_rol` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Supervisor', 'Control total'),
(2, 'Operador', 'Atiende turnos en su puesto'),
(3, 'Administrador', 'Control total y administraciÃ³n del sistema')$$

CREATE TABLE `seg_usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `clave` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_alta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_baja` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4$$

INSERT INTO `seg_usuario` (`id`, `nombre`, `dni`, `clave`, `email`, `estado`, `fecha_alta`, `fecha_baja`) VALUES
(1, 'Supervisor General', '16976239', '9', 'jdeoro@spdps.com.ar', 1, '2026-09-29 14:44:51', NULL),
(2, 'Operador Afiliaciones', '99999999', '9', 'afiliaciones@spdps.com.ar', 1, '2026-10-08 15:09:08', NULL),
(3, 'Juan Perez', '27563123', '1', NULL, 1, '2026-10-09 16:02:38', NULL)$$

CREATE TABLE `seg_usuario_rol` (
  `usuario_id` int(11) NOT NULL,
  `rol_id` int(11) NOT NULL,
  PRIMARY KEY (`usuario_id`,`rol_id`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `seg_usuario_rol_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `seg_usuario` (`id`),
  CONSTRAINT `seg_usuario_rol_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `seg_rol` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4$$

INSERT INTO `seg_usuario_rol` (`usuario_id`, `rol_id`) VALUES
(1, 1),
(2, 2),
(3, 2)$$

CREATE TABLE `cfg_puesto` (
  `id_puesto` int(11) NOT NULL AUTO_INCREMENT,
  `id_sector` int(11) NOT NULL COMMENT 'FK a cfg_sector',
  `descripcion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identificación del puesto (Box 1, Consultorio 4, etc.)',
  `id_usuario_operador` int(11) DEFAULT NULL COMMENT 'FK a seg_usuario. NULL si está libre o desconectado',
  `activo` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: Habilitado, 0: Baja lógica',
  `fecha_alta` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_puesto`),
  KEY `fk_puesto_sector` (`id_sector`),
  KEY `fk_puesto_usuario` (`id_usuario_operador`),
  CONSTRAINT `fk_puesto_sector` FOREIGN KEY (`id_sector`) REFERENCES `cfg_sector` (`id_sector`) ON UPDATE CASCADE,
  CONSTRAINT `fk_puesto_usuario` FOREIGN KEY (`id_usuario_operador`) REFERENCES `seg_usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci$$

INSERT INTO `cfg_puesto` (`id_puesto`, `id_sector`, `descripcion`, `id_usuario_operador`, `activo`, `fecha_alta`) VALUES
(1, 1, 'Ventanilla 1', NULL, 1, '2026-10-05 13:47:33'),
(2, 1, 'Ventanilla 2', NULL, 1, '2026-10-05 13:47:33'),
(3, 2, 'Box 1', 2, 1, '2026-10-05 13:47:33'),
(4, 3, 'Box 1', 1, 1, '2026-10-05 13:47:33'),
(5, 5, 'Box 2', 3, 1, '2026-10-05 13:47:33'),
(6, 4, 'Box 1', NULL, 1, '2026-10-05 13:47:33'),
(7, 4, 'Box 2', NULL, 1, '2026-10-05 13:47:33'),
(8, 6, 'Box 1', NULL, 1, '2026-10-05 13:47:33')$$

CREATE TABLE `trn_turno` (
  `id_turno` int(11) NOT NULL AUTO_INCREMENT,
  `codigoTicket` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Código impreso del ticket (ej: R-042, A-104)',
  `dni` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'DNI del visitante ingresado en tótem',
  `titnroafi` int(11) NOT NULL DEFAULT '0' COMMENT '0: No Afiliado, > 0: Número de Afiliado',
  `id_sector` int(11) NOT NULL COMMENT 'Sector actual del turno (FK a cfg_sector)',
  `id_puesto` int(11) DEFAULT NULL COMMENT 'Puesto que llama o atiende (FK a cfg_puesto)',
  `id_usuario_operador` int(11) DEFAULT NULL COMMENT 'Operador que atiende (FK a seg_usuario)',
  `estado` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EN_ESPERA' COMMENT 'EN_ESPERA, DERIVADO_EN_ESPERA, LLAMADO, EN_ATENCION, FINALIZADO, AUSENTE',
  `es_prioritario` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1: Prioridad alta (derivaciones/urgencias), 0: Normal',
  `observaciones` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Notas internas para el operador destino (derivación)',
  `fecha_emision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Hora de emisión en tótem',
  `fecha_llamado` datetime DEFAULT NULL COMMENT 'Hora en que fue llamado a pantalla TV (columna Hora de Cartelería)',
  `fecha_inicio_atencion` datetime DEFAULT NULL COMMENT 'Hora en que inició la atención en el box (cronómetro)',
  `fecha_fin_atencion` datetime DEFAULT NULL COMMENT 'Hora en que finalizó la atención',
  PRIMARY KEY (`id_turno`),
  KEY `fk_turno_puesto` (`id_puesto`),
  KEY `fk_turno_usuario` (`id_usuario_operador`),
  KEY `idx_turno_cola` (`id_sector`,`estado`,`es_prioritario`,`fecha_emision`),
  CONSTRAINT `fk_turno_puesto` FOREIGN KEY (`id_puesto`) REFERENCES `cfg_puesto` (`id_puesto`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_turno_sector` FOREIGN KEY (`id_sector`) REFERENCES `cfg_sector` (`id_sector`) ON UPDATE CASCADE,
  CONSTRAINT `fk_turno_usuario` FOREIGN KEY (`id_usuario_operador`) REFERENCES `seg_usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci$$

INSERT INTO `trn_turno` (`id_turno`, `codigoTicket`, `dni`, `titnroafi`, `id_sector`, `id_puesto`, `id_usuario_operador`, `estado`, `es_prioritario`, `observaciones`, `fecha_emision`, `fecha_llamado`, `fecha_inicio_atencion`, `fecha_fin_atencion`) VALUES
(2, 'A-001', '12345612', 0, 2, 3, 2, 'FINALIZADO', 0, 'Emitido desde Totem de Autoservicio', '2026-10-07 14:53:39', '2026-10-08 16:54:44', '2026-10-08 16:54:44', '2026-10-08 16:55:11'),
(3, 'R-001', '15636987', 0, 3, 4, 1, 'FINALIZADO', 0, 'Emitido desde Totem de Autoservicio', '2026-10-07 14:54:47', '2026-10-07 15:02:10', '2026-10-07 15:13:18', '2026-10-07 15:13:30'),
(4, 'R-002', '28799790', 0, 3, 4, 1, 'FINALIZADO', 0, 'Emitido desde Totem de Autoservicio', '2026-10-07 15:26:57', '2026-10-07 15:27:14', '2026-10-07 15:27:32', '2026-10-07 15:27:38'),
(5, 'M-001', '45632525', 0, 1, NULL, NULL, 'EN_ESPERA', 0, 'Check-in de turno programado / Mesa de Entrada', '2026-10-07 15:39:21', NULL, NULL, NULL),
(6, 'R-003', '23698599', 0, 3, 4, 1, 'FINALIZADO', 0, 'Emitido desde Totem de Autoservicio', '2026-10-07 15:39:37', '2026-10-07 15:40:16', '2026-10-07 16:18:31', '2026-10-07 16:18:50'),
(7, 'R-004', '12698325', 0, 3, 4, 1, 'AUSENTE', 0, 'Emitido desde Totem de Autoservicio', '2026-10-07 15:40:00', '2026-10-07 16:18:58', NULL, NULL),
(8, 'R-005', '16856321', 0, 3, 4, 1, 'FINALIZADO', 0, 'Emitido desde Totem de Autoservicio', '2026-10-07 20:52:38', '2026-10-07 20:53:44', '2026-10-07 20:54:16', '2026-10-07 20:54:37'),
(9, 'X-001', '1245698', 0, 6, NULL, NULL, 'EN_ESPERA', 0, 'Emitido desde Totem de Autoservicio', '2026-10-07 20:55:07', NULL, NULL, NULL),
(10, 'X-002', '15698236', 0, 6, NULL, NULL, 'EN_ESPERA', 0, 'Emitido desde Totem de Autoservicio', '2026-10-07 20:55:26', NULL, NULL, NULL),
(11, 'R-006', '13659874', 0, 3, 4, 1, 'AUSENTE', 0, 'Emitido desde Totem de Autoservicio', '2026-10-07 20:55:51', '2026-10-07 20:56:09', NULL, NULL),
(12, 'R-007', '12365896', 0, 3, 4, 1, 'FINALIZADO', 0, 'Emitido desde Totem de Autoservicio', '2026-10-07 21:12:01', '2026-10-07 21:12:15', '2026-10-07 21:12:42', '2026-10-07 21:12:58'),
(13, 'R-001', '12345698', 0, 3, 4, 1, 'FINALIZADO', 1, 'Emitido desde Totem de Autoservicio', '2026-10-08 14:18:23', '2026-10-08 14:48:09', '2026-10-08 14:48:09', '2026-10-08 14:56:33'),
(14, 'R-002', '45236980', 0, 3, 4, 1, 'FINALIZADO', 0, 'Emitido desde Totem de Autoservicio', '2026-10-08 14:19:04', '2026-10-08 14:25:35', '2026-10-08 14:25:35', '2026-10-08 14:26:08'),
(15, 'R-003', '41569236', 0, 3, 4, 1, 'FINALIZADO', 0, 'Emitido desde Totem de Autoservicio', '2026-10-08 14:19:52', '2026-10-08 14:56:40', '2026-10-08 14:56:40', '2026-10-08 14:59:51'),
(16, 'R-004', '52693874', 0, 2, 3, 2, 'FINALIZADO', 1, 'debe presentarse en la mesa de afiliaciones.', '2026-10-08 14:20:38', '2026-10-08 16:55:14', '2026-10-08 16:55:14', '2026-10-09 13:09:18'),
(17, 'A-005', '28797900', 0, 2, 3, 2, 'EN_ATENCION', 0, 'Emitido desde Totem de Autoservicio', '2026-10-08 16:50:57', '2026-10-09 13:56:34', '2026-10-09 13:56:34', NULL),
(18, 'R-001', '12356896', 0, 3, 4, 1, 'FINALIZADO', 0, 'Emitido desde Totem de Autoservicio', '2026-10-09 10:53:04', '2026-10-09 10:53:22', '2026-10-09 10:53:22', '2026-10-09 10:53:35'),
(19, 'R-002', '12365896', 0, 3, 4, 1, 'AUSENTE', 1, 'Emitido desde Totem de Autoservicio', '2026-10-09 10:54:11', '2026-10-09 11:52:27', '2026-10-09 10:54:17', NULL),
(20, 'A-001', '12365987', 0, 2, NULL, NULL, 'EN_ESPERA', 0, 'Emitido desde Totem de Autoservicio', '2026-10-09 13:54:58', NULL, NULL, NULL)$$

CREATE DEFINER=`root`@`%` PROCEDURE `Sp_getLoginId`(IN p_dni VARCHAR(20), IN p_clave VARCHAR(50))
BEGIN
    SELECT id
    FROM   seg_usuario
    WHERE  dni    = p_dni
      AND  clave  = p_clave
      AND  estado = 1
    LIMIT 1;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `sp_usuario_autenticar`(
    IN p_dni VARCHAR(20),
    IN p_clave VARCHAR(50)
)
BEGIN
    SELECT 
        u.id, 
        u.nombre, 
        u.dni, 
        u.email, 
        u.estado,
        r.id AS rol_id,
        COALESCE(r.nombre, 'Sin Rol') AS rol_nombre
    FROM seg_usuario u
    LEFT JOIN seg_usuario_rol ur ON u.id = ur.usuario_id
    LEFT JOIN seg_rol r ON ur.rol_id = r.id
    WHERE u.dni = p_dni 
      AND u.clave = p_clave 
      AND u.estado = 1
    LIMIT 1;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `sp_usuario_obtener_por_id`(
    IN p_id INT
)
BEGIN
    SELECT 
        u.id, 
        u.nombre, 
        u.dni, 
        u.email, 
        u.estado,
        r.id AS rol_id,
        COALESCE(r.nombre, 'Sin Rol') AS rol_nombre
    FROM seg_usuario u
    LEFT JOIN seg_usuario_rol ur ON u.id = ur.usuario_id
    LEFT JOIN seg_rol r ON ur.rol_id = r.id
    WHERE u.id = p_id
    LIMIT 1;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spGetBoxOperador`(IN p_id_usuario INT)
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
    WHERE p.id_usuario_operador = p_id_usuario AND p.activo = 1
    LIMIT 1;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spGetPuestosAdmin`()
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
    ORDER BY p.id_puesto ASC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spGetRoles`()
BEGIN
    SELECT id, nombre, descripcion 
    FROM seg_rol 
    ORDER BY id ASC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spGetSectoresActivos`()
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
    WHERE activo = 1
    ORDER BY descripcion ASC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spGetSectoresAdmin`()
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
    ORDER BY id_sector ASC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spGetSiguiente`(
    IN p_id_puesto INT,
    IN p_id_usuario INT,
    IN p_id_sector INT
)
BEGIN
    DECLARE v_id_turno INT DEFAULT NULL;

    START TRANSACTION;

    SELECT id_turno INTO v_id_turno
    FROM trn_turno
    WHERE id_sector = p_id_sector 
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
        WHERE id_turno = v_id_turno
          AND estado IN ('EN_ESPERA', 'DERIVADO_EN_ESPERA');

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

CREATE DEFINER=`root`@`%` PROCEDURE `spGetTurnoActual`(IN p_id_puesto INT)
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
        WHERE t.id_puesto = p_id_puesto 
          AND t.estado IN ('LLAMADO', 'EN_ATENCION')
        ORDER BY t.id_turno DESC
        LIMIT 1;
    END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spGetTurnoenCola`(IN p_id_sector INT)
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
        WHERE t.id_sector = p_id_sector 
          AND t.estado IN ('EN_ESPERA', 'DERIVADO_EN_ESPERA')
        ORDER BY t.es_prioritario DESC, t.fecha_emision ASC;
    END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spGetTurnosAusentes`(IN p_id_sector INT)
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
        t.fecha_llamado,
        TIMESTAMPDIFF(MINUTE, t.fecha_emision, NOW()) AS minutos_espera
    FROM trn_turno t
    WHERE t.id_sector = p_id_sector
      AND t.estado = 'AUSENTE'
      AND DATE(t.fecha_emision) = CURDATE()
    ORDER BY t.fecha_llamado DESC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spGetTurnosCarteleria`(
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
    WHERE t.fecha_llamado IS NOT NULL
      AND DATE(t.fecha_llamado) = CURDATE()
      AND (p_piso IS NULL OR p_piso = '' OR s.piso = p_piso)
      AND (p_id_sector IS NULL OR p_id_sector <= 0 OR t.id_sector = p_id_sector)
    ORDER BY t.fecha_llamado DESC
    LIMIT p_limite;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spGetUsuariosAdmin`()
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
        u.fecha_alta,
        u.fecha_baja
    FROM seg_usuario u
    LEFT JOIN seg_usuario_rol ur ON u.id = ur.usuario_id
    LEFT JOIN seg_rol r ON ur.rol_id = r.id
    LEFT JOIN (
        SELECT id_puesto, descripcion, id_sector, id_usuario_operador
        FROM cfg_puesto
        WHERE activo = 1 AND id_usuario_operador IS NOT NULL
        GROUP BY id_usuario_operador
    ) p ON p.id_usuario_operador = u.id
    LEFT JOIN cfg_sector s ON p.id_sector = s.id_sector
    ORDER BY u.id ASC;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spInsertPuesto`(
    IN p_descripcion VARCHAR(50),
    IN p_id_sector INT,
    IN p_id_usuario_operador INT
)
BEGIN
    INSERT INTO cfg_puesto (descripcion, id_sector, id_usuario_operador, activo, fecha_alta)
    VALUES (p_descripcion, p_id_sector, IF(p_id_usuario_operador > 0, p_id_usuario_operador, NULL), 1, NOW());
    
    SELECT LAST_INSERT_ID() AS id_puesto;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spInsertSector`(
    IN p_descripcion VARCHAR(100),
    IN p_piso VARCHAR(30),
    IN p_letra_ticket VARCHAR(2),
    IN p_tiempo_estimado INT
)
BEGIN
    INSERT INTO cfg_sector (descripcion, piso, letraTicket, tiempo_estimado, pausado, activo, fecha_alta)
    VALUES (p_descripcion, p_piso, UPPER(TRIM(p_letra_ticket)), IFNULL(p_tiempo_estimado, 10), 0, 1, NOW());
    
    SELECT LAST_INSERT_ID() AS id_sector;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spInsertTurnoTotem`(
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

    -- Obtener la letra identificatoria del sector
    SELECT IFNULL(letraTicket, 'T') INTO v_letra
    FROM cfg_sector
    WHERE id_sector = p_id_sector;

    -- Contar personas actualmente en espera antes de emitir este turno
    SELECT COUNT(*) INTO v_personas_antes
    FROM trn_turno
    WHERE id_sector = p_id_sector
      AND estado = 'EN_ESPERA'
      AND DATE(fecha_emision) = CURDATE();

    -- Calcula siguiente correlativo diario para el sector
    SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(codigoTicket, '-', -1) AS UNSIGNED)), 0) + 1 INTO v_siguiente
    FROM trn_turno
    WHERE id_sector = p_id_sector
      AND DATE(fecha_emision) = CURDATE();

    SET v_codigoTicket = CONCAT(v_letra, '-', LPAD(v_siguiente, 3, '0'));

    -- Insertar turno en cola
    INSERT INTO trn_turno (
        codigoTicket,
        dni,
        titnroafi,
        id_sector,
        estado,
        es_prioritario,
        observaciones,
        fecha_emision
    ) VALUES (
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

    -- Retorna el turno emitido con datos del sector
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

CREATE DEFINER=`root`@`%` PROCEDURE `spInsertUsuario`(
    IN p_nombre VARCHAR(100),
    IN p_dni VARCHAR(20),
    IN p_clave VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_rol_id INT
)
BEGIN
    DECLARE v_usuario_id INT;
    
    INSERT INTO seg_usuario (nombre, dni, clave, email, estado, fecha_alta)
    VALUES (p_nombre, p_dni, p_clave, p_email, 1, NOW());
    
    SET v_usuario_id = LAST_INSERT_ID();
    
    IF p_rol_id > 0 THEN
        INSERT INTO seg_usuario_rol (usuario_id, rol_id)
        VALUES (v_usuario_id, p_rol_id)
        ON DUPLICATE KEY UPDATE rol_id = p_rol_id;
    END IF;
    
    SELECT v_usuario_id AS id;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spReactivarTurnoAusente`(IN p_id_turno INT)
BEGIN
    UPDATE trn_turno
    SET estado = 'EN_ESPERA',
        es_prioritario = 1,
        id_puesto = NULL,
        id_usuario_operador = NULL,
        fecha_llamado = NULL,
        fecha_inicio_atencion = NULL
    WHERE id_turno = p_id_turno
      AND estado = 'AUSENTE';

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spRellamarTurno`(IN p_id_turno INT)
BEGIN
    UPDATE trn_turno
    SET fecha_llamado = NOW()
    WHERE id_turno = p_id_turno;

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spTogglePuestoActivo`(
    IN p_id_puesto INT
)
BEGIN
    UPDATE cfg_puesto
    SET activo = IF(activo = 1, 0, 1)
    WHERE id_puesto = p_id_puesto;
    
    SELECT activo FROM cfg_puesto WHERE id_puesto = p_id_puesto;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spToggleSectorActivo`(
    IN p_id_sector INT
)
BEGIN
    UPDATE cfg_sector
    SET activo = IF(activo = 1, 0, 1)
    WHERE id_sector = p_id_sector;
    
    SELECT activo FROM cfg_sector WHERE id_sector = p_id_sector;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spToggleUsuarioActivo`(
    IN p_id_usuario INT
)
BEGIN
    UPDATE seg_usuario
    SET estado = IF(estado = 1, 0, 1),
        fecha_baja = IF(estado = 0, NOW(), NULL)
    WHERE id = p_id_usuario;
    
    SELECT estado FROM seg_usuario WHERE id = p_id_usuario;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spUpdateAusente`(IN p_id_turno INT)
BEGIN
    UPDATE trn_turno
    SET estado = 'AUSENTE'
    WHERE id_turno = p_id_turno
      AND estado IN ('LLAMADO', 'EN_ATENCION');

    SELECT ROW_COUNT() AS filas_afectadas;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spUpdateDerivar`(
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
        WHERE id_turno = p_id_turno;

        SELECT ROW_COUNT() AS filas_afectadas;
    END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spUpdateFinalizar`(IN p_id_turno INT)
BEGIN
        UPDATE trn_turno
        SET estado = 'FINALIZADO',
            fecha_fin_atencion = NOW()
        WHERE id_turno = p_id_turno AND estado = 'EN_ATENCION';

        SELECT ROW_COUNT() AS filas_afectadas;
    END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spUpdateInicioAtencion`(IN p_id_turno INT)
BEGIN
        UPDATE trn_turno
        SET estado = 'EN_ATENCION',
            fecha_inicio_atencion = NOW()
        WHERE id_turno = p_id_turno AND estado = 'LLAMADO';

        SELECT ROW_COUNT() AS filas_afectadas;
    END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spUpdatePuesto`(
    IN p_id_puesto INT,
    IN p_descripcion VARCHAR(50),
    IN p_id_sector INT,
    IN p_id_usuario_operador INT,
    IN p_activo TINYINT(1)
)
BEGIN
    UPDATE cfg_puesto
    SET descripcion = p_descripcion,
        id_sector = p_id_sector,
        id_usuario_operador = IF(p_id_usuario_operador > 0, p_id_usuario_operador, NULL),
        activo = p_activo
    WHERE id_puesto = p_id_puesto;
    
    SELECT ROW_COUNT();
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spUpdateSector`(
    IN p_id_sector INT,
    IN p_descripcion VARCHAR(100),
    IN p_piso VARCHAR(30),
    IN p_letra_ticket VARCHAR(2),
    IN p_tiempo_estimado INT,
    IN p_pausado TINYINT(1),
    IN p_activo TINYINT(1)
)
BEGIN
    UPDATE cfg_sector
    SET descripcion = p_descripcion,
        piso = p_piso,
        letraTicket = UPPER(TRIM(p_letra_ticket)),
        tiempo_estimado = IFNULL(p_tiempo_estimado, 10),
        pausado = p_pausado,
        activo = p_activo
    WHERE id_sector = p_id_sector;
    
    SELECT ROW_COUNT();
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `spUpdateUsuario`(
    IN p_id_usuario INT,
    IN p_nombre VARCHAR(100),
    IN p_dni VARCHAR(20),
    IN p_clave VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_rol_id INT,
    IN p_estado TINYINT(1)
)
BEGIN
    IF p_clave IS NOT NULL AND TRIM(p_clave) <> '' THEN
        UPDATE seg_usuario
        SET nombre = p_nombre,
            dni = p_dni,
            clave = p_clave,
            email = p_email,
            estado = p_estado,
            fecha_baja = IF(p_estado = 0, NOW(), NULL)
        WHERE id = p_id_usuario;
    ELSE
        UPDATE seg_usuario
        SET nombre = p_nombre,
            dni = p_dni,
            email = p_email,
            estado = p_estado,
            fecha_baja = IF(p_estado = 0, NOW(), NULL)
        WHERE id = p_id_usuario;
    END IF;
    
    IF p_rol_id > 0 THEN
        DELETE FROM seg_usuario_rol WHERE usuario_id = p_id_usuario;
        INSERT INTO seg_usuario_rol (usuario_id, rol_id) VALUES (p_id_usuario, p_rol_id);
    END IF;
    
    SELECT ROW_COUNT();
END$$

DELIMITER ;
SET FOREIGN_KEY_CHECKS = 1;
