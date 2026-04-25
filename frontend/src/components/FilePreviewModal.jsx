import { useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { getFileUrl } from "../services/api.js";

export default function FilePreviewModal({ file, onClose }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const previewUrl = useMemo(() => {
    const url = getFileUrl(file?.fileUrl);
    return url ? `${url}#toolbar=0` : null;
  }, [file?.fileUrl]);

  if (!file) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded border border-line bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{file.title}</h2>
            <p className="mt-1 text-sm text-muted">
              {file.subject?.subjectCode ? `${file.subject.subjectCode} - ` : ""}
              {file.subject?.subjectName ?? "Preview"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center gap-2 rounded border border-line bg-white px-3 text-sm font-medium hover:bg-surface"
              type="button"
              onClick={() => window.open(getFileUrl(file.fileUrl), "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open in new tab
            </button>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-line bg-white text-muted hover:bg-surface"
              type="button"
              onClick={onClose}
              aria-label="Close preview"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="bg-surface p-5">
          {previewUrl && !previewFailed ? (
            <iframe
              title={file.title}
              src={previewUrl}
              className="h-[70vh] w-full rounded border border-line bg-white"
              onError={() => setPreviewFailed(true)}
            />
          ) : (
            <div className="flex h-[70vh] flex-col items-center justify-center rounded border border-dashed border-line bg-white p-6 text-center">
              <p className="text-base font-medium text-ink">Preview unavailable</p>
              <p className="mt-2 max-w-md text-sm text-muted">
                This file could not be embedded here, but it can still be opened in a new tab.
              </p>
              <button
                className="mt-4 inline-flex h-9 items-center gap-2 rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-800"
                type="button"
                onClick={() => window.open(getFileUrl(file.fileUrl), "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
