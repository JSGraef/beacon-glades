import twilio from "twilio";

export type OutboundSmsResult = {
  sid: string | null;
  sentAt: string;
  body: string;
};

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    return null;
  }
  return twilio(sid, token);
}

function getFromNumber(): string | null {
  return process.env.TWILIO_FROM_NUMBER ?? null;
}

export function renderTemplate(
  template: string,
  vars: { name: string; link: string },
): string {
  return template
    .replaceAll("{name}", vars.name)
    .replaceAll("{link}", vars.link);
}

export async function sendSms(params: {
  to: string;
  body: string;
}): Promise<OutboundSmsResult> {
  const sentAt = new Date().toISOString();
  const client = getClient();
  const from = getFromNumber();
  if (!client || !from) {
    // Dev fallback: log and succeed so the local flow is testable without Twilio creds.
    console.warn("[twilio] missing credentials; pretending to send:", params);
    return { sid: null, sentAt, body: params.body };
  }
  const message = await client.messages.create({
    to: params.to,
    from,
    body: params.body,
  });
  return { sid: message.sid, sentAt, body: params.body };
}

export function validateInboundSignature(params: {
  signature: string | null;
  url: string;
  params: Record<string, string>;
}): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) {
    return false;
  }
  if (!params.signature) {
    return false;
  }
  return twilio.validateRequest(
    token,
    params.signature,
    params.url,
    params.params,
  );
}
