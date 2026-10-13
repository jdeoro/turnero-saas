<%@ Page Title="Panel del Operador" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="Operador.aspx.cs" Inherits="SeguimientoGestion.Web.Operador" %>

<asp:Content ID="HeadContent1" ContentPlaceHolderID="HeadContent" runat="server">
    <style>
        .operador-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        /* Banner de contexto del puesto */
        .box-context-card {
            background: #FFFFFF;
            border-radius: var(--radius-xl);
            padding: 1.5rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
            border: 1px solid #E2E8F0;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .box-info-group {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .box-badge {
            background: var(--color-primary-tint);
            color: var(--color-primary);
            border: 1px solid var(--color-primary);
            font-size: 1.25rem;
            font-weight: 700;
            padding: 0.5rem 1.25rem;
            border-radius: var(--radius-lg);
            letter-spacing: 0.5px;
        }

        .box-details {
            display: flex;
            flex-direction: column;
        }

        .box-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: #1A2B3C;
        }

        .box-meta {
            font-size: 0.875rem;
            color: #64748B;
        }

        .box-live-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #10B981;
            font-weight: 600;
            background: #ECFDF5;
            padding: 0.5rem 1rem;
            border-radius: var(--radius-full);
            border: 1px solid #A7F3D0;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            background-color: #10B981;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
            animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.15); }
        }

        /* Grid principal */
        .operador-grid {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 1.5rem;
            align-items: start;
        }

        @media (max-width: 992px) {
            .operador-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Tarjeta de Atencion Activa */
        .card-atencion {
            background: #FFFFFF;
            border-radius: var(--radius-xl);
            padding: 2.25rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
            border: 1px solid #E2E8F0;
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .atencion-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #EDF2F7;
            padding-bottom: 1.25rem;
        }

        .atencion-titulo {
            font-size: 1.125rem;
            font-weight: 700;
            color: #1A2B3C;
        }

        .badge-estado {
            font-size: 0.8125rem;
            font-weight: 700;
            padding: 0.375rem 0.875rem;
            border-radius: var(--radius-full);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-libre { background: #F1F5F9; color: #64748B; border: 1px solid #CBD5E1; }
        .badge-llamado { background: #FEF3C7; color: #D97706; border: 1px solid #FCD34D; }
        .badge-atencion { background: #ECFDF5; color: #059669; border: 1px solid #6EE7B7; }

        /* Ticket display grande */
        .ticket-display-box {
            background: #F8FAFC;
            border: 2px dashed #CBD5E1;
            border-radius: var(--radius-xl);
            padding: 2.5rem 1.5rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }

        .ticket-numero {
            font-size: 4rem;
            font-weight: 800;
            color: #0F172A;
            line-height: 1;
            font-family: var(--font-family);
            letter-spacing: 1px;
        }

        .ticket-dni {
            font-size: 1.25rem;
            color: #475569;
            font-weight: 600;
        }

        .ticket-obs-alerta {
            background: #EFF6FF;
            border: 1px solid #BFDBFE;
            color: #1E40AF;
            border-radius: var(--radius-md);
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            width: 100%;
            max-width: 600px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Seccion Cronometro */
        .cronometro-box {
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
            border-radius: var(--radius-lg);
            padding: 1.25rem 2rem;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 15px rgba(15, 23, 42, 0.2);
        }

        .cronometro-label {
            font-size: 0.875rem;
            color: #94A3B8;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .cronometro-tiempo {
            font-size: 2.25rem;
            font-weight: 800;
            font-family: monospace;
            color: #38BDF8;
            letter-spacing: 2px;
        }

        /* Botonera de Acciones */
        .botonera-acciones {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 1rem;
        }

        .btn-op {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.875rem 1.25rem;
            border-radius: var(--radius-lg);
            font-size: 0.9375rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all var(--transition-fast);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .btn-op:disabled {
            opacity: 0.45;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
        }

        .btn-op:not(:disabled):hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
        }

        .btn-op-rellamar {
            background: #0284C7;
            color: #FFFFFF;
        }

        .btn-op-finalizar {
            background: #10B981;
            color: #FFFFFF;
        }

        .btn-op-ausente {
            background: #F59E0B;
            color: #FFFFFF;
        }

        .btn-op-derivar {
            background: #6366F1;
            color: #FFFFFF;
        }

        .btn-op-llamar-grande {
            background: var(--color-primary);
            color: #FFFFFF;
            width: 100%;
            padding: 1rem 1.5rem;
            font-size: 1.05rem;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border-radius: var(--radius-lg);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
            transition: all var(--transition-fast);
        }

        .btn-op-llamar-grande:disabled {
            background: #CBD5E1;
            color: #94A3B8;
            cursor: not-allowed;
            box-shadow: none;
            transform: none !important;
        }

        .btn-op-llamar-grande:not(:disabled):hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            filter: brightness(1.05);
        }

        .botonera-acciones-2x2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.85rem;
            width: 100%;
        }

        .cola-tabs {
            display: flex;
            gap: 0.4rem;
        }

        .cola-tab-btn {
            background: transparent;
            border: 1px solid transparent;
            font-size: 0.875rem;
            font-weight: 700;
            color: #64748B;
            cursor: pointer;
            padding: 0.4rem 0.75rem;
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            gap: 0.4rem;
            transition: all var(--transition-fast);
        }

        .cola-tab-btn:hover {
            color: var(--color-primary);
            background: #F1F5F9;
        }

        .cola-tab-btn.active {
            color: var(--color-primary);
            background: var(--color-primary-tint);
            border-color: var(--color-primary);
        }

        .cola-tab-btn.active .cola-badge-count {
            background: var(--color-primary);
            color: #FFFFFF;
        }

        .cola-footer-action {
            margin-top: auto;
            padding-top: 0.75rem;
            border-top: 1px solid #EDF2F7;
        }

        .btn-reincorporar {
            background: #ECFDF5;
            border: 1px solid #10B981;
            color: #065F46;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.35rem 0.75rem;
            border-radius: var(--radius-md);
            cursor: pointer;
            transition: all var(--transition-fast);
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
        }

        .btn-reincorporar:hover {
            background: #10B981;
            color: #FFFFFF;
        }

        /* Tarjeta Cola de Espera */
        .card-cola {
            background: #FFFFFF;
            border-radius: var(--radius-xl);
            padding: 1.75rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
            border: 1px solid #E2E8F0;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            max-height: 750px;
        }

        .cola-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #EDF2F7;
        }

        .cola-titulo {
            font-size: 1.125rem;
            font-weight: 700;
            color: #1A2B3C;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .cola-badge-count {
            background: #E2E8F0;
            color: #334155;
            font-size: 0.8125rem;
            padding: 0.2rem 0.6rem;
            border-radius: var(--radius-full);
            font-weight: 700;
        }

        .btn-refrescar-icon {
            background: transparent;
            border: none;
            color: #64748B;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color var(--transition-fast);
        }

        .btn-refrescar-icon:hover {
            color: var(--color-primary);
        }

        .cola-lista {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            overflow-y: auto;
            padding-right: 0.25rem;
        }

        .turno-item {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: var(--radius-md);
            padding: 0.875rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            transition: all var(--transition-fast);
        }

        .turno-item:hover {
            border-color: #CBD5E1;
            background: #F1F5F9;
        }

        .turno-item.prioritario {
            border-left: 4px solid #EF4444;
            background: #FEF2F2;
        }

        .turno-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .turno-ticket {
            font-weight: 700;
            font-size: 1.125rem;
            color: #0F172A;
        }

        .badge-prioridad {
            background: #FEE2E2;
            color: #DC2626;
            font-size: 0.6875rem;
            font-weight: 700;
            padding: 0.15rem 0.5rem;
            border-radius: var(--radius-full);
            text-transform: uppercase;
        }

        .turno-item-body {
            display: flex;
            justify-content: space-between;
            font-size: 0.8125rem;
            color: #64748B;
        }

        .cola-vacia {
            text-align: center;
            color: #94A3B8;
            font-size: 0.875rem;
            padding: 2.5rem 1rem;
        }

        /* Modal de Derivacion */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 1rem;
        }

        .modal-overlay.modal-abierto {
            display: flex;
        }

        .modal-content {
            background: #FFFFFF;
            border-radius: var(--radius-xl);
            max-width: 520px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            animation: modal-enter 0.2s ease-out;
        }

        @keyframes modal-enter {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 1rem;
        }

        .modal-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1A2B3C;
        }

        .modal-close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #94A3B8;
            cursor: pointer;
            line-height: 1;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #334155;
        }

        .form-select, .form-textarea {
            border: 1px solid #CBD5E1;
            border-radius: var(--radius-md);
            padding: 0.75rem 1rem;
            font-size: 0.9375rem;
            font-family: inherit;
            color: #1E293B;
            width: 100%;
        }

        .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px var(--color-primary-tint);
        }

        .form-checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #1E293B;
            cursor: pointer;
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            border-top: 1px solid #E2E8F0;
            padding-top: 1.25rem;
        }

        /* Notificaciones Toast */
        .toast-panel {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #1E293B;
            color: #FFFFFF;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            font-size: 0.9375rem;
            display: none;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            transition: all 0.3s ease;
        }

        .toast-panel.visible {
            display: flex;
        }

        .toast-success { border-left: 4px solid #10B981; }
        .toast-error { border-left: 4px solid #EF4444; }
        .toast-info { border-left: 4px solid #38BDF8; }
    </style>
</asp:Content>

<asp:Content ID="MainContent1" ContentPlaceHolderID="MainContent" runat="server">
    <%-- Permite soporte de WebMethods en WebForms --%>
    <asp:ScriptManager ID="ScriptManager1" runat="server" EnablePageMethods="true" />

    <div class="operador-container">

        <%-- Banner de contexto del puesto del operador --%>
        <div class="box-context-card">
            <div class="box-info-group">
                <span class="box-badge" id="lblBoxNombre">Cargando...</span>
                <div class="box-details">
                    <span class="box-title" id="lblSectorNombre">Verificando sector...</span>
                    <span class="box-meta"><strong id="lblPisoNombre">-</strong></span>
                </div>
            </div>
            <div class="box-live-status">
                <span class="status-dot"></span>
                <span>Puesto Activo</span>
            </div>
        </div>

        <%-- Grid Principal: Columna de atencion y Columna de cola de atencion --%>
        <div class="operador-grid">

            <%-- Columna izquierda: Turno actual en atencion --%>
            <div class="card-atencion">
                <div class="atencion-header">
                    <span class="atencion-titulo">TURNO ACTUAL</span>
                    <span class="badge-estado badge-libre" id="badgeEstadoTurno">BOX DISPONIBLE</span>
                </div>

                <%-- Display gigante de ticket --%>
                <div class="ticket-display-box">
                    <div class="ticket-numero" id="lblTicketGrande">---</div>
                    <div class="ticket-dni" id="lblDniPaciente">Esperando llamado</div>
                    
                    <div class="ticket-obs-alerta" id="filaObsTurno" style="display: none;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <span id="lblObsTurno">Notas del turno...</span>
                    </div>
                </div>

                <%-- Cronometro digital --%>
                <div class="cronometro-box">
                    <div class="cronometro-label">Tiempo de Atención</div>
                    <div class="cronometro-tiempo" id="cronometroDisplay">00:00</div>
                </div>

                <%-- Botonera de control 2x2  --%>
                <div class="botonera-acciones-2x2">
                    <button type="button" class="btn-op btn-op-rellamar" id="btnRellamar" disabled title="Reiterar llamado del turno en pantalla y audio">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                        <span>Re-llamar</span>
                    </button>

                    <button type="button" class="btn-op btn-op-ausente" id="btnAusente" disabled title="Paciente no concurrió al llamado">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <span>Ausente</span>
                    </button>

                    <button type="button" class="btn-op btn-op-finalizar" id="btnFinalizar" disabled title="Concluir trámite">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                        </svg>
                        <span>Finalizar</span>
                    </button>

                    <button type="button" class="btn-op btn-op-derivar" id="btnDerivar" disabled title="Transferir a otro sector">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M16.01 11H4v2h12.01v3L20 12l-3.99-4v3z"/>
                        </svg>
                        <span>Derivar</span>
                    </button>
                </div>
            </div>

            <%-- Columna derecha: Cola de espera y Ausentes --%>
            <div class="card-cola">
                <div class="cola-header">
                    <div class="cola-tabs">
                        <button type="button" class="cola-tab-btn active" id="tabColaEspera">
                            <span>En Espera</span>
                            <span class="cola-badge-count" id="lblCantidadEspera">0</span>
                        </button>
                        <button type="button" class="cola-tab-btn" id="tabColaAusentes">
                            <span>Ausentes</span>
                            <span class="cola-badge-count" id="lblCantidadAusentes">0</span>
                        </button>
                    </div>
                    <button type="button" class="btn-refrescar-icon" id="btnRefrescarCola" title="Actualizar lista ahora">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                        </svg>
                    </button>
                </div>

                <%-- Listado de personas en espera --%>
                <div class="cola-lista" id="contenedorCola">
                    <div class="cola-vacia">Consultando lista de espera...</div>
                </div>

                <%-- Listado de personas ausentes --%>
                <div class="cola-lista" id="contenedorAusentes" style="display: none;">
                    <div class="cola-vacia">No hay pacientes ausentes registrados hoy.</div>
                </div>

                <div class="cola-footer-action">
                    <button type="button" class="btn-op-llamar-grande" id="btnLlamarSiguiente" title="Llamar al próximo paciente en espera">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                        </svg>
                        <span>LLAMAR SIGUIENTE</span>
                    </button>
                </div>
            </div>

        </div>

    </div>

    <%-- Modal de Derivacion --%>
    <div class="modal-overlay" id="modalDerivacion">
        <div class="modal-content">
            <div class="modal-header">
                <span class="modal-title">Derivar Turno a Otro Sector</span>
                <button type="button" class="modal-close-btn" id="btnCerrarModal">&times;</button>
            </div>
            <div class="form-group">
                <label class="form-label" for="cboSectorDestino">Sector / Piso Destino *</label>
                <select class="form-select" id="cboSectorDestino">
                    <option value="">Cargando sectores...</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-checkbox-label">
                    <input type="checkbox" id="chkPrioridad" checked="checked" />
                    <span>Marcar con Alta Prioridad (Recomendado para derivados)</span>
                </label>
            </div>
            <div class="form-group">
                <label class="form-label" for="txtNotasDerivacion">Observaciones / Motivo (Interno)</label>
                <textarea class="form-textarea" id="txtNotasDerivacion" rows="3" placeholder="Indique detalles para el operador de destino..."></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-op btn-op-finalizar" id="btnCancelarModal">Cancelar</button>
                <button type="button" class="btn-op btn-op-derivar" id="btnConfirmarDerivar">Confirmar Derivación</button>
            </div>
        </div>
    </div>

    <%-- Toast de notificaciones --%>
    <div class="toast-panel" id="panelToast">
        <span id="toastMensaje">Notificación</span>
    </div>

    <%-- Script del Operador --%>
    <script src="<%= ResolveUrl("~/js/operador.js") %>"></script>
</asp:Content>
