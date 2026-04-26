import { useEffect, useState } from "react";
import Avatar from "../components/Avatar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { getCourseModerators } from "../services/api.js";

export default function ModeratorsPage() {
  const [moderators, setModerators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadModerators() {
      try {
        setError("");
        setIsLoading(true);
        setModerators(await getCourseModerators());
      } catch (loadError) {
        console.error("Failed to load course moderators", loadError);
        setError(loadError.response?.data?.message ?? "Failed to load moderators");
      } finally {
        setIsLoading(false);
      }
    }

    loadModerators();
  }, []);

  return (
    <div>
      <Breadcrumb items={[{ label: "Moderators" }]} />
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Course moderators</h1>
        <p className="mt-1 text-sm text-muted">Contact your course moderators for upload reviews, stale files, and subject-level issues.</p>
      </div>

      {error ? <p className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {isLoading ? (
        <div className="rounded border border-line p-6 text-sm text-muted">Loading moderators...</div>
      ) : moderators.length === 0 ? (
        <div className="rounded border border-line p-6 text-sm text-muted">No moderators have been assigned to your course yet.</div>
      ) : (
        <div className="overflow-hidden rounded border border-line bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-surface text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Moderator</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Program</th>
              </tr>
            </thead>
            <tbody>
              {moderators.map((moderator) => (
                <tr key={moderator.id} className="border-t border-line">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={moderator} size="sm" />
                      <div>
                        <p className="font-medium text-ink">{moderator.name || moderator.username}</p>
                        <p className="text-xs text-muted">@{moderator.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <a className="text-blue-700 hover:underline" href={`mailto:${moderator.email}`}>{moderator.email}</a>
                  </td>
                  <td className="px-3 py-3 text-muted">{moderator.program?.name ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
