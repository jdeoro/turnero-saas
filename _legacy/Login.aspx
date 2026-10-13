<%@ Page Title="Login" Language="C#" AutoEventWireup="true"
    CodeBehind="Login.aspx.cs" Inherits="SeguimientoGestion.Web.Login" %>
<!DOCTYPE html>
<html lang="es">
<head runat="server">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Sistema de Seguimiento y Gestión de Turnos - Acceso de usuarios." />
    <meta name="theme-color" content="#111111" />
    <title>Login</title>

    <%-- Fuentes --%>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

    <%-- Hoja de estilos principal --%>
    <link rel="stylesheet" href="<%= ResolveUrl("~/css/styles.css") %>" />

    <%-- Tema institucional dinámico --%>
    <style type="text/css" id="css-login-theme">
        :root {
            --color-primary: <%= ColorInstitucional %> !important;
        }
    </style>

    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
        }

        body {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background: linear-gradient(135deg, #2b2b2b 0%, #3a3a3a 55%, #4a4a4a 100%);
            position: relative;
            overflow-x: hidden;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Círculos decorativos de fondo con tono verde institucional */
        body::before {
            content: '';
            position: fixed;
            top: -20%;
            right: -10%;
            width: 550px;
            height: 550px;
            background: radial-gradient(circle, var(--color-primary-tint) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }

        body::after {
            content: '';
            position: fixed;
            bottom: -15%;
            left: -8%;
            width: 480px;
            height: 480px;
            background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }

        #form1 {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .login-main {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
            position: relative;
            z-index: 1;
        }

        .auth-aux-row {
            display: flex;
            justify-content: flex-end;
            margin-top: -0.5rem;
            margin-bottom: 1.5rem;
        }

        .auth-link {
            font-size: 0.8125rem;
            color: var(--color-text-secondary);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.15s ease;
        }

        .auth-link:hover {
            color: var(--color-primary);
            text-decoration: underline;
        }

        .auth-register-row {
            text-align: center;
            margin-top: 1.5rem;
            padding-top: 1.25rem;
            border-top: 1px solid var(--color-border);
            font-size: 0.875rem;
            color: var(--color-text-secondary);
        }

        .auth-link-highlight {
            color: #111111;
            font-weight: 700;
            text-decoration: none;
            margin-left: 0.25rem;
            transition: color 0.15s ease;
        }

        .auth-link-highlight:hover {
            color: var(--color-primary);
            text-decoration: underline;
        }

        .login-footer {
            text-align: center;
            padding: 1rem;
            font-size: 0.75rem;
            color: rgba(255,255,255,0.4);
            position: relative;
            z-index: 1;
        }

        .login-footer span {
            color: rgba(255,255,255,0.6);
        }

        .spinner-icon {
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <form id="form1" runat="server" defaultbutton="btnIngresar">
        <main class="login-main">
            <div class="login-card" id="loginCard">

                <%-- Cabecera de la tarjeta --%>
                <div class="login-card-header">
                    <div class="login-card-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4.18c1.76 0 3.18 1.42 3.18 3.18S13.76 11.54 12 11.54 8.82 10.12 8.82 8.36 10.24 5.18 12 5.18zM12 20c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08C16.71 18.72 14.5 20 12 20z"/>
                        </svg>
                    </div>
                    <h1 class="login-card-title">Ingreso al sistema</h1>
                </div>

                <%-- Cuerpo del formulario --%>
                <div class="login-card-body">

                    <%-- Alerta de error del servidor --%>
                    <asp:Panel ID="pnlError" runat="server" Visible="false" CssClass="alert alert-error" role="alert">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <asp:Literal ID="litError" runat="server" />
                    </asp:Panel>

                    <%-- CAMPO: DNI --%>
                    <div class="form-group">
                        <label class="form-label" for="txtDni">DNI</label>
                        <div class="form-input-wrapper">
                            <span class="form-input-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:var(--color-text-muted)">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                </svg>
                            </span>
                            <asp:TextBox ID="txtDni" runat="server"
                                CssClass="form-control"
                                MaxLength="20"
                                placeholder="Ingrese su número de documento"
                                autocomplete="username"
                                ClientIDMode="Static" />
                        </div>
                        <span class="form-hint">Ingrese su número de documento sin puntos.</span>
                        <span id="errorDni" class="form-error" style="display:none">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            Ingrese un DNI numérico válido.
                        </span>
                    </div>

                    <%-- CAMPO: Contraseña --%>
                    <div class="form-group">
                        <label class="form-label" for="txtPassword">Contraseña</label>
                        <div class="form-input-wrapper">
                            <span class="form-input-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:var(--color-text-muted)">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                                </svg>
                            </span>
                            <asp:TextBox ID="txtPassword" runat="server"
                                CssClass="form-control"
                                TextMode="Password"
                                placeholder="Ingrese su contraseña"
                                autocomplete="current-password"
                                ClientIDMode="Static" />
                        </div>
                        <span id="errorPassword" class="form-error" style="display:none">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            Ingrese su contraseña.
                        </span>
                    </div>

                    <%-- Link: Olvidaste la contraseña --%>
                    <div class="auth-aux-row">
                        <a href="javascript:void(0);" onclick="alert('Por favor, comuníquese con el Administrador para restablecer su contraseña.');" class="auth-link">¿Olvidaste tu contraseña?</a>
                    </div>

                    <%-- Botón principal con indicador de carga --%>
                    <asp:LinkButton ID="btnIngresar" runat="server"
                        CssClass="btn btn-primary btn-full btn-lg"
                        OnClick="btnIngresar_Click"
                        ClientIDMode="Static"
                        OnClientClick="if (!validarLogin()) return false;">
                        <span id="btnTexto">Iniciar Sesion</span>
                        <span id="btnSpinner" style="display:none; align-items:center; justify-content:center; gap:0.6rem;">
                            <svg class="spinner-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" fill="none"></circle>
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"></path>
                            </svg>
                            <span>Iniciando sesión...</span>
                        </span>
                    </asp:LinkButton>

                    <%-- Link: No tenés cuenta --%>
                    <div class="auth-register-row">
                        <span>¿No tenés cuenta?</span>
                        <a href="javascript:void(0);" onclick="alert('El alta de operadores y supervisores debe ser gestionada por el área de administración.');" class="auth-link-highlight">Crear una cuenta</a>
                    </div>

                </div>
                <%-- /login-card-body --%>

            </div>
            <%-- /login-card --%>
        </main>

        <%-- Footer con copyright dinámico --%>
        <footer class="login-footer">
            <span>© <%= DateTime.Now.Year %> Desarrollado por Integradores</span>
            Todos los derechos reservados. Prohibida su reproduccion total o parcial
        </footer>

    </form>

    <%-- Scripts de validación en cliente --%>
    <script>
        function validarLogin() {
            var valido = true;

            var dni = document.getElementById('txtDni').value.trim();
            var inputDni = document.getElementById('txtDni');
            var errorDni = document.getElementById('errorDni');

            if (!/^\d{5,20}$/.test(dni)) {
                errorDni.style.display = 'flex';
                inputDni.classList.add('is-invalid');
                valido = false;
            } else {
                errorDni.style.display = 'none';
                inputDni.classList.remove('is-invalid');
            }

            var password = document.getElementById('txtPassword').value;
            var inputPassword = document.getElementById('txtPassword');
            var errorPassword = document.getElementById('errorPassword');

            if (!password || password.trim().length === 0) {
                errorPassword.style.display = 'flex';
                inputPassword.classList.add('is-invalid');
                valido = false;
            } else {
                errorPassword.style.display = 'none';
                inputPassword.classList.remove('is-invalid');
            }

            if (valido) {
                var btn = document.getElementById('btnIngresar');
                var btnTexto = document.getElementById('btnTexto');
                var btnSpinner = document.getElementById('btnSpinner');
                if (btnTexto) btnTexto.style.display = 'none';
                if (btnSpinner) btnSpinner.style.display = 'inline-flex';
                if (btn) btn.style.pointerEvents = 'none';
            }

            return valido;
        }

        document.getElementById('txtDni').addEventListener('input', function () {
            this.classList.remove('is-invalid');
            document.getElementById('errorDni').style.display = 'none';
        });

        document.getElementById('txtPassword').addEventListener('input', function () {
            this.classList.remove('is-invalid');
            document.getElementById('errorPassword').style.display = 'none';
        });
    </script>
</body>
</html>