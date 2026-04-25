import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import FileFilters from "../components/FileFilters.jsx";
import FileList from "../components/FileList.jsx";
import FileSort from "../components/FileSort.jsx";
import { useAcademic } from "../context/AcademicContext.jsx";
import { useBookmarks } from "../hooks/useBookmarks.js";
import { deleteFile, getFilesBySubject, updateFile } from "../services/api.js";

export default function SubjectPage() {
  const { subjectId } = useParams();
  const [activeTab, setActiveTab] = useState("all");
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const { subjects, isLoadingSubjects, setSelectedSemesterId } = useAcademic();
  const { bookmarkedIds, bookmarkError, toggleBookmark } = useBookmarks();
  const subject = subjects.find((item) => item.id === subjectId) ?? null;

  useEffect(() => {
    const message = sessionStorage.getItem("uploadSuccessMessage");
    if (message) {
      setSuccessMessage(message);
      sessionStorage.removeItem("uploadSuccessMessage");
    }
  }, []);

  useEffect(() => {
    if (subject?.semesterId) {
      setSelectedSemesterId(subject.semesterId);
    }
  }, [setSelectedSemesterId, subject?.semesterId]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, limit, sortBy, subjectId]);

  useEffect(() => {
    async function loadFiles() {
      try {
        setError("");
        setIsLoading(true);
        const result = await getFilesBySubject(subjectId, {
          page,
          limit,
          fileType: activeTab === "all" ? undefined : activeTab,
          sort: sortBy,
        });
        setFiles(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        console.error("Failed to fetch subject files", loadError);
        setError("Failed to load files");
      } finally {
        setIsLoading(false);
      }
    }

    loadFiles();
  }, [activeTab, limit, page, sortBy, subjectId]);

  function handleDownload(updatedFile) {
    setFiles((currentFiles) =>
      currentFiles.map((file) => (file.id === updatedFile.id ? updatedFile : file)),
    );
  }

  async function handleUpdateFile(fileId, payload) {
    const updatedFile = await updateFile(fileId, payload);
    setFiles((currentFiles) =>
      currentFiles.map((file) => (file.id === updatedFile.id ? updatedFile : file)),
    );
  }

  async function handleDeleteFile(fileId) {
    await deleteFile(fileId);
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: `Semester ${subject?.semester?.number ?? ""}` },
          { label: subject?.subjectCode ?? "Subject" },
        ]}
      />
      <div className="mb-5">
        <p className="font-mono text-sm text-muted">{subject?.subjectCode ?? "Loading"}</p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{subject?.subjectName ?? "Subject"}</h1>
            <p className="mt-1 text-sm text-muted">
              Semester {subject?.semester?.number ?? ""} files are grouped by academic category for faster scanning.
            </p>
          </div>
          <Link
            className="inline-flex h-9 items-center rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-800"
            to={`/upload?subjectId=${subjectId}`}
          >
            Upload
          </Link>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <FileFilters activeFilter={activeTab} onChange={setActiveTab} />
        <FileSort value={sortBy} onChange={setSortBy} />
      </div>
      {successMessage ? (
        <p className="mb-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </p>
      ) : null}
      {error || bookmarkError ? <p className="mb-3 text-sm text-red-600">{error || bookmarkError}</p> : null}
      {isLoading || isLoadingSubjects ? (
        <div className="rounded border border-line p-6 text-sm text-muted">Loading files...</div>
      ) : (
        <FileList
          bookmarkedIds={bookmarkedIds}
          files={files}
          onDownload={handleDownload}
          onUpdateFile={handleUpdateFile}
          onDeleteFile={handleDeleteFile}
          onToggleBookmark={toggleBookmark}
          pagination={{
            page: meta.page,
            limit: meta.limit,
            total: meta.total,
            totalPages: meta.totalPages,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
          variant="subject"
        />
      )}
    </div>
  );
}
