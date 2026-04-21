import { appendMessage, findItemByPhone } from "@/lib/lost-and-found/items";
import { normalizeToE164 } from "@/lib/lost-and-found/phone";
import { validateInboundSignature } from "@/lib/lost-and-found/twilio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response/>';

function twimlResponse(status = 200): Response {
  return new Response(EMPTY_TWIML, {
    status,
    headers: { "Content-Type": "application/xml" },
  });
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  const params = Object.fromEntries(new URLSearchParams(bodyText));

  const signature = request.headers.get("x-twilio-signature");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const url = host
    ? `${forwardedProto}://${host}/api/twilio/inbound`
    : request.url;

  const valid = validateInboundSignature({
    signature,
    url,
    params,
  });

  if (!valid) {
    return new Response("Invalid signature", { status: 403 });
  }

  const from = params.From ?? "";
  const body = params.Body ?? "";
  const sid = params.MessageSid ?? null;

  const e164 = normalizeToE164(from);
  if (!e164) {
    return twimlResponse();
  }

  const item = await findItemByPhone(e164);
  if (!item) {
    return twimlResponse();
  }

  await appendMessage(
    item.slug,
    {
      direction: "inbound",
      body,
      twilioSid: sid,
      at: new Date().toISOString(),
    },
    { markUnread: true },
  );

  return twimlResponse();
}
