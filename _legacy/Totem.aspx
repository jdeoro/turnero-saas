<%@ Page Title="Tótem de Autoservicio" Language="C#" AutoEventWireup="true"
    CodeBehind="Totem.aspx.cs" Inherits="SeguimientoGestion.Web.Totem" %>
<!DOCTYPE html>
<html lang="es">
<head runat="server">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <meta name="description" content="Terminal de Autoservicio para emision de turnos y check-in de pacientes." />
    <meta name="theme-color" content="#0F172A" />
    <title>Tótem de Autoservicio | Seguimiento y Gestión</title>

    <%-- Fuentes institucionales --%>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

    <%-- Estilos del totem --%>
    <link rel="stylesheet" href="<%= ResolveUrl("~/css/totem.css") %>" />

    <%-- Tema institucional parametrizado --%>
    <style type="text/css" id="css-totem-theme">
        :root {
            --color-primary: <%= ColorInstitucional %> !important;
        }
    </style>
</head>
<body class="totem-body">
    <form id="formTotem" runat="server">
        <asp:ScriptManager ID="ScriptManagerTotem" runat="server" EnablePageMethods="true" />

        <%-- Cabecera Kiosco con Logo y Reloj en Vivo --%>
        <header class="totem-header">
            <div class="totem-brand">
                <img src="<%= ResolveUrl(LogoApp) %>" alt="Logo Institucional" class="totem-logo"
                     onerror="this.style.display='none';" />
                <div class="totem-brand-info">
                    <h1><%= TituloApp %></h1>
                    <p>Terminal de Autoservicio y Atención</p>
                </div>
            </div>

            <div class="totem-clock-widget">
                <span class="totem-clock-time" id="lblClockTime">--:--:--</span>
                <span class="totem-clock-date" id="lblClockDate">Cargando fecha...</span>
            </div>
        </header>

        <%-- Contenedor Principal de Flujo Wizard --%>
        <main class="totem-main">

            <%-- PASO 1: PANTALLA DE BIENVENIDA (CON TURNO / SIN TURNO) --%>
            <section class="totem-step active" id="stepWelcome">
                <div class="step-title-group">
                    <h2 class="step-title">Bienvenido</h2>
                    <p class="step-subtitle">Por favor, seleccione una opción para comenzar su trámite</p>
                </div>

                <div class="welcome-cards-grid">
                    <%-- Tarjeta 1: Sin Turno (Atencion espontanea) --%>
                    <div class="touch-card-hero hero-primary" id="btnOpcionSinTurno">
                        <span class="hero-badge-tag">Atención en el Día</span>
                        <div class="hero-icon-container">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <line x1="6" y1="8" x2="10" y2="8"/>
                                <line x1="6" y1="12" x2="18" y2="12"/>
                                <line x1="6" y1="16" x2="14" y2="16"/>
                            </svg>
                        </div>
                        <h3>SIN TURNO</h3>
                        <p>No tengo cita programada.<br />Emitir un ticket para ser atendido en el día.</p>
                    </div>

                    <%-- Tarjeta 2: Con Turno (Check-in de cita) --%>
                    <div class="touch-card-hero" id="btnOpcionConTurno">
                        <span class="hero-badge-tag">Cita Previa</span>
                        <div class="hero-icon-container">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                                <path d="m9 16 2 2 4-4"/>
                            </svg>
                        </div>
                        <h3>TENGO TURNO</h3>
                        <p>Tengo una cita pactada con un profesional.<br />Registrar mi llegada en sala de espera.</p>
                    </div>
                </div>
            </section>

            <%-- PASO 2: TECLADO TACTIL PARA INGRESO DE DNI --%>
            <section class="totem-step" id="stepDni">
                <div class="step-title-group">
                    <h2 class="step-title" id="lblDniTitulo">Ingrese su DNI</h2>
                    <p class="step-subtitle">Utilice el teclado numérico en pantalla para identificarse</p>
                </div>

                <div class="dni-kiosk-container">
                    <%-- Visor del DNI --%>
                    <div class="dni-display-card">
                        <div class="dni-display-label">Documento Nacional de Identidad</div>
                        <div class="dni-display-value placeholder" id="dniDisplay">Ingrese su número</div>
                    </div>

                    <%-- Toggle de Atencion Prioritaria --%>
                    <div class="prioridad-toggle-bar" id="togglePrioridadBar">
                        <input type="checkbox" id="chkPrioridadTotem" />
                        <label for="chkPrioridadTotem">
                            Solicitar atención prioritaria<br />
                            <small style="font-weight: 500; color: #78350F;">(Embarazo, movilidad reducida o adultos mayores)</small>
                        </label>
                    </div>

                    <%-- Teclado Numerico Tactil --%>
                    <div class="keypad-grid">
                        <button type="button" class="keypad-btn" data-key="1">1</button>
                        <button type="button" class="keypad-btn" data-key="2">2</button>
                        <button type="button" class="keypad-btn" data-key="3">3</button>
                        <button type="button" class="keypad-btn" data-key="4">4</button>
                        <button type="button" class="keypad-btn" data-key="5">5</button>
                        <button type="button" class="keypad-btn" data-key="6">6</button>
                        <button type="button" class="keypad-btn" data-key="7">7</button>
                        <button type="button" class="keypad-btn" data-key="8">8</button>
                        <button type="button" class="keypad-btn" data-key="9">9</button>
                        <button type="button" class="keypad-btn action-btn btn-clear" id="btnKeypadClear">Borrar Todo</button>
                        <button type="button" class="keypad-btn" data-key="0">0</button>
                        <button type="button" class="keypad-btn action-btn btn-delete" id="btnKeypadDelete">&#9003;</button>
                    </div>

                    <%-- Botonera de Navegacion del Paso 2 --%>
                    <div class="kiosk-nav-buttons">
                        <button type="button" class="btn-kiosk btn-kiosk-back" id="btnDniVolver">
                            &larr; Volver
                        </button>
                        <button type="button" class="btn-kiosk btn-kiosk-primary" id="btnDniContinuar" disabled>
                            Continuar &rarr;
                        </button>
                    </div>
                </div>
            </section>

            <%-- PASO 3: SELECCION DE TRAMITE / SECTOR --%>
            <section class="totem-step" id="stepSectors">
                <div class="step-title-group">
                    <h2 class="step-title">Seleccione el Sector</h2>
                    <p class="step-subtitle">Toque la opción correspondiente al trámite que desea realizar</p>
                </div>

                <div class="sectors-kiosk-grid" id="contenedorSectores">
                    <%-- Se pobla dinamicamente via JS desde cfg_sector --%>
                    <div style="grid-column: 1 / -1; text-align: center; color: var(--totem-text-muted); font-size: 1.2rem; padding: 3rem;">
                        Cargando sectores disponibles...
                    </div>
                </div>

                <div class="kiosk-nav-buttons" style="max-width: 480px;">
                    <button type="button" class="btn-kiosk btn-kiosk-back" id="btnSectoresVolver">
                        &larr; Volver
                    </button>
                </div>
            </section>

            <%-- PASO 4: COMPROBANTE Y EMISION DE TICKET --%>
            <section class="totem-step" id="stepTicket">
                <div class="step-title-group" style="margin-bottom: 1.5rem;">
                    <h2 class="step-title" style="color: var(--totem-success);">&#10004; ¡Turno Emitido!</h2>
                    <p class="step-subtitle">Por favor, retire su comprobante y tome asiento</p>
                </div>

                <%-- Tarjeta de Ticket Estilo Papel Termico --%>
                <div class="ticket-receipt-card" id="tarjetaTicketTermico">
                    <div class="ticket-receipt-header">
                        <h3><%= TituloApp %></h3>
                        <div style="font-size: 0.8rem; color: #94A3B8;">Comprobante de Atención</div>
                    </div>

                    <div class="ticket-code-display" id="lblTicketCodigo">T-000</div>

                    <div class="ticket-sector-name" id="lblTicketSector">Sector</div>
                    <div class="ticket-floor-name" id="lblTicketPiso">Piso -</div>

                    <div class="ticket-dashed-divider"></div>

                    <div class="ticket-queue-notice" id="lblTicketPersonasAntes">
                        0 personas antes en este sector
                    </div>

                    <div class="ticket-info-pills">
                        <div class="info-pill-item">
                            <span class="pill-label">DNI</span>
                            <span class="pill-value" id="lblTicketDni">--</span>
                        </div>
                        <div class="info-pill-item">
                            <span class="pill-label">Hora</span>
                            <span class="pill-value" id="lblTicketHora">--:--</span>
                        </div>
                    </div>

                    <div class="ticket-instructions">
                        Aguarde a que su número aparezca en las pantallas de cartelería.<br />
                        El operador llamará a su número de ticket.
                    </div>
                </div>

                <%-- Contador Regresivo para Reinicio Automatico --%>
                <div class="countdown-box">
                    Volviendo al inicio en <span class="countdown-number" id="lblCountdown">8</span> segundos
                </div>
                <div class="countdown-progress-bar">
                    <div class="countdown-progress-fill" id="countdownFill"></div>
                </div>

                <div class="kiosk-nav-buttons" style="max-width: 320px; margin-top: 1.5rem;">
                    <button type="button" class="btn-kiosk btn-kiosk-back" id="btnFinalizarTotem">
                        Finalizar ahora
                    </button>
                </div>
            </section>

        </main>

        <%-- Toast de Notificacion Tactil --%>
        <div class="totem-toast" id="totemToast">
            <span id="totemToastText">Mensaje</span>
        </div>

    </form>

    <%-- Script de Logica Táctil y Comunicación Frontend --%>
    <script src="<%= ResolveUrl("~/js/totem.js") %>"></script>
</body>
</html>
