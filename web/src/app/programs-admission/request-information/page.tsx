import { SimpleContentPage } from "@/components/templates/SimpleContentPage";

export default function RequestInfoPage() {
  return (
    <SimpleContentPage
      title="Request information"
      lead="Tell us which program you want. An admission counselor will follow up."
      cta={{ label: "Submit request", href: "#" }}
    >
      <form className="max-w-lg space-y-4" aria-labelledby="request-heading">
        <h2 id="request-heading" className="sr-only">
          Request information form
        </h2>
        <label className="block text-sm font-medium text-catholic-blue">
          Name
          <input type="text" name="name" className="focus-ring mt-1 w-full rounded border border-catholic-blue/30 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-catholic-blue">
          Email
          <input type="email" name="email" className="focus-ring mt-1 w-full rounded border border-catholic-blue/30 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-catholic-blue">
          Program interest
          <input type="text" name="program" className="focus-ring mt-1 w-full rounded border border-catholic-blue/30 px-3 py-2" />
        </label>
        <p className="text-xs text-catholic-blue">
          Wire this form to the university CRM when you deploy. Manus or the web team should replace the # action.
        </p>
      </form>
    </SimpleContentPage>
  );
}