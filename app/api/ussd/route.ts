import { handleUssd } from "@/lib/ussd-engine";
import {
  RATE,
  clientIp,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";

export const maxDuration = 15;

const CALLBACK_HELP = [
  "USend Africa's Talking callback.",
  "POST application/x-www-form-urlencoded: sessionId, phoneNumber, serviceCode, text.",
  "Replies text/plain CON or END. USSD simulator — not a live MNO session.",
].join(" ");

type AtFields = {
  sessionId: string;
  phoneNumber: string;
  networkCode: string;
  serviceCode: string;
  text: string;
};

function hopMetadata(text: string, body: string): string {
  const kind = body.startsWith("END ") ? "end" : "con";
  if (text === "") return `WelcomeMenu:${kind}`;
  if (text === "1") return `EnterCode:${kind}`;
  if (text === "2") return `Activate:${kind}`;
  if (text === "3") return `Balance:${kind}`;
  if (text === "0") return `Exit:${kind}`;
  const parts = text.split("*");
  if (parts[0] === "1" && parts.length === 2) return `EnterAmount:${kind}`;
  if (parts[0] === "1" && parts.length === 3) return `EnterPin:${kind}`;
  if (parts[0] === "1" && parts.length >= 4) return `Settle:${kind}`;
  return `Other:${kind}`;
}

function asPlain(
  body: string,
  hop: string,
  status = 200,
  extra: Record<string, string> = {},
): Response {
  const trimmed = body.startsWith("CON ") || body.startsWith("END ") ? body : `END ${body}`;
  return new Response(trimmed, {
    status,
    headers: {
      "Content-Type": "text/plain",
      "at-ussd-hop-metadata": hop.slice(0, 99).replaceAll("|", "-"),
      "Cache-Control": "no-store",
      ...extra,
    },
  });
}

function limitUssd(request: Request, phone: string) {
  const ip = clientIp(request);
  const byIp = rateLimit(`ussd:ip:${ip}`, RATE.ussdIp.limit, RATE.ussdIp.windowMs);
  if (!byIp.ok) return byIp;
  if (!phone) return byIp;
  const byPhone = rateLimit(
    `ussd:phone:${phone}`,
    RATE.ussdPhone.limit,
    RATE.ussdPhone.windowMs,
  );
  return byPhone.ok ? byIp : byPhone;
}

async function readFields(request: Request): Promise<AtFields> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, string | undefined>;
    return {
      sessionId: json.sessionId || "",
      phoneNumber: json.phoneNumber || "",
      networkCode: json.networkCode || "",
      serviceCode: json.serviceCode || "*384*71618#",
      text: json.text ?? "",
    };
  }
  const raw = await request.text();
  const params = new URLSearchParams(raw);
  return {
    sessionId: params.get("sessionId") || "",
    phoneNumber: params.get("phoneNumber") || "",
    networkCode: params.get("networkCode") || "",
    serviceCode: params.get("serviceCode") || "*384*71618#",
    text: params.get("text") ?? "",
  };
}

export async function GET(request: Request) {
  const limited = limitUssd(request, "health");
  if (!limited.ok) {
    return asPlain(
      "END Try again. You were not charged.",
      "RateLimited:end",
      200,
      rateLimitHeaders(limited),
    );
  }
  return asPlain(`END ${CALLBACK_HELP}`, "Health:end", 200, rateLimitHeaders(limited));
}

export async function POST(request: Request) {
  let fields: AtFields;
  try {
    fields = await readFields(request);
  } catch {
    return asPlain("END Bad request. You were not charged.", "BadRequest:end");
  }

  const phoneNumber = fields.phoneNumber.replace(/\s+/g, "");
  const limited = limitUssd(request, phoneNumber);
  if (!limited.ok) {
    // AT drops the session on HTTP 40x. Stay on 200 with END.
    return asPlain(
      "END Try again. You were not charged.",
      "RateLimited:end",
      200,
      rateLimitHeaders(limited),
    );
  }

  console.log("ussd POST", {
    sessionId: fields.sessionId.slice(0, 12),
    serviceCode: fields.serviceCode,
    text: fields.text,
    ua: request.headers.get("user-agent") || "",
  });
  if (!fields.sessionId || !phoneNumber) {
    // AT terminates on HTTP 40x. Always 200 with END.
    return asPlain("END Bad request. You were not charged.", "BadRequest:end");
  }

  try {
    const body = await handleUssd({
      sessionId: fields.sessionId,
      phoneNumber,
      serviceCode: fields.serviceCode,
      text: fields.text,
    });
    return asPlain(body, hopMetadata(fields.text, body), 200, rateLimitHeaders(limited));
  } catch (error) {
    console.error("ussd callback failed", error instanceof Error ? error.message : "error");
    return asPlain(
      "END Try again. You were not charged.",
      "Error:end",
      200,
      rateLimitHeaders(limited),
    );
  }
}
