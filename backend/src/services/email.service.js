import { Resend } from 'resend'
import { config } from '../config/env.js'

const resend = new Resend(config.resendApiKey)

export const emailService = {
  sendVerificationCode: async (email, name, code) => {
    const { data, error } = await resend.emails.send({
      from: config.resendFrom,
      to: email,
      subject: 'TerritoriApp — Verificación de cuenta',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verificación de cuenta</title>
        </head>
        <body style="margin:0;padding:0;background:#F8FAFC;font-family:'Inter',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#1E3A8A,#2563EB);padding:32px 40px;">
                      <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.025em;">
                        TerritoriApp
                      </p>
                      <p style="margin:4px 0 0;color:#93C5FD;font-size:12px;font-weight:500;">
                        Plataforma de Gestión Territorial — Provincia Sabana Centro
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">
                        Verificación de cuenta
                      </p>
                      <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0F172A;line-height:1.3;">
                        Confirme su dirección de correo electrónico
                      </h1>

                      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.7;">
                        Estimado/a <strong style="color:#0F172A;">${name}</strong>,
                      </p>

                      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.7;">
                        Hemos recibido una solicitud de registro en la plataforma TerritoriApp. Para activar su cuenta, utilice el siguiente código de verificación:
                      </p>

                      <!-- Code -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                        <tr>
                          <td style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:28px;text-align:center;">
                            <p style="margin:0 0 10px;font-size:11px;font-weight:600;color:#1E40AF;text-transform:uppercase;letter-spacing:0.1em;">
                              Código de verificación
                            </p>
                            <p style="margin:0;font-size:42px;font-weight:800;color:#1E3A8A;letter-spacing:0.25em;font-variant-numeric:tabular-nums;">
                              ${code}
                            </p>
                            <p style="margin:10px 0 0;font-size:12px;color:#64748B;">
                              Este código tiene una validez de <strong>15 minutos</strong> a partir del momento de su envío.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.7;">
                        Ingrese este código en la pantalla de verificación para completar su registro y acceder a la plataforma.
                      </p>

                      <!-- Divider -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                        <tr>
                          <td style="border-top:1px solid #E2E8F0;"></td>
                        </tr>
                      </table>

                      <p style="margin:0 0 8px;color:#94A3B8;font-size:12px;line-height:1.6;">
                        <strong style="color:#475569;">Aviso de seguridad:</strong> Si usted no solicitó este registro, puede ignorar este mensaje. Su cuenta no será activada sin la verificación del código.
                      </p>
                      <p style="margin:0;color:#94A3B8;font-size:12px;line-height:1.6;">
                        Por favor no comparta este código con ninguna persona. TerritoriApp nunca solicitará su código de verificación por ningún otro medio.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
                      <p style="margin:0 0 4px;color:#94A3B8;font-size:11px;text-align:center;">
                        Este es un mensaje automatizado. Por favor no responda a este correo.
                      </p>
                      <p style="margin:0;color:#94A3B8;font-size:11px;text-align:center;">
                        &copy; 2026 TerritoriApp &mdash; Provincia Sabana Centro, Cundinamarca, Colombia
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    if (error) throw new Error(error.message)
    return data
  },

  sendWelcome: async (email, name) => {
    await resend.emails.send({
      from: config.resendFrom,
      to: email,
      subject: 'TerritoriApp — Bienvenido a la plataforma',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a TerritoriApp</title>
        </head>
        <body style="margin:0;padding:0;background:#F8FAFC;font-family:'Inter',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#1E3A8A,#2563EB);padding:32px 40px;">
                      <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.025em;">
                        TerritoriApp
                      </p>
                      <p style="margin:4px 0 0;color:#93C5FD;font-size:12px;font-weight:500;">
                        Plataforma de Gestión Territorial — Provincia Sabana Centro
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">
                        Registro completado
                      </p>
                      <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0F172A;line-height:1.3;">
                        Bienvenido a TerritoriApp
                      </h1>

                      <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.7;">
                        Estimado/a <strong style="color:#0F172A;">${name}</strong>,
                      </p>

                      <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.7;">
                        Su cuenta ha sido verificada y activada exitosamente. A partir de este momento tiene acceso completo a la plataforma de gestión territorial de la provincia Sabana Centro.
                      </p>

                      <!-- Features -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                        <tr>
                          <td style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:24px;">
                            <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#1E3A8A;text-transform:uppercase;letter-spacing:0.06em;">
                              Funcionalidades disponibles
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              ${[
                                ['Creacion de reportes territoriales', 'Registre problemas en su municipio con ubicacion geografica precisa'],
                                ['Seguimiento en tiempo real', 'Consulte el estado de sus reportes y reciba actualizaciones'],
                                ['Mapa interactivo', 'Visualice los reportes geolocalizados en la provincia'],
                                ['Estadisticas territoriales', 'Acceda a analisis y tendencias de problematicas por municipio'],
                              ].map(([title, desc]) => `
                                <tr>
                                  <td style="padding:6px 0;vertical-align:top;">
                                    <p style="margin:0;font-size:13px;color:#0F172A;font-weight:600;">${title}</p>
                                    <p style="margin:2px 0 0;font-size:12px;color:#64748B;">${desc}</p>
                                  </td>
                                </tr>
                              `).join('')}
                            </table>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;">
                        Para cualquier inquietud o soporte tecnico, puede contactar al administrador del sistema a traves de la plataforma.
                      </p>

                      <!-- Divider -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                        <tr><td style="border-top:1px solid #E2E8F0;"></td></tr>
                      </table>

                      <p style="margin:0;color:#94A3B8;font-size:12px;line-height:1.6;">
                        Atentamente,<br/>
                        <strong style="color:#475569;">Equipo TerritoriApp</strong><br/>
                        Plataforma de Gestion Territorial — Provincia Sabana Centro
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
                      <p style="margin:0 0 4px;color:#94A3B8;font-size:11px;text-align:center;">
                        Este es un mensaje automatizado. Por favor no responda a este correo.
                      </p>
                      <p style="margin:0;color:#94A3B8;font-size:11px;text-align:center;">
                        &copy; 2026 TerritoriApp &mdash; Provincia Sabana Centro, Cundinamarca, Colombia
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })
  }
}