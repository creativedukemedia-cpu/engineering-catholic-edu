import Link from "next/link";
import { SimpleContentPage } from "@/components/templates/SimpleContentPage";
import { PROGRAMS } from "@/lib/programs";

export default function GradIndex() {
  const items = PROGRAMS.filter((p) => p.level === "graduate");
  return (
    <SimpleContentPage title="Graduate programs">
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="focus-ring text-catholic-red font-medium">
              {p.name}
            </Link>
          </li>
        ))}
      </ul>
    </SimpleContentPage>
  );
}