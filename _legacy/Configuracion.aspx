<%@ Page Title="Configuración del Sistema" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="Configuracion.aspx.cs" Inherits="SeguimientoGestion.Web.Configuracion" %>

<asp:Content ID="ContentHead" ContentPlaceHolderID="HeadContent" runat="server">
    <link rel="stylesheet" href="<%= ResolveUrl("~/css/configuracion.css?v=" + DateTime.Now.Ticks) %>" />
</asp:Content>

<asp:Content ID="ContentMain" ContentPlaceHolderID="MainContent" runat="server">
    <div class="config-container">



        <%-- Navegacion por Pestañas (Tabs) --%>
        <div class="config-tabs-nav">
            <button type="button" class="tab-btn active" data-tab="tabSectores" id="btnTabSectores">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                    <line x1="9" y1="22" x2="9" y2="22.01" />
                    <line x1="15" y1="22" x2="15" y2="22.01" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="8" y1="10" x2="16" y2="10" />
                    <line x1="8" y1="14" x2="16" y2="14" />
                </svg>
                <span>Sectores</span>
                <span class="tab-counter" id="badgeCountSectores">0</span>
            </button>

            <button type="button" class="tab-btn" data-tab="tabPuestos" id="btnTabPuestos">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span>Puestos / Boxes</span>
                <span class="tab-counter" id="badgeCountPuestos">0</span>
            </button>

            <button type="button" class="tab-btn" data-tab="tabUsuarios" id="btnTabUsuarios">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Usuarios y Operadores</span>
                <span class="tab-counter" id="badgeCountUsuarios">0</span>
            </button>
        </div>

        <%-- =========================================================================
             PESTAÑA 1: SECTORES
             ========================================================================= --%>
        <div class="config-tab-pane active" id="tabSectores">
            <div class="config-pane-actions">
                <div class="search-box">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" id="filtroSectores" placeholder="Buscar por nombre, piso o letra..." />
                </div>
                <button type="button" class="btn-primary-action" id="btnNuevoSector">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Nuevo Sector</span>
                </button>
            </div>

            <div class="table-responsive-card">
                <table class="config-table" id="tablaSectores">
                    <thead>
                        <tr>
                            <th style="width: 70px;">ID</th>
                            <th>Descripción / Trámite</th>
                            <th>Ubicación / Piso</th>
                            <th style="width: 100px; text-align: center;">Letra</th>
                            <th style="width: 130px; text-align: center;">Tiempo Est.</th>
                            <th style="width: 110px; text-align: center;">Estado</th>
                            <th style="width: 120px; text-align: right;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tbodySectores">
                        <%-- Carga dinamica --%>
                    </tbody>
                </table>
                <div class="table-pagination-footer" id="paginacionSectores">
                    <span class="pagination-info" id="infoPaginacionSectores">Mostrando 0 de 0</span>
                    <div class="pagination-controls" id="controlesPaginacionSectores"></div>
                </div>
            </div>
        </div>

        <%-- =========================================================================
             PESTAÑA 2: PUESTOS / BOXES
             ========================================================================= --%>
        <div class="config-tab-pane" id="tabPuestos">
            <div class="config-pane-actions">
                <div class="search-box">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" id="filtroPuestos" placeholder="Buscar por box, sector u operador..." />
                </div>
                <button type="button" class="btn-primary-action" id="btnNuevoPuesto">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Nuevo Puesto / Box</span>
                </button>
            </div>

            <div class="table-responsive-card">
                <table class="config-table" id="tablaPuestos">
                    <thead>
                        <tr>
                            <th style="width: 70px;">ID</th>
                            <th>Nombre de Box / Puesto</th>
                            <th>Sector Asignado</th>
                            <th>Operador Predeterminado</th>
                            <th style="width: 120px; text-align: center;">Estado</th>
                            <th style="width: 120px; text-align: right;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyPuestos">
                        <%-- Carga dinamica --%>
                    </tbody>
                </table>
                <div class="table-pagination-footer" id="paginacionPuestos">
                    <span class="pagination-info" id="infoPaginacionPuestos">Mostrando 0 de 0</span>
                    <div class="pagination-controls" id="controlesPaginacionPuestos"></div>
                </div>
            </div>
        </div>

        <%-- =========================================================================
             PESTAÑA 3: USUARIOS Y OPERADORES
             ========================================================================= --%>
        <div class="config-tab-pane" id="tabUsuarios">
            <div class="config-pane-actions">
                <div class="search-box">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input type="text" id="filtroUsuarios" placeholder="Buscar por DNI, nombre, email, rol o sector..." />
                </div>
                <button type="button" class="btn-primary-action" id="btnNuevoUsuario">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            <div class="table-responsive-card">
                <table class="config-table" id="tablaUsuarios">
                    <thead>
                        <tr>
                            <th style="width: 70px;">ID</th>
                            <th>DNI / Documento</th>
                            <th>Nombre y Apellido</th>
                            <th>Correo Electrónico</th>
                            <th style="width: 130px; text-align: center;">Rol</th>
                            <th>Sector / Puesto Asignado</th>
                            <th style="width: 110px; text-align: center;">Estado</th>
                            <th style="width: 120px; text-align: right;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyUsuarios">
                        <%-- Carga dinamica --%>
                    </tbody>
                </table>
                <div class="table-pagination-footer" id="paginacionUsuarios">
                    <span class="pagination-info" id="infoPaginacionUsuarios">Mostrando 0 de 0</span>
                    <div class="pagination-controls" id="controlesPaginacionUsuarios"></div>
                </div>
            </div>
        </div>

    </div>

    <%-- =========================================================================
         MODALES DE EDICIÓN / ALTA
         ========================================================================= --%>

    <%-- Modal Sector --%>
    <div class="config-modal-overlay" id="modalSectorOverlay" style="display: none;">
        <div class="config-modal-card">
            <div class="modal-card-header">
                <h3 id="lblTituloModalSector">Nuevo Sector</h3>
                <button type="button" class="btn-close-modal" id="btnCerrarModalSector">&times;</button>
            </div>
            <form id="formSector" onsubmit="return false;">
                <input type="hidden" id="secId" value="0" />
                <div class="modal-card-body">
                    <div class="form-group">
                        <label for="secDescripcion">Nombre / Descripción del Sector <span class="req">*</span></label>
                        <input type="text" id="secDescripcion" class="form-control" placeholder="Ej: Afiliaciones, Contaduría..." required />
                    </div>

                    <div class="form-row-2">
                        <div class="form-group">
                            <label for="secPiso">Ubicación / Piso <span class="req">*</span></label>
                            <input type="text" id="secPiso" class="form-control" placeholder="Ej: Planta Baja, 1er Subsuelo, Piso 1..." required />
                        </div>
                        <div class="form-group">
                            <label for="secLetra">Letra del Ticket <span class="req">*</span></label>
                            <input type="text" id="secLetra" class="form-control" placeholder="Ej: A, R, M..." maxlength="2" style="text-transform: uppercase;" required />
                            <small class="form-hint">Prefijo que antecederá a los números emitidos.</small>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="secTiempo">Tiempo Estimado por Turno (Minutos)</label>
                        <input type="number" id="secTiempo" class="form-control" min="1" max="180" value="10" />
                    </div>

                    <div class="form-checkboxes">
                        <label class="custom-checkbox">
                            <input type="checkbox" id="secActivo" checked />
                            <span class="checkbox-mark"></span>
                            <span class="checkbox-label">Sector Activo (visible en Tótem y Cartelería)</span>
                        </label>
                    </div>
                </div>
                <div class="modal-card-footer">
                    <button type="button" class="btn-cancel" id="btnCancelarSector">Cancelar</button>
                    <button type="button" class="btn-submit" id="btnGuardarSector">Guardar Sector</button>
                </div>
            </form>
        </div>
    </div>

    <%-- Modal Puesto --%>
    <div class="config-modal-overlay" id="modalPuestoOverlay" style="display: none;">
        <div class="config-modal-card">
            <div class="modal-card-header">
                <h3 id="lblTituloModalPuesto">Nuevo Puesto / Box</h3>
                <button type="button" class="btn-close-modal" id="btnCerrarModalPuesto">&times;</button>
            </div>
            <form id="formPuesto" onsubmit="return false;">
                <input type="hidden" id="puestoId" value="0" />
                <div class="modal-card-body">
                    <div class="form-group">
                        <label for="puestoDescripcion">Nombre o Número de Box <span class="req">*</span></label>
                        <input type="text" id="puestoDescripcion" class="form-control" placeholder="Ej: Box 1, Box 2, Ventanilla 1..." required />
                    </div>

                    <div class="form-group">
                        <label for="puestoIdSector">Sector Asignado <span class="req">*</span></label>
                        <select id="puestoIdSector" class="form-control" required>
                            <option value="">Seleccione un sector...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="puestoIdOperador">Operador Predeterminado (Opcional)</label>
                        <select id="puestoIdOperador" class="form-control">
                            <option value="0">-- Sin asignar (Libre para cualquier operador) --</option>
                        </select>
                        <small class="form-hint">Permite asociar este puesto al usuario al iniciar su sesión.</small>
                    </div>

                    <div class="form-checkboxes">
                        <label class="custom-checkbox">
                            <input type="checkbox" id="puestoActivo" checked />
                            <span class="checkbox-mark"></span>
                            <span class="checkbox-label">Puesto Activo para atención</span>
                        </label>
                    </div>
                </div>
                <div class="modal-card-footer">
                    <button type="button" class="btn-cancel" id="btnCancelarPuesto">Cancelar</button>
                    <button type="button" class="btn-submit" id="btnGuardarPuesto">Guardar Puesto</button>
                </div>
            </form>
        </div>
    </div>

    <%-- Modal Usuario --%>
    <div class="config-modal-overlay" id="modalUsuarioOverlay" style="display: none;">
        <div class="config-modal-card">
            <div class="modal-card-header">
                <h3 id="lblTituloModalUsuario">Nuevo Usuario</h3>
                <button type="button" class="btn-close-modal" id="btnCerrarModalUsuario">&times;</button>
            </div>
            <form id="formUsuario" onsubmit="return false;">
                <input type="hidden" id="usrId" value="0" />
                <div class="modal-card-body">
                    <div class="form-row-2">
                        <div class="form-group">
                            <label for="usrDni">DNI / Número de Documento <span class="req">*</span></label>
                            <input type="text" id="usrDni" class="form-control" placeholder="Ej: 32123456" required />
                            <small class="form-hint">Usuario con el que iniciará sesión.</small>
                        </div>
                        <div class="form-group">
                            <label for="usrRolId">Rol en el Sistema <span class="req">*</span></label>
                            <select id="usrRolId" class="form-control" required>
                                <option value="">Seleccione un rol...</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="usrNombre">Nombre y Apellido Completo <span class="req">*</span></label>
                        <input type="text" id="usrNombre" class="form-control" placeholder="Ej: Juan Pérez" required />
                    </div>

                    <div class="form-group">
                        <label for="usrEmail">Correo Electrónico (Opcional)</label>
                        <input type="email" id="usrEmail" class="form-control" placeholder="correo@ejemplo.com" />
                    </div>

                    <div class="form-group">
                        <label for="usrClave" id="lblClaveUsuario">Contraseña <span class="req">*</span></label>
                        <input type="password" id="usrClave" class="form-control" placeholder="Ingrese contraseña" />
                        <small class="form-hint" id="hintClaveUsuario">Contraseña para inicio de sesión en el sistema.</small>
                    </div>

                    <div class="form-checkboxes">
                        <label class="custom-checkbox">
                            <input type="checkbox" id="usrEstado" checked />
                            <span class="checkbox-mark"></span>
                            <span class="checkbox-label">Usuario Activo (permite iniciar sesión)</span>
                        </label>
                    </div>
                </div>
                <div class="modal-card-footer">
                    <button type="button" class="btn-cancel" id="btnCancelarUsuario">Cancelar</button>
                    <button type="button" class="btn-submit" id="btnGuardarUsuario">Guardar Usuario</button>
                </div>
            </form>
        </div>
    </div>

    <%-- Toast Notifications --%>
    <div class="toast-stack" id="toastContainer"></div>

    <%-- Script de Logica de Cliente --%>
    <script src="<%= ResolveUrl("~/js/configuracion.js?v=" + DateTime.Now.Ticks) %>"></script>
</asp:Content>
