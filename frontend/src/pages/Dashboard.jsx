import { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import FileFilters from "../components/FileFilters.jsx";
import FileList from "../components/FileList.jsx";
import FileSort from "../components/FileSort.jsx";
import { useAcademic } from "../context/AcademicContext.jsx";
import { useBookmarks } from "../hooks/useBookmarks.js";
import { deleteFile, getFiles, updateFile } from "../services/api.js";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const { selectedSemester, selectedSemesterId, isLoadingSubjects, subjectError } = useAcademic();
  const { bookmarkedIds, bookmarkError, toggleBookmark } = useBookmarks();

  useEffect(() => {
    setPage(1);
  }, [activeFilter, limit, selectedSemesterId, sortBy]);

  useEffect(() => {
    if (isLoadingSubjects || !selectedSemesterId) {
      setFiles([]);
      return;
    }

    async function loadSemesterFiles() {
      try {
        setError("");
        setIsLoadingFiles(true);
        const result = await getFiles({
          page,
          limit,
          semesterId: selectedSemesterId,
          fileType: activeFilter === "all" ? undefined : activeFilter,
          sort: sortBy,
        });
        setFiles(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        console.error("Failed to fetch files", loadError);
        setError("Failed to load files");
      } finally {
        setIsLoadingFiles(false);
      }
    }

    loadSemesterFiles();
  }, [activeFilter, isLoadingSubjects, limit, page, selectedSemesterId, sortBy]);

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
      <Breadcrumb />
      <div className="mb-5">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Semester {selectedSemester?.number ?? "-"} - Recent files
          </p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <FileFilters activeFilter={activeFilter} onChange={setActiveFilter} />
          <FileSort value={sortBy} onChange={setSortBy} />
        </div>

        {subjectError || error || bookmarkError ? (
          <p className="mb-3 text-sm text-red-600">{subjectError || error || bookmarkError}</p>
        ) : null}
        {isLoadingSubjects || isLoadingFiles ? (
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
          />
        )}
      </section>
    </div>
  );
}
