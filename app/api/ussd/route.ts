import { handleUssd } from "@/lib/ussd-engine";

export const maxDuration = 15;

const CALLBACK_HELP = [
  "USSD Ghost Africa's Talking callback.",
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
  if (text === "1") return `EnterTill:${kind}`;
  if (text === "2") return `Balance:${kind}`;
  if (text === "3") return `Statement:${kind}`;
  if (text === "0") return `Exit:${kind}`;
  const parts = text.split("*");
  if (parts[0] === "1" && parts.length === 2) return `EnterAmount:${kind}`;
  if (parts[0] === "1" && parts.length === 3) return `EnterPin:${kind}`;
  if (parts[0] === "1" && parts.length >= 4) return `Settle:${kind}`;
  return `Other:${kind}`;
}

function asPlain(body: string, hop: string, status = 200): Response {
  const trimmed = body.startsWith("CON ") || body.startsWith("END ") ? body : `END ${body}`;
  return new Response(trimmed, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "at-ussd-hop-metadata": hop.slice(0, 99).replaceAll("|", "-"),
      "Cache-Control": "no-store",
    },
  });
}

async function readFields(request: Request): Promise<AtFields> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, string | undefined>;
    return {
      sessionId: json.sessionId || "",
      phoneNumber: json.phoneNumber || "",
      networkCode: json.networkCode || "",
      serviceCode: json.serviceCode || "*384*71#",
      text: json.text ?? "",
    };
  }
  const raw = await request.text();
  const params = new URLSearchParams(raw);
  return {
    sessionId: params.get("sessionId") || "",
    phoneNumber: params.get("phoneNumber") || "",
    networkCode: params.get("networkCode") || "",
    serviceCode: params.get("serviceCode") || "*384*71#",
    text: params.get("text") ?? "",
  };
}

export async function GET() {
  return asPlain(`END ${CALLBACK_HELP}`, "Health:end");
}

export async function POST(request: Request) {
  let fields: AtFields;
  try {
    fields = await readFields(request);
  } catch {
    return asPlain("END Bad request. You were not charged.", "BadRequest:end");
  }

  const phoneNumber = fields.phoneNumber.replace(/\s+/g, "");
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
    return asPlain(body, hopMetadata(fields.text, body));
  } catch (error) {
    console.error("ussd callback failed", error instanceof Error ? error.message : "error");
    return asPlain("END Try again. You were not charged.", "Error:end");
  }
}
