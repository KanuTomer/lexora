import { Github, Mail } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb.jsx";

const contacts = [
  { label: "Creator", name: "Kanu Tomer", email: "kanutomer123@gmail.com" },
  { label: "Contributor", name: "Vaarunya Tomer", email: "vaarunyatomer@gmail.com" },
];

export default function ContactPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Contact" }]} />
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Contact Lexora</h1>
        <p className="mt-1 text-sm text-muted">Use this page to report bugs, broken workflows, data issues, or other problems you face while using the site.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {contacts.map((contact) => (
          <section key={contact.email} className="rounded border border-line bg-white p-4">
            <p className="text-xs font-semibold uppercase text-muted">{contact.label}</p>
            <h2 className="mt-2 text-lg font-semibold">{contact.name}</h2>
            <a className="mt-3 inline-flex items-center gap-2 text-sm text-blue-700 hover:underline" href={`mailto:${contact.email}`}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              {contact.email}
            </a>
          </section>
        ))}
      </div>

      <section className="mt-4 rounded border border-line bg-white p-4">
        <p className="text-xs font-semibold uppercase text-muted">Project repository</p>
        <a className="mt-3 inline-flex items-center gap-2 text-sm text-blue-700 hover:underline" href="https://github.com/KanuTomer/lexora" target="_blank" rel="noreferrer">
          <Github className="h-4 w-4" aria-hidden="true" />
          github.com/KanuTomer/lexora
        </a>
      </section>
    </div>
  );
}
