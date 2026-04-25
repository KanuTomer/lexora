import { useEffect, useState } from "react";
import { getBookmarkedFiles, toggleBookmark as toggleBookmarkRequest } from "../services/api.js";

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkedFiles, setBookmarkedFiles] = useState([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);
  const [bookmarkError, setBookmarkError] = useState("");

  async function loadBookmarks() {
    if (!localStorage.getItem("token")) {
      setBookmarkedFiles([]);
      setBookmarkedIds(new Set());
      setIsLoadingBookmarks(false);
      return;
    }

    try {
      setBookmarkError("");
      setIsLoadingBookmarks(true);
      const files = await getBookmarkedFiles();
      setBookmarkedFiles(files);
      setBookmarkedIds(new Set(files.map((file) => file.id)));
    } catch (error) {
      console.error("Failed to load bookmarks", error);
      setBookmarkError("Failed to load bookmarks");
    } finally {
      setIsLoadingBookmarks(false);
    }
  }

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function toggleBookmark(file) {
    if (!localStorage.getItem("token")) {
      setBookmarkError("Log in to bookmark files.");
      return;
    }

    const wasBookmarked = bookmarkedIds.has(file.id);

    setBookmarkedIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (wasBookmarked) {
        nextIds.delete(file.id);
      } else {
        nextIds.add(file.id);
      }
      return nextIds;
    });

    setBookmarkedFiles((currentFiles) =>
      wasBookmarked
        ? currentFiles.filter((currentFile) => currentFile.id !== file.id)
        : [file, ...currentFiles],
    );

    try {
      await toggleBookmarkRequest(file.id);
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
      setBookmarkError("Failed to update bookmark");
      setBookmarkedIds((currentIds) => {
        const nextIds = new Set(currentIds);
        if (wasBookmarked) {
          nextIds.add(file.id);
        } else {
          nextIds.delete(file.id);
        }
        return nextIds;
      });
      setBookmarkedFiles((currentFiles) =>
        wasBookmarked
          ? [file, ...currentFiles]
          : currentFiles.filter((currentFile) => currentFile.id !== file.id),
      );
    }
  }

  function updateBookmarkedFile(updatedFile) {
    setBookmarkedFiles((currentFiles) =>
      currentFiles.map((file) => (file.id === updatedFile.id ? updatedFile : file)),
    );
  }

  function removeBookmarkedFile(fileId) {
    setBookmarkedFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
    setBookmarkedIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.delete(fileId);
      return nextIds;
    });
  }

  return {
    bookmarkedFiles,
    bookmarkedIds,
    bookmarkError,
    isLoadingBookmarks,
    reloadBookmarks: loadBookmarks,
    updateBookmarkedFile,
    removeBookmarkedFile,
    toggleBookmark,
  };
}
