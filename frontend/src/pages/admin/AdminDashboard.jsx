import { useState } from "react";
import { Link } from "react-router-dom";
import { importAdminAcademicData } from "../../services/api.js";

const sampleImport = `{
  "college": {
    "name": "Gautam Buddha University",
    "slug": "gbu"
  },
  "courses": [
    {
      "name": "B.Tech Computer Science and Engineering",
      "code": "BTECH-CSE",
      "semesters": [
        {
          "number": 4,
          "subjects": [
            { "code": "CS204", "name": "DBMS" },
            { "code": "CS206", "name": "Java" }
          ]
        }
      ]
    }
  ]
}`;

export default function AdminDashboard() {
  const [jsonText, setJsonText] = useState(sampleImport);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleImport(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      setIsSubmitting(true);
      const payload = JSON.parse(jsonText);
      const result = await importAdminAcademicData(payload);
      setMessage(
        `Imported ${result.summary.courses} courses, ${result.summary.semesters} semesters, and ${result.summary.subjects} subjects.`,
      );
    } catch (importError) {
      console.error("Import failed", importError);
      setError(importError.response?.data?.message ?? importError.message ?? "Import failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Admin Overview</h1>
        <p className="mt-1 text-sm text-muted">Manage academic data without entering the normal student workspace.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link className="rounded border border-line bg-white p-4 hover:bg-surface" to="/admin/users">Manage users</Link>
        <Link className="rounded border border-line bg-white p-4 hover:bg-surface" to="/admin/colleges">Manage colleges</Link>
        <Link className="rounded border border-line bg-white p-4 hover:bg-surface" to="/admin/subjects">Manage subjects</Link>
      </div>

      <form className="rounded border border-line bg-white p-4" onSubmit={handleImport}>
        <h2 className="font-semibold">Bulk academic import</h2>
        <p className="mt-1 text-sm text-muted">Paste JSON to upsert one college, its courses, semesters, and subjects.</p>
        {message ? <p className="mt-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <textarea
          className="mt-3 h-80 w-full rounded border border-line p-3 font-mono text-xs outline-none focus:border-blue-600"
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
        />
        <button
          className="mt-3 rounded border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Importing..." : "Import JSON"}
        </button>
      </form>
    </div>
  );
}
