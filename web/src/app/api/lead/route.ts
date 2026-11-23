import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Records an enquiry from the contact page or the request-information page.
 *
 * Nothing is forwarded to a third party. The client has not confirmed a CRM
 * endpoint yet (see docs/audit/open-questions.md), so a submission is appended
 * to a JSON-lines file the college can export, and the response says so in
 * plain terms. When an endpoint exists, the POST below is the one place to add
 * it.
 *
 * The route is deliberately strict: it re-validates on the server, rejects the
 * honeypot, caps the payload size and never echoes submitted personal data
 * back to the caller.
 */

const MAX_FIELDS = 20;
const MAX_LEN = 2000;

type Payload = {
  intent?: unknown;
  fields?: unknown;
  website?: unknown;
};

function clean(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, MAX_LEN);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Payload | null = null;
  try {
    const raw = await request.text();
    if (raw.length > 64_000) {
      return Response.json({ ok: false, error: "That message is too long." }, { status: 413 });
    }
    body = JSON.parse(raw) as Payload;
  } catch {
    return Response.json({ ok: false, error: "The request was not understood." }, { status: 400 });
  }

  const fields = body?.fields;
  if (!fields || typeof fields !== "object") {
    return Response.json({ ok: false, error: "No message was received." }, { status: 400 });
  }
  const entries = Object.entries(fields as Record<string, unknown>);
  if (entries.length === 0 || entries.length > MAX_FIELDS) {
    return Response.json({ ok: false, error: "The message was not complete." }, { status: 400 });
  }
  // Honeypot: a real person leaves this empty.
  if (clean((fields as Record<string, unknown>).website)) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const values: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (key === "website") continue;
    values[key.replace(/[^\w-]/g, "").slice(0, 40)] = clean(value);
  }

  const email = values.email ?? "";
  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { ok: false, error: "Enter an email address so the college can reply." },
      { status: 422 },
    );
  }
  if (!values.firstName && !values.lastName && !values.name) {
    return Response.json(
      { ok: false, error: "Add your name so the college knows who to reply to." },
      { status: 422 },
    );
  }

  const record = {
    receivedAt: new Date().toISOString(),
    intent: clean(body?.intent).slice(0, 60) || "general",
    values,
  };

  let stored = false;
  const dir = path.join(process.cwd(), "data");
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      path.join(dir, "leads.jsonl"),
      `${JSON.stringify(record)}\n`,
      "utf8",
    );
    stored = true;
  } catch {
    // A read-only filesystem (a static export or a locked container) is not the
    // user's problem, but pretending the record exists would be dishonest.
    stored = false;
  }

  console.log("[lead]", record.intent, email, stored ? "stored" : "not stored");

  if (!stored) {
    return Response.json(
      {
        ok: false,
        error:
          "This message could not be saved right now. Please email cua-engineer@cua.edu or call 202-319-5160.",
      },
      { status: 503 },
    );
  }

  return Response.json({ ok: true, stored: true });
}
