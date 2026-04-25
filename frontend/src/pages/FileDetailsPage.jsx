import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { getFileById, getFileUrl, incrementDownload } from "../services/api.js";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "-";
  }

  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

export default function FileDetailsPage() {
  const { fileId } = useParams();
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFile() {
      try {
        setError("");
        setIsLoading(true);
        const data = await getFileById(fileId);
        setFile(data);
      } catch (loadError) {
        console.error("Failed to fetch file details", loadError);
        setError("Could not load this file.");
      } finally {
        setIsLoading(false);
      }
    }

    loadFile();
  }, [fileId]);

  async function handleDownload() {
    if (!file) {
      return;
    }

    try {
      const updatedFile = await incrementDownload(file.id);
      setFile(updatedFile);
      window.open(getFileUrl(updatedFile.fileUrl), "_blank", "noopener,noreferrer");
    } catch (downloadError) {
      console.error("Failed to download file", downloadError);
      window.open(getFileUrl(file.fileUrl), "_blank", "noopener,noreferrer");
    }
  }

  if (isLoading) {
    return <div className="rounded border border-line p-6 text-sm text-muted">Loading file...</div>;
  }

  if (error || !file) {
    return <div className="rounded border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  return (
    <div className="max-w-4xl">
      <Breadcrumb
        items={[
          { label: `Semester ${file.subject?.semester?.number ?? ""}` },
          {
            label: `${file.subject?.subjectCode ?? ""} ${file.subject?.subjectName ?? ""}`,
            to: `/subjects/${file.subjectId}`,
          },
          { label: file.title },
        ]}
      />
      <div className="mb-5">
        <p className="text-sm text-muted">{file.fileType}</p>
        <h1 className="text-2xl font-semibold">{file.title}</h1>
      </div>

      <div className="overflow-hidden rounded border border-line">
        <dl className="divide-y divide-line text-sm">
          <div className="grid grid-cols-[160px_1fr]">
            <dt className="bg-surface px-3 py-2 font-medium text-muted">Subject</dt>
            <dd className="px-3 py-2">
              {file.subject?.subjectCode} - {file.subject?.subjectName}
            </dd>
          </div>
          <div className="grid grid-cols-[160px_1fr]">
            <dt className="bg-surface px-3 py-2 font-medium text-muted">Semester</dt>
            <dd className="px-3 py-2">Semester {file.subject?.semester?.number ?? "-"}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr]">
            <dt className="bg-surface px-3 py-2 font-medium text-muted">Uploaded by</dt>
            <dd className="px-3 py-2">{file.uploadedBy?.name ?? "-"}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr]">
            <dt className="bg-surface px-3 py-2 font-medium text-muted">Updated</dt>
            <dd className="px-3 py-2">{formatDate(file.updatedAt)}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr]">
            <dt className="bg-surface px-3 py-2 font-medium text-muted">Size</dt>
            <dd className="px-3 py-2">{formatBytes(file.size)}</dd>
          </div>
          <div className="grid grid-cols-[160px_1fr]">
            <dt className="bg-surface px-3 py-2 font-medium text-muted">Downloads</dt>
            <dd className="px-3 py-2">{file.downloads}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="inline-flex h-9 items-center gap-2 rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white"
          type="button"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download
        </button>
      </div>
    </div>
  );
}
