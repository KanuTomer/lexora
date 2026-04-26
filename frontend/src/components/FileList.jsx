import { Download, Flag, Pencil, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import PaginationControls from "./PaginationControls.jsx";
import FilePreviewModal from "./FilePreviewModal.jsx";
import { getFileUrl, incrementDownload, reportFile } from "../services/api.js";

const typeLabels = {
  notes: "Notes",
  assignment: "Assignment",
  "test-paper": "Test Paper",
  syllabus: "Syllabus",
};

const reportReasons = ["Spam", "Wrong subject", "Duplicate", "Inappropriate"];

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "-";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function FileList({
  files = [],
  bookmarkedIds = new Set(),
  onDownload,
  onUpdateFile,
  onDeleteFile,
  onToggleBookmark,
  emptyMessage = "No files yet — be the first to upload",
  pagination,
  variant = "dashboard",
}) {
  const [editingFile, setEditingFile] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editFileType, setEditFileType] = useState("notes");
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [reportingFile, setReportingFile] = useState(null);
  const [reportReason, setReportReason] = useState(reportReasons[0]);
  const [reportError, setReportError] = useState("");
  const [reportedIds, setReportedIds] = useState(() => new Set(JSON.parse(localStorage.getItem("reportedFileIds") ?? "[]")));
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const showSubjectColumn = variant !== "subject";
  const currentUserId = localStorage.getItem("userId");
  const showOwnerActions = Boolean(currentUserId && (onUpdateFile || onDeleteFile));

  async function handleOpenFile(file) {
    if (!localStorage.getItem("token")) {
      window.open(getFileUrl(file.fileUrl), "_blank", "noopener,noreferrer");
      return;
    }

    try {
      const updatedFile = await incrementDownload(file.id);
      onDownload?.(updatedFile);
      window.open(getFileUrl(updatedFile.fileUrl || file.fileUrl), "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open file", error);
      window.open(getFileUrl(file.fileUrl), "_blank", "noopener,noreferrer");
    }
  }

  function openPreview(event, file) {
    event.stopPropagation();
    setPreviewFile(file);
  }

  function handleBookmarkClick(event, file) {
    event.stopPropagation();
    onToggleBookmark?.(file);
  }

  function openEditModal(event, file) {
    event.stopPropagation();
    setEditingFile(file);
    setEditTitle(file.title);
    setEditFileType(file.fileType);
    setEditError("");
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    setEditError("");

    if (!editTitle.trim()) {
      setEditError("Title is required.");
      return;
    }

    try {
      setIsSavingEdit(true);
      await onUpdateFile?.(editingFile.id, {
        title: editTitle.trim(),
        fileType: editFileType,
      });
      setEditingFile(null);
    } catch (error) {
      console.error("Failed to update file", error);
      setEditError(error.response?.data?.message ?? "Could not update file.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeleteClick(event, file) {
    event.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      await onDeleteFile?.(file.id);
    } catch (error) {
      console.error("Failed to delete file", error);
      window.alert(error.response?.data?.message ?? "Could not delete file.");
    }
  }

  function openReportModal(event, file) {
    event.stopPropagation();
    setReportingFile(file);
    setReportReason(reportReasons[0]);
    setReportError("");
  }

  async function handleReportSubmit(event) {
    event.preventDefault();
    setReportError("");

    try {
      setIsSubmittingReport(true);
      await reportFile({ fileId: reportingFile.id, reason: reportReason });
      setReportedIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(reportingFile.id);
        localStorage.setItem("reportedFileIds", JSON.stringify(Array.from(nextIds)));
        return nextIds;
      });
      setReportingFile(null);
    } catch (error) {
      console.error("Failed to report file", error);
      setReportError(error.response?.data?.message ?? "Could not report file.");
    } finally {
      setIsSubmittingReport(false);
    }
  }

  if (files.length === 0) {
    return (
      <div className="rounded border border-dashed border-line p-6 text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-line">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-surface text-left text-xs uppercase text-muted">
          <tr>
            {showSubjectColumn ? <th className="px-3 py-2 font-semibold">Subject</th> : null}
            <th className="px-3 py-2 font-semibold">File name</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold">Owner</th>
            <th className="px-3 py-2 font-semibold">Updated</th>
            <th className="px-3 py-2 font-semibold">Size</th>
            <th className="px-3 py-2 text-right font-semibold" aria-label="Downloads"></th>
            {showOwnerActions ? <th className="w-20 px-3 py-2 text-right font-semibold" aria-label="File actions"></th> : null}
            <th className="w-20 px-3 py-2 text-right font-semibold" aria-label="Bookmark and report"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {files.map((file) => (
            <tr
              key={file.id}
              className="cursor-pointer hover:bg-surface"
              onClick={() => handleOpenFile(file)}
            >
              {showSubjectColumn ? (
                <td className="px-3 py-2 font-mono text-xs">{file.subject?.subjectCode ?? "-"}</td>
              ) : null}
              <td className="px-3 py-2">
                <button
                  className="font-medium text-blue-700 hover:underline"
                  type="button"
                  onClick={(event) => openPreview(event, file)}
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
              </td>
              <td className="px-3 py-2 text-muted">{typeLabels[file.fileType] ?? file.fileType}</td>
              <td className="px-3 py-2 text-muted">
                <span className="inline-flex items-center gap-2">
                  {file.uploadedById ? (
                    <Link
                      className="text-blue-700 hover:underline"
                      to={`/profile/${file.uploadedById}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {file.uploadedBy?.name || file.uploadedBy?.username || "User"}
                    </Link>
                  ) : (
                    "-"
                  )}
                  {file.uploadedById === currentUserId ? (
                    <span className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                      You
                    </span>
                  ) : null}
                  {file.uploadedBy?.role === "moderator" ? (
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                      Mod
                    </span>
                  ) : null}
                </span>
              </td>
              <td className="px-3 py-2 text-muted">{formatDate(file.updatedAt)}</td>
              <td className="px-3 py-2 text-muted">{formatBytes(file.size)}</td>
              <td className="px-3 py-2 text-right">
                <span className="inline-flex items-center justify-end gap-1 text-muted">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {file.downloads}
                </span>
              </td>
              {showOwnerActions ? (
                <td className="px-3 py-2 text-right">
                  {file.uploadedById === currentUserId ? (
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-white hover:text-blue-700"
                        type="button"
                        aria-label="Edit file"
                        onClick={(event) => openEditModal(event, file)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-white hover:text-red-700"
                        type="button"
                        aria-label="Delete file"
                        onClick={(event) => handleDeleteClick(event, file)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </td>
              ) : null}
              <td className="px-3 py-2 text-right">
                <div className="inline-flex items-center justify-end gap-1">
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-white hover:text-blue-700"
                    type="button"
                    aria-label={bookmarkedIds.has(file.id) ? "Remove bookmark" : "Add bookmark"}
                    onClick={(event) => handleBookmarkClick(event, file)}
                  >
                    <Star
                      className="h-4 w-4"
                      fill={bookmarkedIds.has(file.id) ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-white hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    aria-label={reportedIds.has(file.id) ? "File reported" : "Report file"}
                    disabled={reportedIds.has(file.id)}
                    onClick={(event) => openReportModal(event, file)}
                  >
                    <Flag className="h-4 w-4" fill={reportedIds.has(file.id) ? "currentColor" : "none"} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagination ? <PaginationControls {...pagination} /> : null}
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      {editingFile ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-file-title"
          onClick={() => setEditingFile(null)}
        >
          <form
            className="w-full max-w-md rounded border border-line bg-white p-4 shadow-lg"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleEditSubmit}
          >
            <h2 id="edit-file-title" className="text-lg font-semibold">
              Edit file
            </h2>
            {editError ? (
              <p className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {editError}
              </p>
            ) : null}
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="edit-title">
                  Title
                </label>
                <input
                  id="edit-title"
                  className="h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="edit-file-type">
                  Category
                </label>
                <select
                  id="edit-file-type"
                  className="h-10 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-blue-600"
                  value={editFileType}
                  onChange={(event) => setEditFileType(event.target.value)}
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
              <button
                className="h-9 rounded border border-line bg-white px-3 text-sm font-medium hover:bg-surface"
                type="button"
                onClick={() => setEditingFile(null)}
              >
                Cancel
              </button>
              <button
                className="h-9 rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSavingEdit}
              >
                {isSavingEdit ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {reportingFile ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-file-title"
          onClick={() => setReportingFile(null)}
        >
          <form
            className="w-full max-w-md rounded border border-line bg-white p-4 shadow-lg"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleReportSubmit}
          >
            <h2 id="report-file-title" className="text-lg font-semibold">Report file</h2>
            <p className="mt-1 text-sm text-muted">{reportingFile.title}</p>
            {reportError ? (
              <p className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{reportError}</p>
            ) : null}
            <div className="mt-4 space-y-2">
              {reportReasons.map((reason) => (
                <label key={reason} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(event) => setReportReason(event.target.value)}
                  />
                  {reason}
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
              <button className="h-9 rounded border border-line bg-white px-3 text-sm font-medium hover:bg-surface" type="button" onClick={() => setReportingFile(null)}>Cancel</button>
              <button className="h-9 rounded border border-red-700 bg-red-700 px-3 text-sm font-medium text-white disabled:opacity-60" type="submit" disabled={isSubmittingReport}>
                {isSubmittingReport ? "Reporting..." : "Submit report"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
