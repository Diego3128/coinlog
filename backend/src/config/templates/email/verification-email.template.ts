export interface VerificationEmailOptions {
  subject?: string;
  token: string;
  username: string;
}

export const verificationEmailTemplate = ({
  token,
  username,
  subject = "Coinlog — Verify your account",
}: VerificationEmailOptions) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coinlog Verification</title>
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
                      Hello, ${username}! 👋
                    </h1>
                    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #64748b;">
                      Thank you for signing up for Coinlog. To complete your account creation and verify your identity, please enter the following verification code:
                    </p>

                    <!-- Token Box -->
                    <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e293b; display: inline-block;">
                        ${token}
                      </span>
                    </div>

                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                      This code will expire shortly. If you didn't request this account, you can safely ignore this email.
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
