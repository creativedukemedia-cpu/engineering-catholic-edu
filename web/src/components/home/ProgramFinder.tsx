"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FIELDS, PROGRAMS, type ProgramLevel } from "@/lib/programs";

const levels: { value: ProgramLevel | "any"; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "certificate", label: "Certificate" },
  { value: "minor", label: "Minor" },
];

export function ProgramFinder() {
  const [level, setLevel] = useState<ProgramLevel | "any">("any");
  const [field, setField] = useState<string>("Any");

  const results = useMemo(() => {
    return PROGRAMS.filter((p) => {
      if (level !== "any" && p.level !== level) return false;
      if (field !== "Any" && p.field !== field) return false;
      return true;
    }).slice(0, 5);
  }, [level, field]);

  const empty = level === "any" && field === "Any";

  return (
    <div className="rounded-lg border border-catholic-blue/20 bg-limestone p-6">
      <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-catholic-blue">
        Find a program
      </h2>
      <p className="mt-2 max-w-prose text-sm">
        Choose a level, then a field. Results link to pages already on this site.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-catholic-blue">
          Level
          <select
            className="focus-ring mt-1 w-full rounded border border-catholic-blue/30 bg-white px-3 py-2"
            value={level}
            onChange={(e) => setLevel(e.target.value as ProgramLevel | "any")}
          >
            {levels.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-catholic-blue">
          Field
          <select
            className="focus-ring mt-1 w-full rounded border border-catholic-blue/30 bg-white px-3 py-2"
            value={field}
            onChange={(e) => setField(e.target.value)}
          >
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-6 space-y-2" aria-live="polite">
        {empty && (
          <li className="text-sm text-catholic-blue">Choose a level or a field.</li>
        )}
        {!empty && results.length === 0 && (
          <li className="text-sm text-catholic-blue">
            Nothing fits. Clear the filters, or open the full list at Programs &amp;
            Admission.
          </li>
        )}
        {results.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="focus-ring font-medium text-catholic-red hover:underline">
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
      {!empty && (
        <Link
          href="/programs-admission"
          className="focus-ring mt-4 inline-block text-sm font-medium text-catholic-blue underline"
        >
          See all in Programs &amp; Admission
        </Link>
      )}
    </div>
  );
}