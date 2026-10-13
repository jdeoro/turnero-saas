/**
 * Módulo de Administración y Configuración (Configuracion.aspx)
 * Gestión dinámica por pestañas de Sectores, Puestos y Usuarios.
 */

(() => {
    "use strict";

    // =========================================================================
    // 1. ESTADO DE LA CONSOLA (State)
    // =========================================================================
    const state = {
        sectores: [],
        puestos: [],
        usuarios: [],
        roles: [],
        activeTab: "tabSectores",
        paginaSectores: 1,
        paginaPuestos: 1,
        paginaUsuarios: 1,
        pageSize: 10
    };

    // =========================================================================
    // 2. REFERENCIAS AL DOM
    // =========================================================================
    const dom = {
        // Pestañas
        tabBtns: document.querySelectorAll(".tab-btn"),
        tabPanes: document.querySelectorAll(".config-tab-pane"),
        badgeCountSectores: document.getElementById("badgeCountSectores"),
        badgeCountPuestos: document.getElementById("badgeCountPuestos"),
        badgeCountUsuarios: document.getElementById("badgeCountUsuarios"),

        // Tablas
        tbodySectores: document.getElementById("tbodySectores"),
        tbodyPuestos: document.getElementById("tbodyPuestos"),
        tbodyUsuarios: document.getElementById("tbodyUsuarios"),

        // Paginación
        paginacionSectores: document.getElementById("paginacionSectores"),
        paginacionPuestos: document.getElementById("paginacionPuestos"),
        paginacionUsuarios: document.getElementById("paginacionUsuarios"),

        // Filtros
        filtroSectores: document.getElementById("filtroSectores"),
        filtroPuestos: document.getElementById("filtroPuestos"),
        filtroUsuarios: document.getElementById("filtroUsuarios"),

        // Botones de Alta
        btnNuevoSector: document.getElementById("btnNuevoSector"),
        btnNuevoPuesto: document.getElementById("btnNuevoPuesto"),
        btnNuevoUsuario: document.getElementById("btnNuevoUsuario"),

        // Modal Sector
        modalSectorOverlay: document.getElementById("modalSectorOverlay"),
        lblTituloModalSector: document.getElementById("lblTituloModalSector"),
        btnCerrarModalSector: document.getElementById("btnCerrarModalSector"),
        btnCancelarSector: document.getElementById("btnCancelarSector"),
        btnGuardarSector: document.getElementById("btnGuardarSector"),
        secId: document.getElementById("secId"),
        secDescripcion: document.getElementById("secDescripcion"),
        secPiso: document.getElementById("secPiso"),
        secLetra: document.getElementById("secLetra"),
        secTiempo: document.getElementById("secTiempo"),
        secActivo: document.getElementById("secActivo"),

        // Modal Puesto
        modalPuestoOverlay: document.getElementById("modalPuestoOverlay"),
        lblTituloModalPuesto: document.getElementById("lblTituloModalPuesto"),
        btnCerrarModalPuesto: document.getElementById("btnCerrarModalPuesto"),
        btnCancelarPuesto: document.getElementById("btnCancelarPuesto"),
        btnGuardarPuesto: document.getElementById("btnGuardarPuesto"),
        puestoId: document.getElementById("puestoId"),
        puestoDescripcion: document.getElementById("puestoDescripcion"),
        puestoIdSector: document.getElementById("puestoIdSector"),
        puestoIdOperador: document.getElementById("puestoIdOperador"),
        puestoActivo: document.getElementById("puestoActivo"),

        // Modal Usuario
        modalUsuarioOverlay: document.getElementById("modalUsuarioOverlay"),
        lblTituloModalUsuario: document.getElementById("lblTituloModalUsuario"),
        btnCerrarModalUsuario: document.getElementById("btnCerrarModalUsuario"),
        btnCancelarUsuario: document.getElementById("btnCancelarUsuario"),
        btnGuardarUsuario: document.getElementById("btnGuardarUsuario"),
        usrId: document.getElementById("usrId"),
        usrDni: document.getElementById("usrDni"),
        usrNombre: document.getElementById("usrNombre"),
        usrEmail: document.getElementById("usrEmail"),
        usrClave: document.getElementById("usrClave"),
        usrRolId: document.getElementById("usrRolId"),
        usrEstado: document.getElementById("usrEstado"),
        lblClaveUsuario: document.getElementById("lblClaveUsuario"),
        hintClaveUsuario: document.getElementById("hintClaveUsuario"),

        // Toast
        toastContainer: document.getElementById("toastContainer")
    };

    // =========================================================================
    // 3. UTILIDADES Y NOTIFICACIONES
    // =========================================================================
    const escapeHtml = (str) => {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const showToast = (mensaje, tipo = "success") => {
        if (!dom.toastContainer) return;
        const toast = document.createElement("div");
        toast.className = `toast-item ${tipo}`;
        toast.innerHTML = `<span>${escapeHtml(mensaje)}</span>`;
        dom.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transition = "opacity 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    };

    const callApi = async (methodName, data = {}) => {
        try {
            const response = await fetch(`Configuracion.aspx/${methodName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Error en el servidor (${response.status})`);
            }

            const json = await response.json();
            return json.d;
        } catch (err) {
            console.error(`Error en llamada a ${methodName}:`, err);
            showToast(err.message || "Error al procesar la solicitud", "error");
            return null;
        }
    };

    // =========================================================================
    // 4. PESTAÑAS (TABS)
    // =========================================================================
    const initTabs = () => {
        dom.tabBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const targetTab = btn.getAttribute("data-tab");
                state.activeTab = targetTab;

                dom.tabBtns.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                dom.tabPanes.forEach((p) => {
                    if (p.id === targetTab) {
                        p.classList.add("active");
                    } else {
                        p.classList.remove("active");
                    }
                });
            });
        });
    };

    const actualizarContadores = () => {
        if (dom.badgeCountSectores) dom.badgeCountSectores.textContent = state.sectores.length;
        if (dom.badgeCountPuestos) dom.badgeCountPuestos.textContent = state.puestos.length;
        if (dom.badgeCountUsuarios) dom.badgeCountUsuarios.textContent = state.usuarios.length;
    };

    // =========================================================================
    // 5. COMPONENTE DE PAGINACIÓN MINIMALISTA
    // =========================================================================
    const renderPaginacion = (containerEl, totalItems, paginaActual, onPageChange) => {
        if (!containerEl) return;
        const totalPaginas = Math.ceil(totalItems / state.pageSize) || 1;

        if (totalItems === 0) {
            containerEl.innerHTML = "";
            return;
        }

        const desde = (paginaActual - 1) * state.pageSize + 1;
        const hasta = Math.min(paginaActual * state.pageSize, totalItems);

        let botonesPaginas = "";
        for (let i = 1; i <= totalPaginas; i++) {
            botonesPaginas += `
                <button type="button" class="page-btn ${i === paginaActual ? "active" : ""}" data-page="${i}">
                    ${i}
                </button>
            `;
        }

        containerEl.innerHTML = `
            <div class="pagination-info">
                Mostrando <strong>${desde} - ${hasta}</strong> de <strong>${totalItems}</strong> registros
            </div>
            <div class="pagination-controls">
                <button type="button" class="page-btn nav-btn" data-page="${paginaActual - 1}" ${paginaActual <= 1 ? "disabled" : ""}>
                    ‹ Anterior
                </button>
                ${botonesPaginas}
                <button type="button" class="page-btn nav-btn" data-page="${paginaActual + 1}" ${paginaActual >= totalPaginas ? "disabled" : ""}>
                    Siguiente ›
                </button>
            </div>
        `;

        containerEl.querySelectorAll(".page-btn:not([disabled])").forEach((btn) => {
            btn.addEventListener("click", () => {
                const targetPage = parseInt(btn.getAttribute("data-page"), 10);
                if (targetPage && targetPage !== paginaActual && targetPage >= 1 && targetPage <= totalPaginas) {
                    onPageChange(targetPage);
                }
            });
        });
    };

    // =========================================================================
    // 6. RENDERIZADO DE TABLAS
    // =========================================================================

    // --- Tab 1: Sectores ---
    const renderSectores = () => {
        if (!dom.tbodySectores) return;
        const q = (dom.filtroSectores?.value || "").trim().toLowerCase();

        const filtrados = state.sectores.filter((s) => {
            if (!q) return true;
            return (
                (s.Descripcion || "").toLowerCase().includes(q) ||
                (s.Piso || "").toLowerCase().includes(q) ||
                (s.LetraTicket || "").toLowerCase().includes(q)
            );
        });

        const totalPaginas = Math.ceil(filtrados.length / state.pageSize) || 1;
        if (state.paginaSectores > totalPaginas) state.paginaSectores = totalPaginas;

        if (filtrados.length === 0) {
            dom.tbodySectores.innerHTML = `
                <tr><td colspan="7" class="table-empty">No se encontraron sectores registrados o coincidentes.</td></tr>
            `;
            renderPaginacion(dom.paginacionSectores, 0, 1, () => {});
            return;
        }

        const inicio = (state.paginaSectores - 1) * state.pageSize;
        const paginaItems = filtrados.slice(inicio, inicio + state.pageSize);

        dom.tbodySectores.innerHTML = paginaItems.map((s) => {
            const badgeActivo = s.Activo
                ? `<span class="badge-status activo">● Activo</span>`
                : `<span class="badge-status inactivo">○ Inactivo</span>`;

            return `
                <tr>
                    <td><strong>#${s.IdSector}</strong></td>
                    <td><strong>${escapeHtml(s.Descripcion)}</strong></td>
                    <td>${escapeHtml(s.Piso)}</td>
                    <td style="text-align: center;"><span class="badge-letra">${escapeHtml(s.LetraTicket)}</span></td>
                    <td style="text-align: center;">${s.TiempoEstimado || 10} min</td>
                    <td style="text-align: center;">${badgeActivo}</td>
                    <td style="text-align: right;">
                        <div class="table-actions">
                            <button type="button" class="btn-table-icon" title="Editar Sector" onclick="window.__abm.editarSector(${s.IdSector})">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button type="button" class="btn-table-icon ${s.Activo ? "btn-toggle-active" : "btn-toggle-inactive"}" 
                                    title="${s.Activo ? "Desactivar Sector" : "Activar Sector"}" onclick="window.__abm.toggleSector(${s.IdSector})">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                    <line x1="12" y1="2" x2="12" y2="12" />
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        renderPaginacion(dom.paginacionSectores, filtrados.length, state.paginaSectores, (nuevaPag) => {
            state.paginaSectores = nuevaPag;
            renderSectores();
        });
    };

    // --- Tab 2: Puestos ---
    const renderPuestos = () => {
        if (!dom.tbodyPuestos) return;
        const q = (dom.filtroPuestos?.value || "").trim().toLowerCase();

        const filtrados = state.puestos.filter((p) => {
            if (!q) return true;
            return (
                (p.Descripcion || "").toLowerCase().includes(q) ||
                (p.SectorDescripcion || "").toLowerCase().includes(q) ||
                (p.OperadorNombre || "").toLowerCase().includes(q)
            );
        });

        const totalPaginas = Math.ceil(filtrados.length / state.pageSize) || 1;
        if (state.paginaPuestos > totalPaginas) state.paginaPuestos = totalPaginas;

        if (filtrados.length === 0) {
            dom.tbodyPuestos.innerHTML = `
                <tr><td colspan="6" class="table-empty">No se encontraron puestos registrados o coincidentes.</td></tr>
            `;
            renderPaginacion(dom.paginacionPuestos, 0, 1, () => {});
            return;
        }

        const inicio = (state.paginaPuestos - 1) * state.pageSize;
        const paginaItems = filtrados.slice(inicio, inicio + state.pageSize);

        dom.tbodyPuestos.innerHTML = paginaItems.map((p) => {
            const badgeActivo = p.Activo
                ? `<span class="badge-status activo">● Activo</span>`
                : `<span class="badge-status inactivo">○ Inactivo</span>`;

            const op = p.OperadorNombre
                ? `<strong>${escapeHtml(p.OperadorNombre)}</strong>`
                : `<span style="color: #94A3B8; font-style: italic;">Sin asignar</span>`;

            return `
                <tr>
                    <td><strong>#${p.IdPuesto}</strong></td>
                    <td><strong>${escapeHtml(p.Descripcion)}</strong></td>
                    <td>${escapeHtml(p.SectorDescripcion)} <small style="color: #64748B;">(${escapeHtml(p.Piso)})</small></td>
                    <td>${op}</td>
                    <td style="text-align: center;">${badgeActivo}</td>
                    <td style="text-align: right;">
                        <div class="table-actions">
                            <button type="button" class="btn-table-icon" title="Editar Puesto" onclick="window.__abm.editarPuesto(${p.IdPuesto})">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button type="button" class="btn-table-icon ${p.Activo ? "btn-toggle-active" : "btn-toggle-inactive"}" 
                                    title="${p.Activo ? "Desactivar Puesto" : "Activar Puesto"}" onclick="window.__abm.togglePuesto(${p.IdPuesto})">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                    <line x1="12" y1="2" x2="12" y2="12" />
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        renderPaginacion(dom.paginacionPuestos, filtrados.length, state.paginaPuestos, (nuevaPag) => {
            state.paginaPuestos = nuevaPag;
            renderPuestos();
        });
    };

    // --- Tab 3: Usuarios ---
    const renderUsuarios = () => {
        if (!dom.tbodyUsuarios) return;
        const q = (dom.filtroUsuarios?.value || "").trim().toLowerCase();

        const filtrados = state.usuarios.filter((u) => {
            if (!q) return true;
            return (
                (u.Dni || "").toLowerCase().includes(q) ||
                (u.Nombre || "").toLowerCase().includes(q) ||
                (u.Email || "").toLowerCase().includes(q) ||
                (u.RolNombre || "").toLowerCase().includes(q) ||
                (u.SectorNombre || "").toLowerCase().includes(q) ||
                (u.PuestoNombre || "").toLowerCase().includes(q)
            );
        });

        const totalPaginas = Math.ceil(filtrados.length / state.pageSize) || 1;
        if (state.paginaUsuarios > totalPaginas) state.paginaUsuarios = totalPaginas;

        if (filtrados.length === 0) {
            dom.tbodyUsuarios.innerHTML = `
                <tr><td colspan="8" class="table-empty">No se encontraron usuarios registrados o coincidentes.</td></tr>
            `;
            renderPaginacion(dom.paginacionUsuarios, 0, 1, () => {});
            return;
        }

        const inicio = (state.paginaUsuarios - 1) * state.pageSize;
        const paginaItems = filtrados.slice(inicio, inicio + state.pageSize);

        dom.tbodyUsuarios.innerHTML = paginaItems.map((u) => {
            const badgeEstado = u.Estado
                ? `<span class="badge-status activo">● Activo</span>`
                : `<span class="badge-status inactivo">○ Inactivo</span>`;

            let claseRol = "operador";
            const rolNorm = (u.RolNombre || "").toLowerCase();
            if (rolNorm.includes("admin")) claseRol = "admin";
            else if (rolNorm.includes("supervisor")) claseRol = "supervisor";

            let asignacionHtml = `<span style="color: #94A3B8; font-style: italic;">Sin asignar</span>`;
            if (u.RolNombre === "Supervisor" || u.RolNombre === "Administrador") {
                asignacionHtml = `<span style="color: #94A3B8;">-</span>`;
            } else if (u.SectorNombre) {
                asignacionHtml = `<strong>${escapeHtml(u.SectorNombre)}</strong> <small style="color: #64748B;">(${escapeHtml(u.PuestoNombre || "Puesto")})</small>`;
            }

            return `
                <tr>
                    <td><strong>#${u.Id}</strong></td>
                    <td><code>${escapeHtml(u.Dni)}</code></td>
                    <td><strong>${escapeHtml(u.Nombre)}</strong></td>
                    <td>${u.Email ? escapeHtml(u.Email) : `<span style="color: #94A3B8;">-</span>`}</td>
                    <td style="text-align: center;"><span class="badge-role ${claseRol}">${escapeHtml(u.RolNombre)}</span></td>
                    <td>${asignacionHtml}</td>
                    <td style="text-align: center;">${badgeEstado}</td>
                    <td style="text-align: right;">
                        <div class="table-actions">
                            <button type="button" class="btn-table-icon" title="Editar Usuario" onclick="window.__abm.editarUsuario(${u.Id})">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                            </button>
                            <button type="button" class="btn-table-icon ${u.Estado ? "btn-toggle-active" : "btn-toggle-inactive"}" 
                                    title="${u.Estado ? "Desactivar Usuario" : "Activar Usuario"}" onclick="window.__abm.toggleUsuario(${u.Id})">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                    <line x1="12" y1="2" x2="12" y2="12" />
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        renderPaginacion(dom.paginacionUsuarios, filtrados.length, state.paginaUsuarios, (nuevaPag) => {
            state.paginaUsuarios = nuevaPag;
            renderUsuarios();
        });
    };

    // =========================================================================
    // 6. MODALES Y ACCIONES CRUD
    // =========================================================================

    // --- Modal Sector ---
    const abrirModalSector = (sector = null) => {
        if (!dom.modalSectorOverlay) return;
        if (sector) {
            dom.lblTituloModalSector.textContent = `Editar Sector: ${sector.Descripcion}`;
            dom.secId.value = sector.IdSector;
            dom.secDescripcion.value = sector.Descripcion || "";
            dom.secPiso.value = sector.Piso || "";
            dom.secLetra.value = sector.LetraTicket || "";
            dom.secTiempo.value = sector.TiempoEstimado || 10;
            dom.secActivo.checked = !!sector.Activo;
        } else {
            dom.lblTituloModalSector.textContent = "Nuevo Sector";
            dom.secId.value = "0";
            dom.secDescripcion.value = "";
            dom.secPiso.value = "Planta Baja";
            dom.secLetra.value = "";
            dom.secTiempo.value = "10";
            dom.secActivo.checked = true;
        }
        dom.modalSectorOverlay.style.display = "flex";
        setTimeout(() => dom.secDescripcion.focus(), 50);
    };

    const cerrarModalSector = () => {
        if (dom.modalSectorOverlay) dom.modalSectorOverlay.style.display = "none";
    };

    const guardarSector = async () => {
        const idSector = parseInt(dom.secId.value, 10) || 0;
        const descripcion = (dom.secDescripcion.value || "").trim();
        const piso = (dom.secPiso.value || "").trim();
        const letraTicket = (dom.secLetra.value || "").trim().toUpperCase();
        const tiempoEstimado = parseInt(dom.secTiempo.value, 10) || 10;
        const secExistente = state.sectores.find((s) => s.IdSector === idSector);
        const pausado = secExistente ? !!secExistente.Pausado : false;
        const activo = dom.secActivo.checked;

        if (!descripcion) {
            alert("Por favor ingrese el nombre del sector.");
            dom.secDescripcion.focus();
            return;
        }
        if (!piso) {
            alert("Por favor ingrese la ubicación o piso.");
            dom.secPiso.focus();
            return;
        }
        if (!letraTicket) {
            alert("Por favor ingrese la letra del ticket.");
            dom.secLetra.focus();
            return;
        }

        const res = await callApi("GuardarSector", {
            idSector,
            descripcion,
            piso,
            letraTicket,
            tiempoEstimado,
            pausado,
            activo
        });

        if (res && res.ok) {
            showToast(res.mensaje || "Sector guardado.", "success");
            cerrarModalSector();
            await recargarDatos();
        } else if (res) {
            showToast(res.mensaje || "Error al guardar el sector", "error");
        }
    };

    const toggleSector = async (idSector) => {
        const sec = state.sectores.find((s) => s.IdSector === idSector);
        if (!sec) return;
        const accion = sec.Activo ? "desactivar" : "activar";
        if (!confirm(`¿Confirma que desea ${accion} el sector "${sec.Descripcion}"?`)) return;

        const res = await callApi("ToggleSector", { idSector });
        if (res && res.ok) {
            showToast(res.mensaje || "Estado actualizado.", "success");
            await recargarDatos();
        }
    };

    // --- Modal Puesto ---
    const poblarSelectoresPuesto = (selectedSectorId = 0, selectedOperadorId = 0) => {
        // Sector select
        if (dom.puestoIdSector) {
            dom.puestoIdSector.innerHTML = `
                <option value="">-- Seleccione un sector --</option>
                ${state.sectores.map((s) => `
                    <option value="${s.IdSector}" ${s.IdSector === selectedSectorId ? "selected" : ""}>
                        ${escapeHtml(s.Descripcion)} (${escapeHtml(s.Piso)})
                    </option>
                `).join("")}
            `;
        }

        // Operador select
        if (dom.puestoIdOperador) {
            dom.puestoIdOperador.innerHTML = `
                <option value="0">-- Sin asignar (Libre para cualquier operador) --</option>
                ${state.usuarios.map((u) => `
                    <option value="${u.Id}" ${u.Id === selectedOperadorId ? "selected" : ""}>
                        ${escapeHtml(u.Nombre)} (DNI: ${escapeHtml(u.Dni)})
                    </option>
                `).join("")}
            `;
        }
    };

    const abrirModalPuesto = (puesto = null) => {
        if (!dom.modalPuestoOverlay) return;
        if (puesto) {
            dom.lblTituloModalPuesto.textContent = `Editar Puesto: ${puesto.Descripcion}`;
            dom.puestoId.value = puesto.IdPuesto;
            dom.puestoDescripcion.value = puesto.Descripcion || "";
            poblarSelectoresPuesto(puesto.IdSector, puesto.IdUsuarioOperador || 0);
            dom.puestoActivo.checked = !!puesto.Activo;
        } else {
            dom.lblTituloModalPuesto.textContent = "Nuevo Puesto / Box";
            dom.puestoId.value = "0";
            dom.puestoDescripcion.value = "";
            poblarSelectoresPuesto(0, 0);
            dom.puestoActivo.checked = true;
        }
        dom.modalPuestoOverlay.style.display = "flex";
        setTimeout(() => dom.puestoDescripcion.focus(), 50);
    };

    const cerrarModalPuesto = () => {
        if (dom.modalPuestoOverlay) dom.modalPuestoOverlay.style.display = "none";
    };

    const guardarPuesto = async () => {
        const idPuesto = parseInt(dom.puestoId.value, 10) || 0;
        const descripcion = (dom.puestoDescripcion.value || "").trim();
        const idSector = parseInt(dom.puestoIdSector.value, 10) || 0;
        const idUsuarioOperador = parseInt(dom.puestoIdOperador.value, 10) || 0;
        const activo = dom.puestoActivo.checked;

        if (!descripcion) {
            alert("Por favor ingrese el nombre del puesto/box.");
            dom.puestoDescripcion.focus();
            return;
        }
        if (idSector <= 0) {
            alert("Por favor seleccione un sector para el puesto.");
            dom.puestoIdSector.focus();
            return;
        }

        const res = await callApi("GuardarPuesto", {
            idPuesto,
            descripcion,
            idSector,
            idUsuarioOperador: idUsuarioOperador > 0 ? idUsuarioOperador : null,
            activo
        });

        if (res && res.ok) {
            showToast(res.mensaje || "Puesto guardado.", "success");
            cerrarModalPuesto();
            await recargarDatos();
        } else if (res) {
            showToast(res.mensaje || "Error al guardar el puesto", "error");
        }
    };

    const togglePuesto = async (idPuesto) => {
        const puesto = state.puestos.find((p) => p.IdPuesto === idPuesto);
        if (!puesto) return;
        const accion = puesto.Activo ? "desactivar" : "activar";
        if (!confirm(`¿Confirma que desea ${accion} el puesto "${puesto.Descripcion}"?`)) return;

        const res = await callApi("TogglePuesto", { idPuesto });
        if (res && res.ok) {
            showToast(res.mensaje || "Estado actualizado.", "success");
            await recargarDatos();
        }
    };

    // --- Modal Usuario ---
    const poblarRolesUsuario = (selectedRolId = 0) => {
        if (!dom.usrRolId) return;
        dom.usrRolId.innerHTML = `
            <option value="">-- Seleccione un rol --</option>
            ${state.roles.map((r) => `
                <option value="${r.Id}" ${r.Id === selectedRolId ? "selected" : ""}>
                    ${escapeHtml(r.Nombre)}
                </option>
            `).join("")}
        `;
    };

    const abrirModalUsuario = (usuario = null) => {
        if (!dom.modalUsuarioOverlay) return;
        if (usuario) {
            dom.lblTituloModalUsuario.textContent = `Editar Usuario: ${usuario.Nombre}`;
            dom.usrId.value = usuario.Id;
            dom.usrDni.value = usuario.Dni || "";
            dom.usrNombre.value = usuario.Nombre || "";
            dom.usrEmail.value = usuario.Email || "";
            dom.usrClave.value = "";
            dom.usrClave.placeholder = "Dejar en blanco para mantener la contraseña actual";
            if (dom.hintClaveUsuario) {
                dom.hintClaveUsuario.textContent = "Ingrese una nueva contraseña únicamente si desea modificarla.";
            }
            poblarRolesUsuario(usuario.RolId);
            dom.usrEstado.checked = !!usuario.Estado;
        } else {
            dom.lblTituloModalUsuario.textContent = "Nuevo Usuario";
            dom.usrId.value = "0";
            dom.usrDni.value = "";
            dom.usrNombre.value = "";
            dom.usrEmail.value = "";
            dom.usrClave.value = "";
            dom.usrClave.placeholder = "Ingrese contraseña para el nuevo usuario";
            if (dom.hintClaveUsuario) {
                dom.hintClaveUsuario.textContent = "Contraseña para inicio de sesión en el sistema.";
            }
            poblarRolesUsuario(0);
            dom.usrEstado.checked = true;
        }
        dom.modalUsuarioOverlay.style.display = "flex";
        setTimeout(() => dom.usrDni.focus(), 50);
    };

    const cerrarModalUsuario = () => {
        if (dom.modalUsuarioOverlay) dom.modalUsuarioOverlay.style.display = "none";
    };

    const guardarUsuario = async () => {
        const idUsuario = parseInt(dom.usrId.value, 10) || 0;
        const dni = (dom.usrDni.value || "").trim().replace(/\./g, "").replace(/ /g, "");
        const nombre = (dom.usrNombre.value || "").trim();
        const email = (dom.usrEmail.value || "").trim();
        const clave = (dom.usrClave.value || "").trim();
        const rolId = parseInt(dom.usrRolId.value, 10) || 0;
        const estado = dom.usrEstado.checked;

        if (!dni) {
            alert("Por favor ingrese el número de documento (DNI).");
            dom.usrDni.focus();
            return;
        }
        if (!nombre) {
            alert("Por favor ingrese el nombre y apellido del usuario.");
            dom.usrNombre.focus();
            return;
        }
        if (rolId <= 0) {
            alert("Por favor seleccione un rol para el usuario.");
            dom.usrRolId.focus();
            return;
        }
        if (idUsuario === 0 && !clave) {
            alert("La contraseña es obligatoria para nuevos usuarios.");
            dom.usrClave.focus();
            return;
        }

        const res = await callApi("GuardarUsuario", {
            idUsuario,
            nombre,
            dni,
            clave,
            email,
            rolId,
            estado
        });

        if (res && res.ok) {
            showToast(res.mensaje || "Usuario guardado.", "success");
            cerrarModalUsuario();
            await recargarDatos();
        } else if (res) {
            showToast(res.mensaje || "Error al guardar el usuario", "error");
        }
    };

    const toggleUsuario = async (idUsuario) => {
        const usr = state.usuarios.find((u) => u.Id === idUsuario);
        if (!usr) return;
        const accion = usr.Estado ? "desactivar" : "activar";
        if (!confirm(`¿Confirma que desea ${accion} el acceso de "${usr.Nombre}"?`)) return;

        const res = await callApi("ToggleUsuario", { idUsuario });
        if (res && res.ok) {
            showToast(res.mensaje || "Estado de usuario actualizado.", "success");
            await recargarDatos();
        }
    };

    // =========================================================================
    // 7. CARGA DE DATOS Y EVENTOS
    // =========================================================================
    const recargarDatos = async () => {
        const data = await callApi("ObtenerDatosIniciales", {});
        if (!data || !data.ok) return;

        state.sectores = data.sectores || [];
        state.puestos = data.puestos || [];
        state.usuarios = data.usuarios || [];
        state.roles = data.roles || [];

        actualizarContadores();
        renderSectores();
        renderPuestos();
        renderUsuarios();
    };

    const initEventListeners = () => {
        // Filtros en vivo (reinician a página 1)
        dom.filtroSectores?.addEventListener("input", () => {
            state.paginaSectores = 1;
            renderSectores();
        });
        dom.filtroPuestos?.addEventListener("input", () => {
            state.paginaPuestos = 1;
            renderPuestos();
        });
        dom.filtroUsuarios?.addEventListener("input", () => {
            state.paginaUsuarios = 1;
            renderUsuarios();
        });

        // Botones de alta
        dom.btnNuevoSector?.addEventListener("click", () => abrirModalSector(null));
        dom.btnNuevoPuesto?.addEventListener("click", () => abrirModalPuesto(null));
        dom.btnNuevoUsuario?.addEventListener("click", () => abrirModalUsuario(null));

        // Cerrar modales por boton o cruz
        dom.btnCerrarModalSector?.addEventListener("click", cerrarModalSector);
        dom.btnCancelarSector?.addEventListener("click", cerrarModalSector);
        dom.btnGuardarSector?.addEventListener("click", guardarSector);

        dom.btnCerrarModalPuesto?.addEventListener("click", cerrarModalPuesto);
        dom.btnCancelarPuesto?.addEventListener("click", cerrarModalPuesto);
        dom.btnGuardarPuesto?.addEventListener("click", guardarPuesto);

        dom.btnCerrarModalUsuario?.addEventListener("click", cerrarModalUsuario);
        dom.btnCancelarUsuario?.addEventListener("click", cerrarModalUsuario);
        dom.btnGuardarUsuario?.addEventListener("click", guardarUsuario);

        // Cerrar haciendo clic fuera de la tarjeta
        [dom.modalSectorOverlay, dom.modalPuestoOverlay, dom.modalUsuarioOverlay].forEach((overlay) => {
            overlay?.addEventListener("click", (e) => {
                if (e.target === overlay) {
                    overlay.style.display = "none";
                }
            });
        });

        // Exponer handlers en window para llamadas desde botones generados dinamicamente
        window.__abm = {
            editarSector: (id) => {
                const s = state.sectores.find((item) => item.IdSector === id);
                if (s) abrirModalSector(s);
            },
            toggleSector,

            editarPuesto: (id) => {
                const p = state.puestos.find((item) => item.IdPuesto === id);
                if (p) abrirModalPuesto(p);
            },
            togglePuesto,

            editarUsuario: (id) => {
                const u = state.usuarios.find((item) => item.Id === id);
                if (u) abrirModalUsuario(u);
            },
            toggleUsuario
        };
    };

    // Inicializacion al cargar el DOM
    const init = () => {
        initTabs();
        initEventListeners();
        recargarDatos();
    };

    document.addEventListener("DOMContentLoaded", init);
})();
