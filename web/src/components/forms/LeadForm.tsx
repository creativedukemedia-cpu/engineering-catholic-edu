"use client";

import { useRef, useState } from "react";

/**
 * The college's enquiry form.
 *
 * Validation runs in the browser before anything is sent, and every error is
 * announced: the field gets aria-invalid, the message is linked with
 * aria-describedby, and focus moves to the first field that failed. The form
 * posts to this site only. It is not wired to a CRM until the client confirms
 * the endpoint, so the page also shows the direct email address.
 */

export type LeadField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select" | "textarea";
  required?: boolean;
  options?: string[];
  autoComplete?: string;
  help?: string;
  wide?: boolean;
};

type Errors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TEL_RE = /^[\d\s()+.-]{7,20}$/;

function validate(fields: LeadField[], values: Record<string, string>): Errors {
  const errors: Errors = {};
  for (const f of fields) {
    const v = (values[f.name] ?? "").trim();
    if (f.required && !v) {
      errors[f.name] = `${f.label} is required.`;
      continue;
    }
    if (!v) continue;
    if (f.type === "email" && !EMAIL_RE.test(v)) {
      errors[f.name] = "Enter an email address like name@example.com.";
    }
    if (f.type === "tel" && !TEL_RE.test(v)) {
      errors[f.name] = "Enter a phone number using digits, spaces or dashes.";
    }
    if (f.type === "text" && v.length > 120) {
      errors[f.name] = "Keep this to one line.";
    }
    if (f.name === "message" && v.length < 10) {
      errors[f.name] = "Add a little more detail so the college can answer well.";
    }
  }
  return errors;
}

const inputBase =
  "h-11 w-full rounded-sm border bg-white px-3 text-base text-black placeholder:text-black/45";
const ok = "border-black/30 focus-ring";
const bad = "border-catholic-red border-2 focus-ring";

export function LeadForm({
  fields,
  endpoint = "/api/lead",
  intent,
  successTitle = "Thank you",
  submitLabel = "Send message",
}: {
  fields: LeadField[];
  endpoint?: string;
  intent: string;
  successTitle?: string;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [detail, setDetail] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const shown: Errors = {};
  for (const f of fields) if (touched[f.name] && errors[f.name]) shown[f.name] = errors[f.name];

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (touched[name]) {
      setErrors(validate(fields, { ...values, [name]: value }));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const all = validate(fields, values);
    setErrors(all);
    setTouched(Object.fromEntries(fields.map((f) => [f.name, true])));
    const firstBad = fields.find((f) => all[f.name]);
    if (firstBad) {
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${firstBad.name}"]`);
      el?.focus();
      statusRef.current?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, fields: values }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setState("sent");
        setDetail("");
        setValues({});
        setTouched({});
      } else {
        setState("failed");
        setDetail(data.error ?? "The message could not be recorded. Please try again.");
      }
    } catch {
      setState("failed");
      setDetail("The network did not respond. Please try again or email the college.");
    }
    statusRef.current?.focus();
  }

  if (state === "sent") {
    return (
      <div
        role="status"
        tabIndex={-1}
        className="rounded-sm border-l-4 border-catholic-red bg-limestone p-6"
      >
        <h3 className="font-[family-name:var(--font-headline)] text-xl font-bold text-catholic-blue">
          {successTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed">
          Your message has been recorded by the college&rsquo;s enquiry system. A member of
          the team follows up by email.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-4 inline-flex min-h-11 items-center rounded-full border-2 border-catholic-blue px-5 text-sm text-catholic-blue hover:bg-catholic-blue hover:text-white focus-ring"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot: people never see it, form-spam bots always fill it in. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="lead-website">Website</label>
        <input
          id="lead-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website ?? ""}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => {
          const err = shown[f.name];
          const id = `lead-${f.name}`;
          const descId = err ? `lead-${f.name}-error` : f.help ? `lead-${f.name}-help` : undefined;
          const common = {
            id,
            name: f.name,
            autoComplete: f.autoComplete,
            required: f.required,
            "aria-invalid": err ? true : undefined,
            "aria-describedby": descId,
          };
          return (
            <div key={f.name} className={f.wide ? "sm:col-span-2" : ""}>
              <label htmlFor={id} className="mb-1 block text-sm font-semibold text-catholic-blue">
                {f.label}
                {f.required ? (
                  <span aria-hidden="true" className="ml-1 text-catholic-red">
                    *
                  </span>
                ) : (
                  <span className="ml-1 text-xs font-normal text-black/55">(optional)</span>
                )}
              </label>
              {f.help ? (
                <p id={`${id}-help`} className="mb-1 text-xs text-black/60">
                  {f.help}
                </p>
              ) : null}
              {f.type === "select" ? (
                <select
                  {...common}
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
                  className={`${inputBase} ${err ? bad : ok}`}
                >
                  <option value="">Select one</option>
                  {(f.options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  {...common}
                  rows={5}
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
                  className={`${inputBase.replace("h-11", "min-h-32")} py-2 leading-relaxed ${
                    err ? bad : ok
                  }`}
                />
              ) : (
                <input
                  {...common}
                  type={f.type}
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
                  className={`${inputBase} ${err ? bad : ok}`}
                />
              )}
              {err ? (
                <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-catholic-red">
                  {err}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {state === "failed" ? (
        <p
          role="alert"
          className="rounded-sm border-l-4 border-catholic-red bg-limestone p-4 text-sm font-semibold text-catholic-blue"
        >
          {detail}
        </p>
      ) : null}

      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="text-sm outline-none"
      >
        {state === "sending" ? "Sending your message..." : ""}
      </div>

      <p className="text-xs leading-relaxed text-black/60">
        Required fields are marked with an asterisk. The college uses what you send only to
        answer your question.
      </p>

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-catholic-red px-7 text-[15px] font-medium text-white transition-colors hover:bg-white hover:text-catholic-red disabled:opacity-60 focus-ring"
      >
        {state === "sending" ? "Sending" : submitLabel}
      </button>
    </form>
  );
}
