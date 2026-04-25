import Breadcrumb from "../components/Breadcrumb.jsx";
import FileList from "../components/FileList.jsx";
import { useBookmarks } from "../hooks/useBookmarks.js";
import { deleteFile, updateFile } from "../services/api.js";

export default function BookmarksPage() {
  const {
    bookmarkedFiles,
    bookmarkedIds,
    bookmarkError,
    isLoadingBookmarks,
    removeBookmarkedFile,
    toggleBookmark,
    updateBookmarkedFile,
  } = useBookmarks();

  async function handleUpdateFile(fileId, payload) {
    const updatedFile = await updateFile(fileId, payload);
    updateBookmarkedFile(updatedFile);
  }

  async function handleDeleteFile(fileId) {
    await deleteFile(fileId);
    removeBookmarkedFile(fileId);
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Bookmarks" }]} />
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Bookmarks</h1>
        <p className="mt-1 text-sm text-muted">Files saved from your current Lexora session.</p>
      </div>

      {bookmarkError ? <p className="mb-3 text-sm text-red-600">{bookmarkError}</p> : null}
      {isLoadingBookmarks ? (
        <div className="rounded border border-line p-6 text-sm text-muted">Loading files...</div>
      ) : (
        <FileList
          bookmarkedIds={bookmarkedIds}
          files={bookmarkedFiles}
          onUpdateFile={handleUpdateFile}
          onDeleteFile={handleDeleteFile}
          onToggleBookmark={toggleBookmark}
        />
      )}
    </div>
  );
}
