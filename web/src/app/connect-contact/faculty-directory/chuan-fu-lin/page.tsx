import { SimpleContentPage } from "@/components/templates/SimpleContentPage";

export default function FacultyLinPage() {
  return (
    <SimpleContentPage title="Chuan-Fu Lin" lead="Associate Professor, Mechanical Engineering">
      <p className="max-w-prose">
        Chuan-Fu Lin joined the faculty of the College of Engineering, Physics, and Computing’s
        Department of Mechanical Engineering in August 2019. His research includes energy storage
        materials and the Materials Innovation Laboratory for Energy and Advanced Manufacturing.
      </p>
      <dl className="mt-6 space-y-2 text-sm">
        <div>
          <dt className="font-semibold text-catholic-blue">Email</dt>
          <dd>Use the live directory email. [VERIFY]</dd>
        </div>
        <div>
          <dt className="font-semibold text-catholic-blue">Location</dt>
          <dd>306 Pangborn Hall</dd>
        </div>
      </dl>
    </SimpleContentPage>
  );
}