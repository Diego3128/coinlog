export interface LoggedInEmailOptions {
  subject?: string;
  username: string;
  email: string;
  ipAddress?: string;
  device?: string;
  time?: string;
}

export const loggedInEmailTemplate = ({
  username,
  email,
  ipAddress = "Unknown IP",
  device = "Unknown Device / Browser",
  time = new Date().toUTCString(),
  subject = "Coinlog — Security Alert: New Login Detected",
}: LoggedInEmailOptions) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Login Detected</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
          <tr>
            <td align="center">
              <!-- Container Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                
                <!-- Header / Logo -->
                <tr>
                  <td style="padding: 32px 32px 0 32px; text-align: left;">
                    <span style="font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
                      Coinlog<span style="color: #2563eb;">.</span>
                    </span>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 24px 32px; text-align: left;">
                    <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 600; color: #0f172a;">
                      New Login Activity 🔒
                    </h1>
                    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #64748b;">
                      Hello <strong>${username}</strong>, we detected a successful login to your Coinlog account (<code>${email}</code>).
                    </p>

                    <!-- Details Card -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px; color: #475569;">
                        <tr>
                          <td style="padding: 4px 0; color: #94a3b8; width: 80px;"><strong>Time:</strong></td>
                          <td style="padding: 4px 0; color: #1e293b;">${time}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #94a3b8;"><strong>Device:</strong></td>
                          <td style="padding: 4px 0; color: #1e293b;">${device}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #94a3b8;"><strong>IP Address:</strong></td>
                          <td style="padding: 4px 0; color: #1e293b; font-family: monospace;">${ipAddress}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                      If this was you, no further action is required.
                    </p>

                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #dc2626; font-weight: 500;">
                      If you did not log in, please reset your password immediately and secure your account.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                      © ${new Date().getFullYear()} Coinlog. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return { subject, html };
};
