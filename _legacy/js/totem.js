/**
 * Terminal de Autoservicio (Totem) - Cliente Frontend
 */

(() => {
    "use strict";

    // =========================================================================
    // 1. ESTADO DEL COMPONENTE (State)
    // =========================================================================
    const state = {
        step: 1,                 // 1: Bienvenida | 2: DNI | 3: Sectores | 4: Ticket
        modo: "SIN_TURNO",       // "SIN_TURNO" o "CON_TURNO"
        dni: "",                 // Cadena numerica ingresada
        esPrioritario: false,    // Flag de atencion prioritaria
        sectores: [],            // Lista de sectores activos obtenidos del backend
        ticketEmitido: null,     // Objeto TurnoDto recibido tras la emision
        countdownInterval: null, // Handle del intervalo de reinicio automatico
        isSubmitting: false      // Bandera para evitar toques duplicados
    };

    // =========================================================================
    // 2. REFERENCIAS AL DOM 
    // =========================================================================
    const dom = {
        // Reloj de cabecera
        clockTime: document.getElementById("lblClockTime"),
        clockDate: document.getElementById("lblClockDate"),

        // Pasos del wizard
        stepWelcome: document.getElementById("stepWelcome"),
        stepDni: document.getElementById("stepDni"),
        stepSectors: document.getElementById("stepSectors"),
        stepTicket: document.getElementById("stepTicket"),

        // Paso 1: Bienvenida
        btnOpcionSinTurno: document.getElementById("btnOpcionSinTurno"),
        btnOpcionConTurno: document.getElementById("btnOpcionConTurno"),

        // Paso 2: Teclado DNI
        lblDniTitulo: document.getElementById("lblDniTitulo"),
        dniDisplay: document.getElementById("dniDisplay"),
        chkPrioridadTotem: document.getElementById("chkPrioridadTotem"),
        togglePrioridadBar: document.getElementById("togglePrioridadBar"),
        keypadBtns: document.querySelectorAll(".keypad-btn[data-key]"),
        btnKeypadClear: document.getElementById("btnKeypadClear"),
        btnKeypadDelete: document.getElementById("btnKeypadDelete"),
        btnDniVolver: document.getElementById("btnDniVolver"),
        btnDniContinuar: document.getElementById("btnDniContinuar"),

        // Paso 3: Sectores
        contenedorSectores: document.getElementById("contenedorSectores"),
        btnSectoresVolver: document.getElementById("btnSectoresVolver"),

        // Paso 4: Ticket emitido
        lblTicketCodigo: document.getElementById("lblTicketCodigo"),
        lblTicketSector: document.getElementById("lblTicketSector"),
        lblTicketPiso: document.getElementById("lblTicketPiso"),
        lblTicketPersonasAntes: document.getElementById("lblTicketPersonasAntes"),
        lblTicketDni: document.getElementById("lblTicketDni"),
        lblTicketHora: document.getElementById("lblTicketHora"),
        lblCountdown: document.getElementById("lblCountdown"),
        countdownFill: document.getElementById("countdownFill"),
        btnFinalizarTotem: document.getElementById("btnFinalizarTotem"),

        // Toast
        totemToast: document.getElementById("totemToast"),
        totemToastText: document.getElementById("totemToastText")
    };

    // =========================================================================
    // 3. COMUNICACION CON BACKEND (API Services)
    // =========================================================================
    const apiCall = async (methodName, params = {}) => {
        const response = await fetch(`Totem.aspx/${methodName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error(`Error en llamada al servidor (HTTP ${response.status})`);
        }

        const json = await response.json();
        // ASP.NET WebMethods devuelve .d
        return json?.d ?? null;
    };

    // =========================================================================
    // 4. HELPERS Y UTILIDADES
    // =========================================================================
    // Emitir sonido sintetizado de pulsacion tactil para accesibilidad
    const playBeep = (freq = 600, duration = 0.04) => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch {
            // Ignorar errores si el navegador restringe el audio
        }
    };

    // Mostrar toast informativo en pantalla tactil
    const showToast = (message, type = "normal", duration = 3000) => {
        if (!dom.totemToast || !dom.totemToastText) return;
        dom.totemToastText.textContent = message;
        dom.totemToast.className = `totem-toast show ${type}`;
        setTimeout(() => {
            dom.totemToast.className = "totem-toast";
        }, duration);
    };

    // Formatear numero de DNI con separador de miles
    const formatDni = (valor) => {
        if (!valor) return "";
        return valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Actualizar reloj digital en vivo y fecha
    const startClock = () => {
        const updateClock = () => {
            const now = new Date();
            if (dom.clockTime) {
                const hours = String(now.getHours()).padStart(2, "0");
                const minutes = String(now.getMinutes()).padStart(2, "0");
                const seconds = String(now.getSeconds()).padStart(2, "0");
                dom.clockTime.textContent = `${hours}:${minutes}:${seconds}`;
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
    // 5. NAVEGACION DE PASOS (Wizard Step Manager)
    // =========================================================================
    const setStep = (stepNumber) => {
        state.step = stepNumber;

        // Ocultar todos los pasos
        [dom.stepWelcome, dom.stepDni, dom.stepSectors, dom.stepTicket].forEach((el) => {
            el?.classList.remove("active");
        });

        // Mostrar paso activo
        switch (stepNumber) {
            case 1:
                dom.stepWelcome?.classList.add("active");
                break;
            case 2:
                dom.stepDni?.classList.add("active");
                updateDniDisplay();
                break;
            case 3:
                dom.stepSectors?.classList.add("active");
                renderSectores();
                break;
            case 4:
                dom.stepTicket?.classList.add("active");
                renderTicketEmitido();
                break;
        }
    };

    // =========================================================================
    // 6. RENDERIZADO VISUAL (UI Renderers)
    // =========================================================================
    // Actualizar visor de DNI y habilitar boton de continuacion
    const updateDniDisplay = () => {
        if (!dom.dniDisplay) return;

        if (state.dni.length === 0) {
            dom.dniDisplay.textContent = "Ingrese su número";
            dom.dniDisplay.classList.add("placeholder");
        } else {
            dom.dniDisplay.textContent = formatDni(state.dni);
            dom.dniDisplay.classList.remove("placeholder");
        }

        // Habilitar boton continuar si el DNI tiene longitud minima razonable (6 a 9 digitos)
        if (dom.btnDniContinuar) {
            dom.btnDniContinuar.disabled = state.dni.length < 6;
        }
    };

    // Renderizar grilla tactil de sectores disponibles
    const renderSectores = () => {
        if (!dom.contenedorSectores) return;

        if (state.sectores.length === 0) {
            dom.contenedorSectores.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--totem-text-muted); font-size: 1.2rem; padding: 3rem;">
                    No hay sectores de atención habilitados en este momento.
                </div>
            `;
            return;
        }

        // Mapear sectores a tarjetas touch
        dom.contenedorSectores.innerHTML = state.sectores.map((sec) => {
            const { IdSector, Descripcion, Piso, LetraTicket, TiempoEstimado = 10 } = sec;
            return `
                <div class="sector-touch-card" data-id-sector="${IdSector}">
                    <div class="sector-card-top">
                        <div class="sector-letter-badge">${LetraTicket || "T"}</div>
                        <span class="sector-floor-badge">${Piso || "Piso 1"}</span>
                    </div>
                    <h4>${Descripcion}</h4>
                    <div class="sector-card-bottom">
                        <span>Tiempo estimado</span>
                        <strong>~${TiempoEstimado} min</strong>
                    </div>
                </div>
            `;
        }).join("");

        // Asignar escuchador de clic/touch a cada tarjeta
        dom.contenedorSectores.querySelectorAll(".sector-touch-card").forEach((card) => {
            card.addEventListener("click", () => {
                const idSector = parseInt(card.getAttribute("data-id-sector"), 10);
                handleEmitirTurno(idSector);
            });
        });
    };

    // Renderizar tarjeta del ticket termico impreso
    const renderTicketEmitido = () => {
        const ticket = state.ticketEmitido;
        if (!ticket) return;

        const { CodigoTicket, SectorDescripcion, Piso, PersonasAntes = 0, Dni, FechaEmision } = ticket;

        if (dom.lblTicketCodigo) dom.lblTicketCodigo.textContent = CodigoTicket || "T-001";
        if (dom.lblTicketSector) dom.lblTicketSector.textContent = SectorDescripcion || "Sector";
        if (dom.lblTicketPiso) dom.lblTicketPiso.textContent = Piso || "Planta Baja";
        
        if (dom.lblTicketPersonasAntes) {
            dom.lblTicketPersonasAntes.textContent = PersonasAntes === 0
                ? "Usted es el primero en la fila de espera"
                : `${PersonasAntes} ${PersonasAntes === 1 ? "persona antes" : "personas antes"} en este sector`;
        }

        if (dom.lblTicketDni) dom.lblTicketDni.textContent = formatDni(Dni) || "Sin registrar";

        if (dom.lblTicketHora) {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            dom.lblTicketHora.textContent = `${hh}:${mm} hs`;
        }

        // Iniciar temporizador regresivo de 8 segundos para auto-reinicio
        startCountdownReset(8);
    };

    // Iniciar cuenta regresiva para reiniciar la terminal al Paso 1
    const startCountdownReset = (segundosTotal = 8) => {
        clearInterval(state.countdownInterval);

        let restante = segundosTotal;
        if (dom.lblCountdown) dom.lblCountdown.textContent = restante;
        if (dom.countdownFill) dom.countdownFill.style.width = "100%";

        state.countdownInterval = setInterval(() => {
            restante--;
            if (dom.lblCountdown) dom.lblCountdown.textContent = restante;

            const porcentaje = Math.max(0, (restante / segundosTotal) * 100);
            if (dom.countdownFill) dom.countdownFill.style.width = `${porcentaje}%`;

            if (restante <= 0) {
                clearInterval(state.countdownInterval);
                resetTotem();
            }
        }, 1000);
    };

    // =========================================================================
    // 7. MANEJADORES DE ACCIONES (Event Handlers)
    // =========================================================================
    // Seleccionar opcion SIN TURNO
    const handleSeleccionarSinTurno = () => {
        playBeep(520);
        state.modo = "SIN_TURNO";
        if (dom.lblDniTitulo) dom.lblDniTitulo.textContent = "Ingrese su DNI";
        setStep(2);
    };

    // Seleccionar opcion TENGO TURNO
    const handleSeleccionarConTurno = () => {
        playBeep(520);
        state.modo = "CON_TURNO";
        if (dom.lblDniTitulo) dom.lblDniTitulo.textContent = "Check-in: Ingrese su DNI";
        setStep(2);
    };

    // Manejar pulsacion de digito numerico
    const handleKeypadPress = (digito) => {
        playBeep(700, 0.03);
        // Limitar longitud maxima de DNI a 9 digitos
        if (state.dni.length >= 9) return;
        state.dni += digito;
        updateDniDisplay();
    };

    // Borrar el ultimo digito del DNI
    const handleKeypadDelete = () => {
        playBeep(450, 0.04);
        state.dni = state.dni.slice(0, -1);
        updateDniDisplay();
    };

    // Limpiar por completo el valor del DNI
    const handleKeypadClear = () => {
        playBeep(400, 0.05);
        state.dni = "";
        updateDniDisplay();
    };

    // Continuar desde el paso de ingreso de DNI
    const handleDniContinuar = async () => {
        if (state.dni.length < 6) {
            showToast("Por favor, ingrese un número de DNI válido.", "error");
            return;
        }

        playBeep(650);

        // Si es modo CON_TURNO, procesar check-in de cita programada
        if (state.modo === "CON_TURNO") {
            await handleCheckInCita();
            return;
        }

        // Si es SIN_TURNO, avanzar a seleccion de sector
        setStep(3);
    };

    // Procesar check-in de cita programada
    const handleCheckInCita = async () => {
        if (state.isSubmitting) return;
        state.isSubmitting = true;

        try {
            const ticket = await apiCall("ConsultarTurnoProgramado", { dni: state.dni });
            if (ticket) {
                state.ticketEmitido = ticket;
                playBeep(880, 0.12);
                setStep(4);
            } else {
                showToast("No se encontró cita programada. Por favor acérquese a Recepción.", "error", 4000);
            }
        } catch (err) {
            showToast(`Error: ${err.message}`, "error");
        } finally {
            state.isSubmitting = false;
        }
    };

    // Emitir turno al tocar un sector
    const handleEmitirTurno = async (idSector) => {
        if (state.isSubmitting) return;
        state.isSubmitting = true;

        playBeep(750, 0.08);

        try {
            const esPrioritario = dom.chkPrioridadTotem?.checked || false;
            const ticket = await apiCall("EmitirTurno", {
                dni: state.dni,
                idSector: idSector,
                esPrioritario: esPrioritario
            });

            if (!ticket) {
                throw new Error("El servidor no devolvió el turno emitido.");
            }

            state.ticketEmitido = ticket;

            // Sonido de confirmacion de ticket
            playBeep(880, 0.1);
            setTimeout(() => playBeep(1100, 0.15), 120);

            // Avanzar a paso de comprobante
            setStep(4);
        } catch (err) {
            showToast(`No se pudo emitir el turno: ${err.message}`, "error");
        } finally {
            state.isSubmitting = false;
        }
    };

    // Reiniciar y limpiar estado completo de la terminal
    const resetTotem = () => {
        clearInterval(state.countdownInterval);
        state.step = 1;
        state.modo = "SIN_TURNO";
        state.dni = "";
        state.esPrioritario = false;
        state.ticketEmitido = null;
        state.isSubmitting = false;

        if (dom.chkPrioridadTotem) dom.chkPrioridadTotem.checked = false;
        updateDniDisplay();
        setStep(1);
    };

    // =========================================================================
    // 8. CICLO DE VIDA E INICIALIZACION (Mount / Lifecycle)
    // =========================================================================
    // Conectar eventos del teclado y botones tactiles
    const initEventListeners = () => {
        // Paso 1
        dom.btnOpcionSinTurno?.addEventListener("click", handleSeleccionarSinTurno);
        dom.btnOpcionConTurno?.addEventListener("click", handleSeleccionarConTurno);

        // Paso 2 - Teclado
        dom.keypadBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const key = btn.getAttribute("data-key");
                handleKeypadPress(key);
            });
        });
        dom.btnKeypadDelete?.addEventListener("click", handleKeypadDelete);
        dom.btnKeypadClear?.addEventListener("click", handleKeypadClear);

        dom.btnDniVolver?.addEventListener("click", () => {
            playBeep(450);
            setStep(1);
        });
        dom.btnDniContinuar?.addEventListener("click", handleDniContinuar);

        // Paso 3
        dom.btnSectoresVolver?.addEventListener("click", () => {
            playBeep(450);
            setStep(2);
        });

        // Paso 4
        dom.btnFinalizarTotem?.addEventListener("click", () => {
            playBeep(600);
            resetTotem();
        });
    };

    // Inicializar aplicacion al cargar la pantalla
    const init = async () => {
        try {
            startClock();
            initEventListeners();

            // Cargar sectores activos desde el servidor
            state.sectores = (await apiCall("ObtenerSectores")) || [];
        } catch (err) {
            showToast(`Error al inicializar la terminal: ${err.message}`, "error");
        }
    };

    // Ejecutar al montar el DOM
    document.addEventListener("DOMContentLoaded", init);
})();
