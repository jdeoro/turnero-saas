<%@ Page Title="Cartelería de Sala de Espera" Language="C#" AutoEventWireup="true"
    CodeBehind="Carteleria.aspx.cs" Inherits="SeguimientoGestion.Web.Carteleria" %>
<!DOCTYPE html>
<html lang="es">
<head runat="server">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <meta name="description" content="Cartelería Digital de Sala de Espera para anuncios audiovisuales de turnos." />
    <meta name="theme-color" content="#0F172A" />
    <title>Cartelería TV | Sala de Espera</title>

    <%-- Fuentes institucionales --%>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

    <%-- Estilos dedicados para Cartelería TV --%>
    <link rel="stylesheet" href="<%= ResolveUrl("~/css/carteleria.css?v=" + DateTime.Now.Ticks) %>" />

    <%-- Tema institucional parametrizado --%>
    <style type="text/css" id="css-carteleria-theme">
        :root {
            --color-primary: <%= ColorInstitucional %> !important;
            --color-primary-rgb: 51, 65, 85;
        }
    </style>
</head>
<body class="tv-body <%= ClaseTema %>" data-tema-url="<%= TemaUrl %>" data-tema-inicial="<%= TemaInicial %>">
    <form id="formCarteleria" runat="server">
        <asp:ScriptManager ID="ScriptManagerCarteleria" runat="server" EnablePageMethods="true" />

        <%-- Overlay de inicio para desbloquear audio en navegadores (desactivado para ingreso directo) --%>
        <%--
        <div class="audio-permission-overlay" id="audioOverlay">
            <div class="audio-prompt-card">
                <div class="audio-prompt-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                </div>
                <h2>Pantalla de Cartelería TV</h2>
                <p>Haga clic en cualquier lugar para activar el sonido de la sala y poner a pantalla completa.</p>
                <button type="button" class="btn-start-tv" id="btnActivarAudio">
                    <span>Iniciar Pantalla con Sonido</span>
                </button>
            </div>
        </div>
        --%>

        <%-- Encabezado Widescreen: Identidad Institucional + Control de Audio + Reloj --%>
        <header class="tv-header">
            <div class="tv-brand">
                <img src="<%= ResolveUrl(LogoApp) %>" alt="Logo Institucional" class="tv-logo"
                     onerror="this.style.display='none';" />
                <div class="tv-brand-titles">
                    <h1><%= TituloApp %></h1>
                    <p id="lblSubtituloSala"><%= SubtituloSala %></p>
                </div>
            </div>

            <div class="tv-controls">
                <button type="button" class="tv-btn-icon" id="btnToggleAudio" title="Activar / Desactivar Sonido">
                    <svg id="iconAudioOn" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                    <svg id="iconAudioOff" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style="display:none;">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2" />
                        <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <span id="lblAudioStatus">Sonido Activado</span>
                </button>

                <%-- Selector Desplegable de Sala / Sector --%>
                <div class="tv-selector-sala-wrapper" id="wrapperSelectorSala">
                    <button type="button" class="tv-btn-icon" id="btnSelectorSala" title="Configurar Sala o Sector">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="9" y1="3" x2="9" y2="21" />
                        </svg>
                        <span id="lblSalaStatus"><%= SectorFiltro > 0 ? SubtituloSala.Replace("Sala de Espera • ", "") : "Mesa de Entrada" %></span>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" class="icon-chevron" id="iconSalaChevron">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                    <div class="tv-sala-dropdown" id="dropdownSalas" style="display: none;">
                        <div class="tv-sala-dropdown-header">SELECCIONAR PANTALLA / SECTOR</div>
                        <div class="tv-sala-list" id="listaSalas">
                            <button type="button" class="tv-sala-item <%= SectorFiltro == 0 ? "active" : "" %>" data-id="0">
                                <div class="tv-sala-item-title">Mesa de Entrada (General)</div>
                                <div class="tv-sala-item-piso">Planta Baja • Todos los sectores</div>
                            </button>
                        </div>
                    </div>
                </div>

                <button type="button" class="tv-btn-icon" id="btnToggleTema" title="Alternar Modo Claro / Oscuro">
                    <svg id="iconTemaSol" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    <svg id="iconTemaLuna" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    <span id="lblTemaStatus">Modo Claro</span>
                </button>

                <button type="button" class="tv-btn-icon" id="btnFullscreen" title="Pantalla Completa (F11)">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                    <span>Pantalla Completa</span>
                </button>
            </div>

            <div class="tv-clock-widget">
                <span class="tv-clock-time" id="lblClockTime">--:--:--</span>
                <span class="tv-clock-date" id="lblClockDate">Cargando fecha...</span>
            </div>
        </header>

        <%-- Cuerpo Principal: Layout Split 2 Paneles --%>
        <main class="tv-main-grid">

            <%-- Panel Izquierdo (60%): Ultimo Turno Llamado en Gran Formato --%>
            <section class="tv-panel-focus" id="panelUltimoLlamado">
                <div class="focus-header-badge">
                    <span class="live-dot"></span>
                    <span class="focus-badge-text">ÚLTIMO LLAMADO</span>
                </div>

                <div class="focus-content-card" id="cardEnFoco">
                    <%-- Estado cuando no hay turnos emitidos --%>
                    <div class="focus-standby" id="boxStandby">
                        <div class="standby-icon-wrapper">
                            <div class="standby-pulse-halo"></div>
                            <div class="standby-icon">
                                <svg viewBox="0 0 24 24" width="72" height="72" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </div>
                        </div>
                        <h2>Aguardando llamadas de turnos</h2>
                        <p>Por favor tome asiento y conserve su comprobante.</p>
                        <div class="standby-subbadge">
                            <span class="standby-subbadge-dot"></span>
                            <span>SISTEMA ACTIVO</span>
                        </div>
                    </div>

                    <%-- Visualizacion activa del turno llamado --%>
                    <div class="focus-active" id="boxActive" style="display: none;">
                        <div class="focus-ticket-title">TURNO</div>
                        <div class="focus-ticket-number" id="lblFocusTicket">---</div>

                        <div class="focus-destination-container">
                            <div class="focus-box-tag" id="lblFocusBox">BOX 1</div>
                            <div class="focus-sector-meta">
                                <div class="focus-sector-title" id="lblFocusSector">-</div>
                                <div class="focus-sector-floor" id="lblFocusPiso">-</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <%-- Panel Derecho (40%): Historial de Llamados Recientes --%>
            <section class="tv-panel-history">
                <div class="history-header">
                    <div class="history-title-group">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <h2>Llamados Recientes</h2>
                    </div>
                    <span class="history-subtitle">Últimos avisos</span>
                </div>

                <div class="history-list" id="contenedorHistorial">
                    <%-- Los elementos del historial se renderizan dinamicamente aqui --%>
                    <div class="history-empty">No hay llamados recientes registrados.</div>
                </div>
            </section>

        </main>

        <%-- Pie de Pantalla: Zocalo Continuo de Noticias / Mensajes Institucionales --%>
        <footer class="tv-footer-ticker" id="footerTicker" style="<%= ZocaloVisible ? "" : "display: none;" %>">
            <div class="ticker-badge">INFORMACIÓN</div>
            <div class="ticker-wrapper">
                <div class="ticker-content" id="tickerText"><%= Zocalo %></div>
            </div>
        </footer>

    </form>

    <%-- Variables globales de filtro de sala/piso --%>
    <script type="text/javascript">
        window.__CARTELERIA_FILTER = {
            piso: '<%= PisoFiltro %>',
            idSector: <%= SectorFiltro %>,
            hasUrlParam: <%= (!string.IsNullOrEmpty(Request.QueryString["sector"]) || !string.IsNullOrEmpty(Request.QueryString["piso"])).ToString().ToLower() %>
        };
    </script>
    <%-- Script de logica de carteleria --%>
    <script src="<%= ResolveUrl("~/js/carteleria.js?v=" + DateTime.Now.Ticks) %>"></script>
</body>
</html>
