import { Resend } from "resend";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let cachedClient: Resend | null = null;

function getClient(apiKey: string): Resend {
  if (!cachedClient) cachedClient = new Resend(apiKey);
  return cachedClient;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.log(
      `[email:dev] to=${input.to} subject=${input.subject}\n${input.text ?? input.html}`,
    );
    return;
  }

  const result = await getClient(apiKey).emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message}`);
  }
}
