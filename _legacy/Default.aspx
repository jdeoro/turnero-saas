<%@ Page Title="Inicio" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true"
    CodeBehind="Default.aspx.cs" Inherits="SeguimientoGestion.Web.Default" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeadContent" runat="server">
    <style>
        .dashboard-welcome {
            background: #FFFFFF;
            border-radius: var(--radius-xl);
            padding: 2.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
            border: 1px solid #E2E8F0;
            margin-bottom: 2rem;
        }
        .dashboard-hero {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
        }
        .dashboard-hero h1 {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1A2B3C;
            margin-bottom: 0.5rem;
        }
        .dashboard-hero p {
            color: #64748B;
            font-size: 0.9375rem;
        }
        .quick-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
        }
        .stat-card {
            background: #F8FAFC;
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            border: 1px solid #EDF2F7;
            display: flex;
            align-items: center;
            gap: 1.25rem;
            transition: transform var(--transition-fast);
        }
        .stat-card:hover {
            transform: translateY(-2px);
        }
        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-primary-tint);
            color: var(--color-primary);
            flex-shrink: 0;
        }
        .stat-info {
            display: flex;
            flex-direction: column;
        }
        .stat-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 600;
            color: #8FA3B3;
            letter-spacing: 0.5px;
        }
        .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1A2B3C;
            margin-top: 0.25rem;
        }
    </style>
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
    <div class="dashboard-welcome">
        <div class="dashboard-hero">
            <div>
                <h1>Sistema de Seguimiento de Turnos</h1>
            </div>
            <div class="stat-icon" style="width:56px; height:56px; border-radius:var(--radius-lg);">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
            </div>
        </div>

        <div class="quick-stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <span class="stat-label">DNI Operador</span>
                    <span class="stat-value"><asp:Label ID="lblDni" runat="server" /></span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4.18c1.76 0 3.18 1.42 3.18 3.18S13.76 11.54 12 11.54 8.82 10.12 8.82 8.36 10.24 5.18 12 5.18z"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Rol del Sistema</span>
                    <span class="stat-value"><asp:Label ID="lblRol" runat="server" /></span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Estado de Conexión</span>
                    <span class="stat-value" style="color:var(--color-success);">En línea</span>
                </div>
            </div>
        </div>
    </div>
</asp:Content>