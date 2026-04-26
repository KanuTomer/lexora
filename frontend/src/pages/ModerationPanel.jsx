import { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import FileFilters from "../components/FileFilters.jsx";
import FilePreviewModal from "../components/FilePreviewModal.jsx";
import FileSort from "../components/FileSort.jsx";
import PaginationControls from "../components/PaginationControls.jsx";
import {
  approveModerationFile,
  deleteModerationFile,
  getModerationFiles,
  getModerationUsers,
  getReportedModerationFiles,
  getStaleModerationFiles,
  ignoreModerationFile,
  keepModerationFile,
  updateModerationUserPrivilege,
} from "../services/api.js";

export default function ModerationPanel() {
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeQueue, setActiveQueue] = useState("reported");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("reports");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    setPage(1);
    setSortBy(activeQueue === "reported" ? "reports" : "recent");
  }, [activeQueue]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, limit, sortBy]);

  useEffect(() => {
    async function loadFiles() {
      try {
        setError("");
        setIsLoading(true);
        if (activeQueue === "users") {
          setUsers(await getModerationUsers());
          setFiles([]);
          setMeta({ total: 0, page: 1, limit, totalPages: 1 });
          return;
        }
        const params = {
          page,
          limit,
          fileType: activeFilter === "all" ? undefined : activeFilter,
          sort: sortBy,
        };
        const result =
          activeQueue === "reported"
            ? await getReportedModerationFiles(params)
            : activeQueue === "stale"
              ? await getStaleModerationFiles(params)
              : await getModerationFiles(params);
        setFiles(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        console.error("Failed to load moderation files", loadError);
        setError("Failed to load moderation queue");
      } finally {
        setIsLoading(false);
      }
    }

    loadFiles();
  }, [activeFilter, activeQueue, limit, page, sortBy]);

  async function handleApprove(fileId) {
    await approveModerationFile(fileId);
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
  }

  async function handleDelete(fileId) {
    if (!window.confirm("Delete this file from Lexora?")) {
      return;
    }

    await deleteModerationFile(fileId);
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
  }

  async function handleIgnore(fileId) {
    await ignoreModerationFile(fileId);
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
  }

  async function handleKeep(fileId) {
    await keepModerationFile(fileId);
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
  }

  async function handlePrivilegeToggle(user) {
    const nextPrivilege = user.uploadPrivilege === "trusted" ? "restricted" : "trusted";
    const updatedUser = await updateModerationUserPrivilege(user.id, nextPrivilege);
    setUsers((currentUsers) =>
      currentUsers.map((item) => (item.id === updatedUser.id ? updatedUser : item)),
    );
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Moderation" }]} />
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Moderation Panel</h1>
        <p className="mt-1 text-sm text-muted">Review uploaded files without mixing moderation controls into browsing pages.</p>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {[
            { label: "Reported", value: "reported" },
            { label: "Pending", value: "pending" },
            { label: "Stale", value: "stale" },
            { label: "Users", value: "users" },
          ].map((tab) => (
            <button
              key={tab.value}
              className={[
                "h-9 rounded border px-3 text-sm font-medium",
                activeQueue === tab.value
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-line bg-white text-muted hover:bg-surface hover:text-ink",
              ].join(" ")}
              type="button"
              onClick={() => setActiveQueue(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeQueue === "reported" ? (
          <label className="flex items-center gap-2 text-sm text-muted">
            Sort
            <select
              className="h-9 rounded border border-line bg-white px-2 text-sm text-ink outline-none focus:border-blue-600"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="reports">Reports</option>
              <option value="recent">Recent</option>
            </select>
          </label>
        ) : activeQueue === "users" ? null : (
          <FileSort value={sortBy} onChange={setSortBy} />
        )}
      </div>
      {activeQueue !== "users" ? <div className="mb-3">
        <FileFilters activeFilter={activeFilter} onChange={setActiveFilter} />
      </div> : null}

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {isLoading ? (
        <div className="rounded border border-line p-6 text-sm text-muted">Loading files...</div>
      ) : activeQueue === "users" ? (
        <div className="overflow-hidden rounded border border-line">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Username</th>
                <th className="px-3 py-2 font-semibold">Program</th>
                <th className="px-3 py-2 font-semibold">Role</th>
                <th className="px-3 py-2 font-semibold">Upload privilege</th>
                <th className="px-3 py-2 text-right font-semibold" aria-label="User actions"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface">
                  <td className="px-3 py-2 font-medium">{user.username}</td>
                  <td className="px-3 py-2 text-muted">{user.program?.name ?? "-"}</td>
                  <td className="px-3 py-2 text-muted">{user.role}</td>
                  <td className="px-3 py-2 text-muted">{user.uploadPrivilege}</td>
                  <td className="px-3 py-2 text-right">
                    {user.role === "user" ? (
                      <button
                        className="h-8 rounded border border-line bg-white px-3 text-sm font-medium hover:bg-surface"
                        type="button"
                        onClick={() => handlePrivilegeToggle(user)}
                      >
                        Make {user.uploadPrivilege === "trusted" ? "restricted" : "trusted"}
                      </button>
                    ) : (
                      <span className="text-xs text-muted">Always trusted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : files.length === 0 ? (
        <div className="rounded border border-dashed border-line p-6 text-sm text-muted">No files to review</div>
      ) : (
        <div className="overflow-hidden rounded border border-line">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">File</th>
                <th className="px-3 py-2 font-semibold">Subject</th>
                <th className="px-3 py-2 text-right font-semibold">Reports</th>
                <th className="px-3 py-2 text-right font-semibold" aria-label="Moderation actions"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-surface">
                  <td className="px-3 py-2">
                    <button
                      className="font-medium text-blue-700 hover:underline"
                      type="button"
                      onClick={() => setPreviewFile(file)}
                    >
                      {file.title}
                    </button>
                    {file.status === "pending" ? (
                      <span className="ml-2 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                        Pending review
                      </span>
                    ) : null}
                    {file.isStale ? (
                      <span className="ml-2 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">
                        Stale
                      </span>
                    ) : null}
                    <p className="text-xs text-muted">{file.uploadedBy?.name ?? "Unknown user"}</p>
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {file.subject?.subjectCode} - {file.subject?.subjectName}
                  </td>
                  <td className="px-3 py-2 text-right text-muted">
                    <div>{file.reportsCount ?? 0}</div>
                    {activeQueue === "reported" && file.reportReasons?.length ? (
                      <div className="mt-1 text-xs text-muted">
                        <div>Top: {file.topReason ?? "-"}</div>
                        <div>{file.reportReasons.slice(0, 2).join(", ")}</div>
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        className="h-8 rounded border border-line bg-white px-3 text-sm font-medium hover:bg-surface"
                        type="button"
                        onClick={() => handleApprove(file.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="h-8 rounded border border-red-200 bg-white px-3 text-sm font-medium text-red-700 hover:bg-red-50"
                        type="button"
                        onClick={() => handleDelete(file.id)}
                      >
                        Delete
                      </button>
                      {activeQueue === "reported" ? (
                        <button
                          className="h-8 rounded border border-line bg-white px-3 text-sm font-medium hover:bg-surface"
                          type="button"
                          onClick={() => handleIgnore(file.id)}
                        >
                          Ignore
                        </button>
                      ) : null}
                      {activeQueue === "stale" ? (
                        <button
                          className="h-8 rounded border border-line bg-white px-3 text-sm font-medium hover:bg-surface"
                          type="button"
                          onClick={() => handleKeep(file.id)}
                        >
                          Keep
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls
            page={meta.page}
            limit={meta.limit}
            total={meta.total}
            totalPages={meta.totalPages}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>
      )}
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
