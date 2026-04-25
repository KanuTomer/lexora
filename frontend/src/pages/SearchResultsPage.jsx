import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import FileList from "../components/FileList.jsx";
import FileSort from "../components/FileSort.jsx";
import { useBookmarks } from "../hooks/useBookmarks.js";
import { deleteFile, searchFiles, updateFile } from "../services/api.js";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const { bookmarkedIds, bookmarkError, toggleBookmark } = useBookmarks();

  useEffect(() => {
    setPage(1);
  }, [limit, query, sortBy]);

  useEffect(() => {
    async function loadResults() {
      if (!query) {
        setFiles([]);
        setMeta({ total: 0, page: 1, limit, totalPages: 1 });
        return;
      }

      try {
        setError("");
        setIsLoading(true);
        const result = await searchFiles({ q: query, page, limit, sort: sortBy });
        setFiles(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        console.error("Failed to search files", loadError);
        setError("Failed to load search results");
      } finally {
        setIsLoading(false);
      }
    }

    loadResults();
  }, [limit, page, query, sortBy]);

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
      <Breadcrumb items={[{ label: "Search" }]} />
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Search results</h1>
          <p className="mt-1 text-sm text-muted">
            {query ? `Showing results for "${query}"` : "Enter a search term in the top bar"}
          </p>
        </div>
        <FileSort value={sortBy} onChange={setSortBy} />
      </div>

      {error || bookmarkError ? <p className="mb-3 text-sm text-red-600">{error || bookmarkError}</p> : null}
      {isLoading ? (
        <div className="rounded border border-line p-6 text-sm text-muted">Loading files...</div>
      ) : (
        <FileList
          bookmarkedIds={bookmarkedIds}
          emptyMessage={query ? "No matching files found" : "Enter a search term in the top bar"}
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
    </div>
  );
}
