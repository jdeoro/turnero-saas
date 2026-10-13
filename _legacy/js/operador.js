/**
 * Panel del Operador - Cliente Frontend
 * Gestion del ciclo de atencion, cola de espera y cola de ausentes
 */

(() => {
    "use strict";

    // =========================================================================
    // 1. ESTADO DEL COMPONENTE (State)
    // =========================================================================
    const state = {
        puesto: null,              // PuestoDto: IdPuesto, Descripcion, IdSector, etc.
        turno: null,               // TurnoDto: IdTurno, CodigoTicket, Estado, etc.
        colaEspera: [],            // List<TurnoDto> en espera activa
        colaAusentes: [],          // List<TurnoDto> marcados como ausentes hoy
        tabActiva: "ESPERA",       // "ESPERA" o "AUSENTES"
        sectores: [],              // List<SectorDto> para el modal de derivacion
        timerInterval: null,       // Handle del cronometro en vivo
        pollingInterval: null,     // Handle del refresco automatico
        isSubmitting: false        // flag anti-rebote para llamadas concurrentes
    };

    // =========================================================================
    // 2. REFERENCIAS AL DOM (UI References)
    // =========================================================================
    const dom = {
        // Cabecera del puesto
        boxNombre: document.getElementById("lblBoxNombre"),
        sectorNombre: document.getElementById("lblSectorNombre"),
        pisoNombre: document.getElementById("lblPisoNombre"),

        // Tarjeta de turno actual (izquierda)
        ticketGrande: document.getElementById("lblTicketGrande"),
        badgeEstado: document.getElementById("badgeEstadoTurno"),
        dniPaciente: document.getElementById("lblDniPaciente"),
        obsTurno: document.getElementById("lblObsTurno"),
        filaObsTurno: document.getElementById("filaObsTurno"),

        // Cronometro digital
        cronometroDisplay: document.getElementById("cronometroDisplay"),

        // Botonera 2x2 del turno actual
        btnRellamar: document.getElementById("btnRellamar"),
        btnAusente: document.getElementById("btnAusente"),
        btnFinalizar: document.getElementById("btnFinalizar"),
        btnDerivar: document.getElementById("btnDerivar"),

        // Columna derecha: Solapas y Listas
        tabColaEspera: document.getElementById("tabColaEspera"),
        tabColaAusentes: document.getElementById("tabColaAusentes"),
        cantidadEspera: document.getElementById("lblCantidadEspera"),
        cantidadAusentes: document.getElementById("lblCantidadAusentes"),
        btnRefrescarCola: document.getElementById("btnRefrescarCola"),
        colaContenedor: document.getElementById("contenedorCola"),
        contenedorAusentes: document.getElementById("contenedorAusentes"),

        // Boton ancho de llamada al pie de la cola
        btnLlamar: document.getElementById("btnLlamarSiguiente"),

        // Modal de derivacion
        modalDerivacion: document.getElementById("modalDerivacion"),
        btnCerrarModal: document.getElementById("btnCerrarModal"),
        btnCancelarModal: document.getElementById("btnCancelarModal"),
        btnConfirmarDerivar: document.getElementById("btnConfirmarDerivar"),
        cboSectorDestino: document.getElementById("cboSectorDestino"),
        chkPrioridad: document.getElementById("chkPrioridad"),
        txtNotasDerivacion: document.getElementById("txtNotasDerivacion"),

        // Notificaciones Toast
        toast: document.getElementById("panelToast"),
        toastMensaje: document.getElementById("toastMensaje")
    };

    // =========================================================================
    // 3. COMUNICACION CON BACKEND (API Services)
    // =========================================================================
    const apiCall = async (methodName, params = {}) => {
        const response = await fetch(`Operador.aspx/${methodName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error(`Error en la llamada al servidor (HTTP ${response.status})`);
        }

        const json = await response.json();
        // ASP.NET WebMethods devuelve siempre el resultado envuelto en la propiedad .d
        return json?.d ?? null;
    };

    // =========================================================================
    // 4. HELPERS Y UTILIDADES
    // =========================================================================
    // Formateo de DNI con puntos de miles para visualizacion
    const formatoDni = (valor) => {
        if (!valor) return "Sin DNI";
        const str = String(valor).replace(/\D/g, "");
        if (!str) return "Sin DNI";
        return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const parseNetDate = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return dateStr;

        if (typeof dateStr === "string") {
            const match = dateStr.match(/\/Date\((-?\d+)\)\//);
            if (match) {
                return new Date(parseInt(match[1], 10));
            }
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) return parsed;
        }

        return null;
    };

    const formatTimeOnly = (dateVal) => {
        const d = parseNetDate(dateVal);
        if (!d) return "--:--";
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    };

    const escapeHtml = (text) => {
        if (!text) return "";
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    let toastTimer = null;
    const showToast = (mensaje, tipo = "info", duracion = 3500) => {
        if (!dom.toast || !dom.toastMensaje) return;

        clearTimeout(toastTimer);
        dom.toastMensaje.textContent = mensaje;
        dom.toast.className = `toast-panel visible toast-${tipo}`;

        toastTimer = setTimeout(() => {
            dom.toast.className = "toast-panel";
        }, duracion);
    };

    // Cronometro digital activo de atencion
    const startTimer = (fechaInicio) => {
        stopTimer();

        let startDate = parseNetDate(fechaInicio);
        if (!startDate) {
            startDate = new Date();
        }

        const updateClock = () => {
            const now = new Date();
            const diffSeconds = Math.max(0, Math.floor((now - startDate) / 1000));
            const mm = String(Math.floor(diffSeconds / 60)).padStart(2, "0");
            const ss = String(diffSeconds % 60).padStart(2, "0");

            if (dom.cronometroDisplay) {
                dom.cronometroDisplay.textContent = `${mm}:${ss}`;
            }
        };

        updateClock();
        state.timerInterval = setInterval(updateClock, 1000);
    };

    const stopTimer = () => {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
        if (dom.cronometroDisplay) {
            dom.cronometroDisplay.textContent = "00:00";
        }
    };

    // =========================================================================
    // 5. RENDERIZADO VISUAL (UI Renderers)
    // =========================================================================
    const renderPuestoHeader = () => {
        if (!state.puesto) return;
        const { Descripcion, SectorDescripcion, Piso } = state.puesto;

        if (dom.boxNombre) dom.boxNombre.textContent = Descripcion || "- Sin definir -";
        if (dom.sectorNombre) dom.sectorNombre.textContent = SectorDescripcion || "- Sin definir -";
        if (dom.pisoNombre) dom.pisoNombre.textContent = Piso || "- Sin definir -";
    };

    // Actualiza disponibilidad de la botonera 2x2 y del boton Llamar Siguiente
    const renderActionButtons = (hasTurnoActivo) => {
        if (hasTurnoActivo) {
            // Box ocupado: llamada deshabilitada, controles de atencion activos
            if (dom.btnLlamar) dom.btnLlamar.disabled = true;
            if (dom.btnRellamar) dom.btnRellamar.disabled = false;
            if (dom.btnAusente) dom.btnAusente.disabled = false;
            if (dom.btnFinalizar) dom.btnFinalizar.disabled = false;
            if (dom.btnDerivar) dom.btnDerivar.disabled = false;
        } else {
            // Box libre: llamada habilitada si hay turnos en cola, controles de atencion bloqueados
            const hayGenteEnEspera = state.colaEspera && state.colaEspera.length > 0;
            if (dom.btnLlamar) dom.btnLlamar.disabled = !hayGenteEnEspera;
            if (dom.btnRellamar) dom.btnRellamar.disabled = true;
            if (dom.btnAusente) dom.btnAusente.disabled = true;
            if (dom.btnFinalizar) dom.btnFinalizar.disabled = true;
            if (dom.btnDerivar) dom.btnDerivar.disabled = true;
        }
    };

    const renderTurnoActual = (turno) => {
        state.turno = turno;

        // Estado: Box Libre (sin turno asignado)
        if (!turno) {
            if (dom.ticketGrande) dom.ticketGrande.textContent = "---";
            if (dom.badgeEstado) {
                dom.badgeEstado.className = "badge-estado badge-libre";
                dom.badgeEstado.textContent = "BOX DISPONIBLE";
            }
            if (dom.dniPaciente) dom.dniPaciente.textContent = "Esperando llamado";
            if (dom.filaObsTurno) dom.filaObsTurno.style.display = "none";

            stopTimer();
            renderActionButtons(false);
            return;
        }

        // Estado: Hay un turno activo en atencion
        const { CodigoTicket, Dni, Observaciones, FechaInicioAtencion, FechaLlamado } = turno;

        if (dom.ticketGrande) dom.ticketGrande.textContent = CodigoTicket || "---";
        if (dom.dniPaciente) dom.dniPaciente.textContent = Dni ? `DNI ${formatoDni(Dni)}` : "Sin DNI registrado";

        if (Observaciones && Observaciones.trim().length > 0) {
            if (dom.obsTurno) dom.obsTurno.textContent = Observaciones;
            if (dom.filaObsTurno) dom.filaObsTurno.style.display = "flex";
        } else {
            if (dom.filaObsTurno) dom.filaObsTurno.style.display = "none";
        }

        if (dom.badgeEstado) {
            dom.badgeEstado.className = "badge-estado badge-atencion";
            dom.badgeEstado.textContent = "EN ATENCIÓN";
        }

        // El cronometro arranca automaticamente al convocarse el turno
        startTimer(FechaInicioAtencion || FechaLlamado);
        renderActionButtons(true);
    };

    const renderColaEspera = (turnos = []) => {
        state.colaEspera = turnos;

        if (dom.cantidadEspera) {
            dom.cantidadEspera.textContent = turnos.length;
        }

        // Si el box esta libre, habilita o deshabilita el boton Llamar Siguiente
        if (!state.turno && dom.btnLlamar) {
            dom.btnLlamar.disabled = (turnos.length === 0);
        }

        if (!dom.colaContenedor) return;

        if (turnos.length === 0) {
            dom.colaContenedor.innerHTML = `
                <div class="cola-vacia">No hay pacientes en espera en este sector.</div>
            `;
            return;
        }

        dom.colaContenedor.innerHTML = turnos.map((t) => {
            const { CodigoTicket, Dni, EsPrioritario, MinutosEspera = 0 } = t;
            const itemClass = EsPrioritario ? "turno-item prioritario" : "turno-item";
            const badgePrioridad = EsPrioritario
                ? `<span class="badge-prioridad">Prioritario</span>`
                : "";

            return `
                <div class="${itemClass}">
                    <div class="turno-item-header">
                        <span class="turno-ticket">${escapeHtml(CodigoTicket)}</span>
                        ${badgePrioridad}
                    </div>
                    <div class="turno-item-body">
                        <span class="turno-dni">DNI ${formatoDni(Dni)}</span>
                        <span class="turno-espera">Espera: ${MinutosEspera} min</span>
                    </div>
                </div>
            `;
        }).join("");
    };

    const renderColaAusentes = (ausentes = []) => {
        state.colaAusentes = ausentes;

        if (dom.cantidadAusentes) {
            dom.cantidadAusentes.textContent = ausentes.length;
        }

        if (!dom.contenedorAusentes) return;

        if (ausentes.length === 0) {
            dom.contenedorAusentes.innerHTML = `
                <div class="cola-vacia">No hay pacientes ausentes registrados hoy.</div>
            `;
            return;
        }

        dom.contenedorAusentes.innerHTML = ausentes.map((t) => {
            const { IdTurno, CodigoTicket, Dni, FechaLlamado } = t;
            return `
                <div class="turno-item">
                    <div class="turno-item-header">
                        <span class="turno-ticket">${escapeHtml(CodigoTicket)}</span>
                        <span class="badge-prioridad" style="background: #FEF3C7; color: #D97706;">Ausente</span>
                    </div>
                    <div class="turno-item-body">
                        <span class="turno-dni">DNI ${formatoDni(Dni)}</span>
                        <span class="turno-espera">Llamado: ${formatTimeOnly(FechaLlamado)}</span>
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 0.4rem;">
                        <button type="button" class="btn-reincorporar" data-id-turno="${IdTurno}" title="Devolver a la cola de espera con prioridad">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                            </svg>
                            <span>Reincorporar a la Cola</span>
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        // Asignar "listener" para reincorporar a la cola
        dom.contenedorAusentes.querySelectorAll(".btn-reincorporar").forEach((btn) => {
            btn.addEventListener("click", () => {
                const idTurno = parseInt(btn.getAttribute("data-id-turno"), 10);
                handleReactivarAusente(idTurno);
            });
        });
    };

    const renderComboSectores = () => {
        if (!dom.cboSectorDestino) return;

        const actualSectorId = state.puesto?.IdSector ?? 0;
        const listaFiltrada = state.sectores.filter((s) => s.IdSector !== actualSectorId);

        if (listaFiltrada.length === 0) {
            dom.cboSectorDestino.innerHTML = `<option value="">No hay otros sectores disponibles</option>`;
            return;
        }

        dom.cboSectorDestino.innerHTML = `
            <option value="">-- Seleccionar Sector / Piso --</option>
            ${listaFiltrada.map((s) => {
                const pisoStr = s.Piso ? ` (${s.Piso})` : "";
                return `<option value="${s.IdSector}">${escapeHtml(s.Descripcion)}${escapeHtml(pisoStr)}</option>`;
            }).join("")}
        `;
    };

    // =========================================================================
    // 6. MANEJO DE SOLAPAS (Tabs: Espera vs Ausentes)
    // =========================================================================
    const setTabActiva = (tab) => {
        state.tabActiva = tab;

        if (tab === "ESPERA") {
            dom.tabColaEspera?.classList.add("active");
            dom.tabColaAusentes?.classList.remove("active");
            if (dom.colaContenedor) dom.colaContenedor.style.display = "flex";
            if (dom.contenedorAusentes) dom.contenedorAusentes.style.display = "none";
        } else {
            dom.tabColaAusentes?.classList.add("active");
            dom.tabColaEspera?.classList.remove("active");
            if (dom.colaContenedor) dom.colaContenedor.style.display = "none";
            if (dom.contenedorAusentes) dom.contenedorAusentes.style.display = "flex";
        }
    };

    // =========================================================================
    // 7. CONTROLADORES DE EVENTOS (Handlers)
    // =========================================================================
    const handleFetchTurnoActual = async () => {
        if (!state.puesto) return;
        try {
            const turno = await apiCall("ObtenerActual", { idPuesto: state.puesto.IdPuesto });
            renderTurnoActual(turno);
        } catch (err) {
            console.error("Fallo al consultar turno activo:", err);
        }
    };

    const handleFetchColaEspera = async () => {
        if (!state.puesto) return;
        try {
            const [cola, ausentes] = await Promise.all([
                apiCall("ObtenerEnCola", { idSector: state.puesto.IdSector }),
                apiCall("ObtenerAusentes", { idSector: state.puesto.IdSector })
            ]);
            renderColaEspera(cola || []);
            renderColaAusentes(ausentes || []);
        } catch (err) {
            console.error("Error al sincronizar lista de turnos:", err);
        }
    };

    // Llamar Siguiente: arranca el cronometro automaticamente
    const handleLlamarSiguiente = async () => {
        if (!state.puesto || state.isSubmitting) return;

        state.isSubmitting = true;
        try {
            const turno = await apiCall("LlamarSiguiente", {
                idPuesto: state.puesto.IdPuesto,
                idSector: state.puesto.IdSector
            });

            if (turno) {
                renderTurnoActual(turno);
                showToast(`Turno ${turno.CodigoTicket} convocado al puesto.`, "success");
                await handleFetchColaEspera();
            } else {
                showToast("No hay pacientes en espera en este momento.", "info");
                renderTurnoActual(null);
            }
        } catch (err) {
            showToast(`Error al convocar siguiente turno: ${err.message}`, "error");
        } finally {
            state.isSubmitting = false;
        }
    };

    // Re-llamar: reitera el llamado en pantalla y audio de carteleria
    const handleRellamar = async () => {
        if (!state.turno || state.isSubmitting) return;

        state.isSubmitting = true;
        try {
            const ok = await apiCall("Rellamar", { idTurno: state.turno.IdTurno });
            if (ok) {
                showToast(`Re-llamado emitido para el turno ${state.turno.CodigoTicket}.`, "info");
            } else {
                showToast("No fue posible reiterar el llamado.", "error");
            }
        } catch (err) {
            showToast(`Error al re-llamar: ${err.message}`, "error");
        } finally {
            state.isSubmitting = false;
        }
    };

    // Marcar Ausente: deja el box libre para llamada explicita del operador
    const handleMarcarAusente = async () => {
        if (!state.turno || state.isSubmitting) return;

        state.isSubmitting = true;
        const codigo = state.turno.CodigoTicket;

        try {
            const ok = await apiCall("MarcarAusente", { idTurno: state.turno.IdTurno });
            if (ok) {
                showToast(`Turno ${codigo} marcado como ausente y enviado a la cola de ausentes.`, "info");
                renderTurnoActual(null);
                await handleFetchColaEspera();
            } else {
                showToast("No se pudo marcar el turno como ausente.", "error");
            }
        } catch (err) {
            showToast(`Error al marcar ausente: ${err.message}`, "error");
        } finally {
            state.isSubmitting = false;
        }
    };

    // Reincorporar Ausente a la cola con prioridad
    const handleReactivarAusente = async (idTurno) => {
        if (!idTurno || state.isSubmitting) return;

        state.isSubmitting = true;
        try {
            const ok = await apiCall("ReactivarAusente", { idTurno });
            if (ok) {
                showToast("Turno reincorporado a la cola de espera con prioridad.", "success");
                await handleFetchColaEspera();
            } else {
                showToast("No fue posible reincorporar el turno.", "error");
            }
        } catch (err) {
            showToast(`Error al reincorporar turno: ${err.message}`, "error");
        } finally {
            state.isSubmitting = false;
        }
    };

    // Finalizar Atencion
    const handleFinalizar = async () => {
        if (!state.turno || state.isSubmitting) return;

        state.isSubmitting = true;
        const codigo = state.turno.CodigoTicket;

        try {
            const ok = await apiCall("Finalizar", { idTurno: state.turno.IdTurno });
            if (ok) {
                showToast(`Turno ${codigo} finalizado correctamente.`, "success");
                renderTurnoActual(null);
                await handleFetchColaEspera();
            } else {
                showToast("No se pudo finalizar la atención.", "error");
            }
        } catch (err) {
            showToast(`Error al finalizar turno: ${err.message}`, "error");
        } finally {
            state.isSubmitting = false;
        }
    };

    // Modal de Derivacion
    const handleOpenModalDerivacion = () => {
        if (!state.turno) return;
        renderComboSectores();
        if (dom.chkPrioridad) dom.chkPrioridad.checked = true;
        if (dom.txtNotasDerivacion) dom.txtNotasDerivacion.value = "";
        if (dom.modalDerivacion) dom.modalDerivacion.classList.add("modal-abierto");
    };

    const handleCloseModalDerivacion = () => {
        if (dom.modalDerivacion) dom.modalDerivacion.classList.remove("modal-abierto");
    };

    const handleConfirmarDerivacion = async () => {
        if (!state.turno || state.isSubmitting) return;

        const idSectorDestino = parseInt(dom.cboSectorDestino.value, 10);
        if (!idSectorDestino || idSectorDestino <= 0) {
            showToast("Seleccione el sector de destino.", "error");
            return;
        }

        const esPrioritario = dom.chkPrioridad?.checked ?? true;
        const observaciones = dom.txtNotasDerivacion?.value ?? "";

        state.isSubmitting = true;

        try {
            const ok = await apiCall("Derivar", {
                idTurno: state.turno.IdTurno,
                idSectorDestino,
                esPrioritario,
                observaciones
            });

            handleCloseModalDerivacion();

            if (ok) {
                showToast("Turno derivado exitosamente.", "success");
                renderTurnoActual(null);
                await handleFetchColaEspera();
            } else {
                showToast("No se pudo derivar el turno.", "error");
            }
        } catch (err) {
            showToast(`Error al derivar: ${err.message}`, "error");
        } finally {
            state.isSubmitting = false;
        }
    };

    // =========================================================================
    // 8. INICIALIZACION
    // =========================================================================
    const initEventListeners = () => {
        dom.btnLlamar?.addEventListener("click", handleLlamarSiguiente);
        dom.btnRellamar?.addEventListener("click", handleRellamar);
        dom.btnFinalizar?.addEventListener("click", handleFinalizar);
        dom.btnAusente?.addEventListener("click", handleMarcarAusente);
        dom.btnDerivar?.addEventListener("click", handleOpenModalDerivacion);

        dom.tabColaEspera?.addEventListener("click", () => setTabActiva("ESPERA"));
        dom.tabColaAusentes?.addEventListener("click", () => setTabActiva("AUSENTES"));

        dom.btnCerrarModal?.addEventListener("click", handleCloseModalDerivacion);
        dom.btnCancelarModal?.addEventListener("click", handleCloseModalDerivacion);
        dom.btnConfirmarDerivar?.addEventListener("click", handleConfirmarDerivacion);

        dom.btnRefrescarCola?.addEventListener("click", handleFetchColaEspera);
    };

    const init = async () => {
        try {
            initEventListeners();

            // 1. Obtiene datos del box asignado al operador
            const puesto = await apiCall("ObtenerBoxOperador");
            if (!puesto) {
                showToast("No tiene un puesto de atención asignado o activo.", "error");
                if (dom.boxNombre) dom.boxNombre.textContent = "Sin asignación";
                renderActionButtons(false);
                return;
            }

            state.puesto = puesto;
            renderPuestoHeader();

            // 2. Carga turno activo inicial (si lo hubiere)
            await handleFetchTurnoActual();

            // 3. Carga colas de espera y ausentes e inicia polling (cada 5 segundos)
            await handleFetchColaEspera();
            state.pollingInterval = setInterval(handleFetchColaEspera, 5000);

            // 4. Precargar lista de sectores para derivaciones
            state.sectores = (await apiCall("ObtenerSectores")) || [];
        } catch (err) {
            showToast(`Error de inicialización: ${err.message}`, "error");
        }
    };

    // Ejecuta al montar el DOM
    document.addEventListener("DOMContentLoaded", init);
})();
