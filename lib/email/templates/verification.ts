export type VerificationEmailInput = {
  code: string;
  expiresInMinutes: number;
};

export function verificationEmail({
  code,
  expiresInMinutes,
}: VerificationEmailInput): { subject: string; html: string; text: string } {
  const subject = `Your verification code: ${code}`;
  const text = `Your D&D Manager verification code is ${code}. It expires in ${expiresInMinutes} minutes. If you didn't request this, you can safely ignore this email.`;
  const html = `<!doctype html>
<html lang="en">
  <body style="font-family: ui-sans-serif, system-ui, sans-serif; color: #111; padding: 24px;">
    <h1 style="font-size: 20px; margin: 0 0 12px;">Verify your email</h1>
    <p style="margin: 0 0 16px;">Use this code to finish creating your D&amp;D Manager account:</p>
    <p style="font-size: 28px; font-weight: 600; letter-spacing: 6px; margin: 0 0 16px;">${code}</p>
    <p style="margin: 0 0 16px; color: #555;">It expires in ${expiresInMinutes} minutes.</p>
    <p style="margin: 0; color: #888; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
  </body>
</html>`;
  return { subject, html, text };
}
