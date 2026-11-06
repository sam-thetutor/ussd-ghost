import { handleUssd } from "@/lib/ussd-engine";

async function readFields(request: Request): Promise<{
  sessionId: string;
  phoneNumber: string;
  serviceCode: string;
  text: string;
}> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, string>;
    return {
      sessionId: json.sessionId || "",
      phoneNumber: json.phoneNumber || "",
      serviceCode: json.serviceCode || "*384*71#",
      text: json.text ?? "",
    };
  }
  const raw = await request.text();
  const params = new URLSearchParams(raw);
  return {
    sessionId: params.get("sessionId") || "",
    phoneNumber: params.get("phoneNumber") || "",
    serviceCode: params.get("serviceCode") || "*384*71#",
    text: params.get("text") ?? "",
  };
}

export async function POST(request: Request) {
  const fields = await readFields(request);
  if (!fields.sessionId || !fields.phoneNumber) {
    return new Response("END Bad request", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const body = await handleUssd(fields);
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
