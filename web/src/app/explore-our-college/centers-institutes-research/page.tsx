import Link from "next/link";
import { SimpleContentPage } from "@/components/templates/SimpleContentPage";

export default function CentersIndex() {
  return (
    <SimpleContentPage title="Centers, institutes, and research">
      <ul className="space-y-2">
        {[
          [
            "/explore-our-college/centers-institutes-research/center-applied-biomechanics-and-rehabilitation-research-cabrr",
            "CABRR",
          ],
          [
            "/explore-our-college/centers-institutes-research/institute-astrophysics-and-computational-sciences-iacs",
            "IACS",
          ],
          ["/explore-our-college/centers-institutes-research/phaser", "PHaSER"],
          ["/explore-our-college/centers-institutes-research/space-weather-center", "Space Weather"],
        ].map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="focus-ring text-catholic-red font-medium">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </SimpleContentPage>
  );
}