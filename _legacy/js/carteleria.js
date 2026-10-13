/**
 * Carteleria Digital de Sala de Espera (Cliente TV)
 * Motor de actualizacion en tiempo real y audio para anuncios.
 */

(() => {
    "use strict";

    // =========================================================================
    // 1. ESTADO DE LA PANTALLA (State)
    // =========================================================================
    const state = {
        ultimoIdLlamado: null,       // Identificador del turno actual
        ultimaFirmaLlamado: null,    // Firma de turno y fecha para detectar re-llamados
        sonidoHabilitado: true,      // Estado del audio
        audioContext: null,          // Instancia de Web Audio API
        intervaloPolling: null,      // Handle del timer de sondeo
        frecuenciaMs: 3500,          // Intervalo de consulta (3.5 segundos)
        esPrimeraCarga: true,        // Flag para evitar sonar al abrir la pantalla si ya hay turnos viejos
        ultimoHistorialSignature: "", // evitar re-renderizado innecesario
        zocaloRefrescoTimer: null,   // Timer de actualizacion del zocalo
        zocaloMinutos: 10,           // Intervalo en minutos para consultar zocalo
        zocaloTexto: "",             // Texto actual del zocalo
        zocaloVisible: true,         // Visibilidad activa
        temaActual: "oscuro",        // Tema visual activo ('oscuro' o 'claro')
        temaManual: false            // Flag si el usuario selecciono manualmente el tema en esta pantalla
    };

    // =========================================================================
    // 2. REFERENCIAS AL DOM (UI Elements)
    // =========================================================================
    const dom = {
        // Overlay de inicio
        audioOverlay: document.getElementById("audioOverlay"),
        btnActivarAudio: document.getElementById("btnActivarAudio"),

        // Controles de cabecera
        btnToggleAudio: document.getElementById("btnToggleAudio"),
        iconAudioOn: document.getElementById("iconAudioOn"),
        iconAudioOff: document.getElementById("iconAudioOff"),
        lblAudioStatus: document.getElementById("lblAudioStatus"),
        btnToggleTema: document.getElementById("btnToggleTema"),
        iconTemaSol: document.getElementById("iconTemaSol"),
        iconTemaLuna: document.getElementById("iconTemaLuna"),
        lblTemaStatus: document.getElementById("lblTemaStatus"),
        btnFullscreen: document.getElementById("btnFullscreen"),

        // Selector de salas
        wrapperSelectorSala: document.getElementById("wrapperSelectorSala"),
        btnSelectorSala: document.getElementById("btnSelectorSala"),
        lblSalaStatus: document.getElementById("lblSalaStatus"),
        dropdownSalas: document.getElementById("dropdownSalas"),
        listaSalas: document.getElementById("listaSalas"),
        lblSubtituloSala: document.getElementById("lblSubtituloSala"),

        // Reloj digital
        clockTime: document.getElementById("lblClockTime"),
        clockDate: document.getElementById("lblClockDate"),

        // Panel Izquierdo (Foco)
        panelFocus: document.getElementById("panelUltimoLlamado"),
        boxStandby: document.getElementById("boxStandby"),
        boxActive: document.getElementById("boxActive"),
        lblFocusTicket: document.getElementById("lblFocusTicket"),
        lblFocusBox: document.getElementById("lblFocusBox"),
        lblFocusSector: document.getElementById("lblFocusSector"),
        lblFocusPiso: document.getElementById("lblFocusPiso"),

        // Panel Derecho (Historial)
        contenedorHistorial: document.getElementById("contenedorHistorial"),

        // Zocalo inferior
        footerTicker: document.getElementById("footerTicker"),
        tickerText: document.getElementById("tickerText")
    };

    // =========================================================================
    // 3. SINTETIZADOR DE AUDIO (Web Audio API Chime / Campana)
    // =========================================================================
    const getAudioContext = () => {
        if (!state.audioContext) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                state.audioContext = new AudioCtx();
            }
        }
        if (state.audioContext && state.audioContext.state === "suspended") {
            state.audioContext.resume();
        }
        return state.audioContext;
    };

    /**
     * Emite una campana armónica acústica de doble tono (Ding - Dong).
     */
    const playChime = () => {
        if (!state.sonidoHabilitado) return;

        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;

            // Secuencia armonica de campana de sala de espera:
            // Nota 1 (Ding): C5 (523.25 Hz) + armónicos
            // Nota 2 (Dong): G5 (783.99 Hz) desvaneciendo suavemente
            const notes = [
                { freq: 523.25, time: 0.00, duration: 0.9, gain: 0.35 },
                { freq: 659.25, time: 0.12, duration: 1.1, gain: 0.40 },
                { freq: 783.99, time: 0.35, duration: 1.4, gain: 0.45 },
                { freq: 1046.50, time: 0.38, duration: 1.6, gain: 0.25 }
            ];

            notes.forEach(({ freq, time, duration, gain: peakGain }) => {
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + time);

                // Envolvente de campana con caída exponencial
                gainNode.gain.setValueAtTime(0.001, now + time);
                gainNode.gain.linearRampToValueAtTime(peakGain, now + time + 0.03);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

                osc.connect(gainNode);
                gainNode.connect(ctx.destination);

                osc.start(now + time);
                osc.stop(now + time + duration);
            });
        } catch (err) {
            console.warn("No se pudo emitir la campana de audio:", err);
        }
    };

    // =========================================================================
    // 4. HELPERS Y FORMATEO
    // =========================================================================
    const parseNetDate = (dateVal) => {
        if (!dateVal) return null;
        if (dateVal instanceof Date) return dateVal;
        if (typeof dateVal === "string") {
            const match = dateVal.match(/\/Date\((-?\d+)\)\//);
            if (match) return new Date(parseInt(match[1], 10));
            const parsed = new Date(dateVal);
            if (!isNaN(parsed.getTime())) return parsed;
        }
        return null;
    };

    const formatTimeOnly = (dateVal) => {
        const d = parseNetDate(dateVal);
        if (!d) return "--:--";
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes} hs`;
    };

    const escapeHtml = (str) => {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // =========================================================================
    // 5. RELOJ DIGITAL INSTITUCIONAL EN VIVO
    // =========================================================================
    const initClock = () => {
        const updateClock = () => {
            const now = new Date();
            if (dom.clockTime) {
                const h = String(now.getHours()).padStart(2, "0");
                const m = String(now.getMinutes()).padStart(2, "0");
                const s = String(now.getSeconds()).padStart(2, "0");
                dom.clockTime.textContent = `${h}:${m}:${s}`;
            }
            if (dom.clockDate) {
                const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
                dom.clockDate.textContent = now.toLocaleDateString("es-AR", options);
            }
        };

        updateClock();
        setInterval(updateClock, 1000);
    };

    // =========================================================================
    // 5.1 GESTION DEL TEMA VISUAL (CLARO / OSCURO)
    // =========================================================================
    /**
     * Aplica la clase del tema visual sobre el elemento body y actualiza boton e iconos.
     */
    const aplicarTema = (tema) => {
        const esClaro = (tema === "claro");
        state.temaActual = esClaro ? "claro" : "oscuro";

        if (esClaro) {
            document.body.classList.add("tv-theme-light");
        } else {
            document.body.classList.remove("tv-theme-light");
        }

        // Alternar visibilidad de los iconos de Sol y Luna
        if (dom.iconTemaSol && dom.iconTemaLuna) {
            dom.iconTemaSol.style.display = esClaro ? "inline-block" : "none";
            dom.iconTemaLuna.style.display = esClaro ? "none" : "inline-block";
        }

        // Leyenda del boton
        if (dom.lblTemaStatus) {
            dom.lblTemaStatus.textContent = esClaro ? "Modo Oscuro" : "Modo Claro";
        }
    };

    /**
     * Alterna interactivamente entre modo claro y modo oscuro desde el boton de la cabecera.
     */
    const toggleTema = () => {
        const nuevoTema = (state.temaActual === "claro") ? "oscuro" : "claro";
        state.temaManual = true;
        try {
            localStorage.setItem("carteleria_theme", nuevoTema);
        } catch (e) {
            console.warn("No se pudo persistir el tema en localStorage:", e);
        }
        aplicarTema(nuevoTema);
    };

    /**
     * Inicializa el tema aplicando la cascada de 3 niveles:
     * 1. Eleccion manual en navegador local (localStorage).
     * 2. Parametro en la URL (?tema=claro o ?tema=oscuro).
     * 3. Parametro global configurado en el servidor/base de datos.
     */
    const initTema = () => {
        let temaElegido = "oscuro";

        // Prioridad 1: LocalStorage (decision manual en este navegador)
        let localTheme = null;
        try {
            localTheme = localStorage.getItem("carteleria_theme");
        } catch (e) {}

        // Prioridad 2: Parametro de URL
        const temaUrl = (document.body.getAttribute("data-tema-url") || "").trim().toLowerCase();

        // Prioridad 3: Parametro de BD / servidor
        const temaInicial = (document.body.getAttribute("data-tema-inicial") || "oscuro").trim().toLowerCase();

        if (localTheme && (localTheme === "claro" || localTheme === "oscuro")) {
            temaElegido = localTheme;
            state.temaManual = true;
        } else if (temaUrl && (temaUrl === "claro" || temaUrl === "oscuro")) {
            temaElegido = temaUrl;
        } else if (temaInicial) {
            temaElegido = temaInicial;
        }

        aplicarTema(temaElegido);
    };

    // =========================================================================
    // 5.1 SELECTOR DE SALA / SECTOR (Memoria local y navegación)
    // =========================================================================
    const abrirDropdownSalas = () => {
        if (!dom.wrapperSelectorSala || !dom.dropdownSalas) return;
        dom.wrapperSelectorSala.classList.add("open");
        dom.dropdownSalas.style.display = "block";
    };

    const cerrarDropdownSalas = () => {
        if (!dom.wrapperSelectorSala || !dom.dropdownSalas) return;
        dom.wrapperSelectorSala.classList.remove("open");
        dom.dropdownSalas.style.display = "none";
    };

    const fetchSectoresSalas = async () => {
        if (!dom.listaSalas) return;
        try {
            const response = await fetch("Carteleria.aspx/ObtenerSectoresSalas", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: "{}"
            });

            if (!response.ok) return;
            const json = await response.json();
            const sectores = json?.d || [];

            const currentSectorId = window.__CARTELERIA_FILTER?.idSector || 0;

            let html = `
                <button type="button" class="tv-sala-item ${currentSectorId === 0 ? "active" : ""}" data-id="0">
                    <div class="tv-sala-item-title">Mesa de Entrada (General)</div>
                    <div class="tv-sala-item-piso">Planta Baja • Todos los sectores</div>
                </button>
            `;

            sectores.forEach((sec) => {
                const isActive = currentSectorId === sec.IdSector;
                html += `
                    <button type="button" class="tv-sala-item ${isActive ? "active" : ""}" data-id="${sec.IdSector}">
                        <div class="tv-sala-item-title">${escapeHtml(sec.Descripcion)}</div>
                        <div class="tv-sala-item-piso">${escapeHtml(sec.Piso || "Planta Baja")}</div>
                    </button>
                `;
            });

            dom.listaSalas.innerHTML = html;

            const items = dom.listaSalas.querySelectorAll(".tv-sala-item");
            items.forEach((btn) => {
                btn.addEventListener("click", () => {
                    const id = parseInt(btn.getAttribute("data-id"), 10) || 0;
                    try {
                        localStorage.setItem("carteleria_sector", id.toString());
                    } catch (e) {}
                    cerrarDropdownSalas();

                    if (id > 0) {
                        window.location.href = "Carteleria.aspx?sector=" + id;
                    } else {
                        window.location.href = "Carteleria.aspx";
                    }
                });
            });

            if (currentSectorId > 0) {
                const secActual = sectores.find(s => s.IdSector === currentSectorId);
                if (secActual && dom.lblSalaStatus) {
                    dom.lblSalaStatus.textContent = secActual.Descripcion;
                }
            } else if (dom.lblSalaStatus) {
                dom.lblSalaStatus.textContent = "Mesa de Entrada";
            }
        } catch (err) {
            console.warn("No se pudo cargar la lista de sectores:", err);
        }
    };

    const initSelectorSalas = () => {
        if (!window.__CARTELERIA_FILTER?.hasUrlParam) {
            try {
                const savedSector = localStorage.getItem("carteleria_sector");
                if (savedSector !== null && savedSector !== undefined) {
                    const secId = parseInt(savedSector, 10);
                    if (!isNaN(secId) && secId > 0 && secId !== window.__CARTELERIA_FILTER.idSector) {
                        window.location.replace("Carteleria.aspx?sector=" + secId);
                        return;
                    }
                }
            } catch (e) {}
        } else if (window.__CARTELERIA_FILTER?.idSector > 0) {
            try {
                localStorage.setItem("carteleria_sector", window.__CARTELERIA_FILTER.idSector.toString());
            } catch (e) {}
        } else if (window.__CARTELERIA_FILTER?.idSector === 0) {
            try {
                localStorage.setItem("carteleria_sector", "0");
            } catch (e) {}
        }

        if (dom.btnSelectorSala && dom.wrapperSelectorSala && dom.dropdownSalas) {
            dom.btnSelectorSala.addEventListener("click", (e) => {
                e.stopPropagation();
                const isOpen = dom.wrapperSelectorSala.classList.contains("open");
                if (isOpen) {
                    cerrarDropdownSalas();
                } else {
                    abrirDropdownSalas();
                }
            });

            document.addEventListener("click", (e) => {
                if (!dom.wrapperSelectorSala.contains(e.target)) {
                    cerrarDropdownSalas();
                }
            });
        }

        fetchSectoresSalas();
    };

    // =========================================================================
    // 6. RENDERIZADO VISUAL DE TURNOS
    // =========================================================================
    /**
     * Dibuja el turno principal en gran formato.
     */
    const renderFoco = (turno) => {
        if (!turno) {
            if (dom.boxActive) dom.boxActive.style.display = "none";
            if (dom.boxStandby) dom.boxStandby.style.display = "flex";
            return;
        }

        const { CodigoTicket, PuestoDescripcion, SectorDescripcion, Piso } = turno;

        if (dom.lblFocusTicket) dom.lblFocusTicket.textContent = CodigoTicket || "---";
        if (dom.lblFocusBox) dom.lblFocusBox.textContent = PuestoDescripcion || "BOX 1";
        if (dom.lblFocusSector) dom.lblFocusSector.textContent = SectorDescripcion || "Sector";
        if (dom.lblFocusPiso) dom.lblFocusPiso.textContent = Piso || "Planta Baja";

        if (dom.boxStandby) dom.boxStandby.style.display = "none";
        if (dom.boxActive) dom.boxActive.style.display = "flex";
    };

    /**
     * Dibuja la lista de llamados previos en el panel secundario.
     * Solo redibuja cuando la lista de turnos realmente cambia, aplicando transicion suave.
     */
    const renderHistorial = (turnosPrevios = [], esNuevoLlamado = false) => {
        if (!dom.contenedorHistorial) return;

        // Calcular firma unica basada en IDs y hora de llamado
        const firmaActual = turnosPrevios.map((t) => `${t.IdTurno}_${t.FechaLlamado}`).join("|");

        // Si el historial es identico al anterior, NO tocar el DOM para evitar parpadeos
        if (firmaActual === state.ultimoHistorialSignature) {
            return;
        }

        state.ultimoHistorialSignature = firmaActual;

        if (turnosPrevios.length === 0) {
            dom.contenedorHistorial.innerHTML = `
                <div class="history-empty">No hay llamados anteriores hoy.</div>
            `;
            return;
        }

        dom.contenedorHistorial.innerHTML = turnosPrevios.map((t, idx) => {
            const { CodigoTicket, PuestoDescripcion, SectorDescripcion, FechaLlamado } = t;
            // Solo animar suavemente el primer elemento (el recién ingresado) si es una novedad
            const claseNuevo = (idx === 0 && esNuevoLlamado) ? " nuevo-ingreso" : "";

            return `
                <div class="history-item${claseNuevo}">
                    <div class="history-ticket-col">
                        <span class="history-ticket-number">${escapeHtml(CodigoTicket)}</span>
                        <div class="history-destination-meta">
                            <span class="history-box-badge">${escapeHtml(PuestoDescripcion || "Box")}</span>
                            <span class="history-sector-title">${escapeHtml(SectorDescripcion)}</span>
                        </div>
                    </div>
                    <div class="history-time-col">
                        <span class="history-time-meta">${formatTimeOnly(FechaLlamado)}</span>
                    </div>
                </div>
            `;
        }).join("");
    };

    // =========================================================================
    // 7. CONSUMO DE DATOS Y DETECCION DE NUEVOS LLAMADOS
    // =========================================================================
    const fetchLlamados = async () => {
        try {
            const payload = {
                piso: window.__CARTELERIA_FILTER?.piso || null,
                idSector: window.__CARTELERIA_FILTER?.idSector || 0
            };

            const response = await fetch("Carteleria.aspx/ObtenerLlamadosCarteleria", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) return;

            const json = await response.json();
            const turnos = json?.d || [];

            if (turnos.length === 0) {
                renderFoco(null);
                renderHistorial([], false);
                state.ultimoIdLlamado = null;
                state.ultimaFirmaLlamado = null;
                return;
            }

            const enFoco = turnos[0];
            const historial = turnos.slice(1);

            // Detectar si entro un nuevo llamado o se reitero llamado al mismo turno
            const firmaActual = `${enFoco.IdTurno}_${enFoco.FechaLlamado || ""}`;

            if (firmaActual !== state.ultimaFirmaLlamado) {
                const esNovedad = state.ultimaFirmaLlamado !== null && !state.esPrimeraCarga;

                state.ultimaFirmaLlamado = firmaActual;
                state.ultimoIdLlamado = enFoco.IdTurno;
                renderFoco(enFoco);
                renderHistorial(historial, esNovedad);

                if (esNovedad) {
                    // 1. Alerta sonora campana
                    playChime();

                    // 2. Destello visual de parpadeo en panel de foco
                    if (dom.panelFocus) {
                        dom.panelFocus.classList.remove("nuevo-llamado-flash");
                        void dom.panelFocus.offsetWidth; // Force reflow
                        dom.panelFocus.classList.add("nuevo-llamado-flash");
                    }
                }
            } else {
                // Mismo turno y misma estampa de llamado: verificar historial sin animacion forzada
                renderHistorial(historial, false);
            }

            state.esPrimeraCarga = false;
        } catch (err) {
            // Ignorar fallos temporales de red para que la pantalla siga activa
            console.warn("Fallo temporal de conexion en carteleria:", err);
        }
    };

    // =========================================================================
    // 8. EVENTOS Y CONTROL DE PANTALLA
    // =========================================================================
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    const toggleAudio = () => {
        state.sonidoHabilitado = !state.sonidoHabilitado;
        if (state.sonidoHabilitado) {
            getAudioContext();
            if (dom.iconAudioOn) dom.iconAudioOn.style.display = "block";
            if (dom.iconAudioOff) dom.iconAudioOff.style.display = "none";
            if (dom.lblAudioStatus) dom.lblAudioStatus.textContent = "Sonido Activado";
            playChime(); // Pequeño chime de prueba al activarlo
        } else {
            if (dom.iconAudioOn) dom.iconAudioOn.style.display = "none";
            if (dom.iconAudioOff) dom.iconAudioOff.style.display = "block";
            if (dom.lblAudioStatus) dom.lblAudioStatus.textContent = "Silenciado";
        }
    };

    const unlockAudioAndStart = () => {
        getAudioContext();
        if (dom.audioOverlay) {
            dom.audioOverlay.classList.add("hidden");
        }
        // Intentar pasar a pantalla completa al dar inicio
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
        playChime();
    };

    /**
     * Consulta periodicamente los cambios de configuracion del zocalo (en caliente).
     */
    const fetchConfiguracionZocalo = async () => {
        try {
            const response = await fetch("Carteleria.aspx/ObtenerConfiguracionZocalo", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify({})
            });

            if (!response.ok) return;

            const json = await response.json();
            const cfg = json?.d;
            if (!cfg) return;

            const { zocalo, visible, refrescoMinutos } = cfg;

            // 1. Manejo de visibilidad y presencia de texto
            if (dom.footerTicker) {
                const debeMostrar = visible && zocalo && zocalo.trim().length > 0;
                dom.footerTicker.style.display = debeMostrar ? "flex" : "none";
            }

            // 2. Manejo de texto dinamico
            if (dom.tickerText && zocalo !== state.zocaloTexto) {
                state.zocaloTexto = zocalo;
                dom.tickerText.textContent = zocalo || "";
            }

            // 3. Ajuste dinamico de intervalo si cambio en la base de datos
            const nuevoMinutos = (refrescoMinutos && refrescoMinutos > 0) ? refrescoMinutos : 10;
            if (nuevoMinutos !== state.zocaloMinutos) {
                state.zocaloMinutos = nuevoMinutos;
                if (state.zocaloRefrescoTimer) {
                    clearInterval(state.zocaloRefrescoTimer);
                    state.zocaloRefrescoTimer = setInterval(fetchConfiguracionZocalo, state.zocaloMinutos * 60 * 1000);
                }
            }

            // 4. Sincronizacion remota de tema visual en caliente
            if (cfg.tema && !state.temaManual) {
                const temaRemoto = String(cfg.tema).toLowerCase();
                if ((temaRemoto === "claro" || temaRemoto === "oscuro") && temaRemoto !== state.temaActual) {
                    aplicarTema(temaRemoto);
                }
            }
        } catch (err) {
            console.warn("Fallo temporal al consultar configuracion del zocalo:", err);
        }
    };

    // =========================================================================
    // 9. INICIALIZACION
    // =========================================================================
    const init = () => {
        initClock();
        initTema();
        initSelectorSalas();

        // Escuchadores de eventos
        dom.btnActivarAudio?.addEventListener("click", unlockAudioAndStart);
        dom.audioOverlay?.addEventListener("click", unlockAudioAndStart);
        dom.btnToggleAudio?.addEventListener("click", toggleAudio);
        dom.btnToggleTema?.addEventListener("click", toggleTema);
        dom.btnFullscreen?.addEventListener("click", toggleFullscreen);

        // Inicializar contexto de audio al cargar
        getAudioContext();

        // Desbloqueo pasivo de audio ante primera interaccion en la pantalla
        document.addEventListener("click", () => {
            getAudioContext();
        }, { once: true });

        // Intentar activar pantalla completa al inicio
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }

        // Carga inicial y arranque del sondeo continuo de turnos
        fetchLlamados();
        state.intervaloPolling = setInterval(fetchLlamados, state.frecuenciaMs);

        // Carga inicial y timer de actualizacion del zocalo (por defecto cada 10 minutos)
        fetchConfiguracionZocalo();
        state.zocaloRefrescoTimer = setInterval(fetchConfiguracionZocalo, state.zocaloMinutos * 60 * 1000);
    };

    document.addEventListener("DOMContentLoaded", init);
})();
