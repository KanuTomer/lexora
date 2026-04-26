import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Avatar from "../components/Avatar.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import FileFilters from "../components/FileFilters.jsx";
import FileList from "../components/FileList.jsx";
import FileSort from "../components/FileSort.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAcademic } from "../context/AcademicContext.jsx";
import { useBookmarks } from "../hooks/useBookmarks.js";
import { deleteFile, getColleges, getFiles, getMe, getPrograms, getUserProfile, updateFile, updateMe, uploadAvatar } from "../services/api.js";

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

export default function Profile() {
  const { id } = useParams();
  const { currentUser, loadCurrentUser, setCurrentUser } = useAuth();
  const { selectedCourse } = useAcademic();
  const viewedUserId = id ?? currentUser?.id;
  const isOwnProfile = Boolean(currentUser?.id && viewedUserId === currentUser.id);
  const [profile, setProfile] = useState(null);
  const [activeView, setActiveView] = useState("uploads");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ username: "", name: "", email: "", collegeId: "", programId: "" });
  const [profileSaveError, setProfileSaveError] = useState("");
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const { bookmarkedFiles, bookmarkedIds, bookmarkError, removeBookmarkedFile, toggleBookmark, updateBookmarkedFile } =
    useBookmarks();

  useEffect(() => {
    setPage(1);
  }, [activeFilter, limit, sortBy, viewedUserId]);

  useEffect(() => {
    async function loadProfile() {
      if (!viewedUserId) {
        return;
      }

      try {
        setError("");
        setIsLoadingProfile(true);
        const user = isOwnProfile ? await getMe() : await getUserProfile(viewedUserId);
        setProfile(user);
        setProfileDraft({
          username: user.username ?? "",
          name: user.name ?? "",
          email: user.email ?? "",
          collegeId: user.collegeId ?? "",
          programId: user.programId ?? "",
        });
        if (isOwnProfile) {
          setCurrentUser(user);
        }
      } catch (loadError) {
        console.error("Failed to load profile", loadError);
        setError("Failed to load profile");
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [isOwnProfile, setCurrentUser, viewedUserId]);

  useEffect(() => {
    async function loadUploads() {
      if (!viewedUserId || activeView !== "uploads") {
        return;
      }

      try {
        setError("");
        setIsLoadingFiles(true);
        const result = await getFiles({
          uploadedById: viewedUserId,
          page,
          limit,
          fileType: activeFilter === "all" ? undefined : activeFilter,
          sort: sortBy,
        });
        setFiles(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        console.error("Failed to load profile uploads", loadError);
        setError("Failed to load files");
      } finally {
        setIsLoadingFiles(false);
      }
    }

    loadUploads();
  }, [activeFilter, activeView, limit, page, sortBy, viewedUserId]);

  useEffect(() => {
    if (!isEditModalOpen) {
      return;
    }

    getColleges().then(setColleges).catch((loadError) => {
      console.error("Failed to load colleges", loadError);
      setError("Could not load colleges");
    });
  }, [isEditModalOpen]);

  useEffect(() => {
    if (!isEditModalOpen || !profileDraft.collegeId) {
      setPrograms([]);
      return;
    }

    getPrograms({ collegeId: profileDraft.collegeId }).then(setPrograms).catch((loadError) => {
      console.error("Failed to load programs", loadError);
      setError("Could not load programs");
    });
  }, [isEditModalOpen, profileDraft.collegeId]);

  async function handleProfileSave(event) {
    event.preventDefault();
    setProfileSaveError("");

    try {
      const updatedUser = await updateMe(profileDraft);
      setProfile(updatedUser);
      setCurrentUser(updatedUser);
      setIsEditModalOpen(false);
    } catch (saveError) {
      console.error("Failed to update profile", saveError);
      setProfileSaveError(saveError.response?.data?.message ?? "Could not update profile");
    }
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    const updatedUser = await uploadAvatar(formData);
    setProfile(updatedUser);
    setCurrentUser(updatedUser);
    await loadCurrentUser();
  }

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
    updateBookmarkedFile(updatedFile);
  }

  async function handleDeleteFile(fileId) {
    await deleteFile(fileId);
    setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
    removeBookmarkedFile(fileId);
  }

  if (isLoadingProfile) {
    return <div className="rounded border border-line p-6 text-sm text-muted">Loading profile...</div>;
  }

  if (error && !profile) {
    return <div className="rounded border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Profile" }]} />
      <section className="mb-5 rounded border border-line bg-white p-4">
        <div className="flex flex-wrap items-start gap-4">
          <label className={isOwnProfile ? "cursor-pointer" : ""}>
            <Avatar user={profile} size="lg" />
            {isOwnProfile ? (
              <input className="sr-only" type="file" accept="image/*" onChange={handleAvatarChange} />
            ) : null}
          </label>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm text-muted">@{profile?.username}</p>
            <h1 className="text-2xl font-semibold">{profile?.name || profile?.username}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {isOwnProfile ? <p className="text-sm text-muted">{profile?.email}</p> : null}
              {profile?.role === "moderator" ? (
                <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Moderator
                </span>
              ) : null}
              {isOwnProfile && profile?.role === "user" ? (
                <span className={[
                  "rounded border px-2 py-0.5 text-xs font-medium",
                  profile?.uploadPrivilege === "trusted"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                ].join(" ")}>
                  {profile?.uploadPrivilege === "trusted" ? "Trusted uploader" : "Restricted uploader"}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted">
              {[profile?.college?.name, profile?.program?.name].filter(Boolean).join(" - ") || selectedCourse?.name || "Program not selected"}
            </p>
            <p className="mt-1 text-sm text-muted">Joined {formatDate(profile?.createdAt)}</p>
          </div>
          {isOwnProfile ? (
            <button
              className="h-9 rounded border border-line bg-white px-3 text-sm font-medium hover:bg-surface"
              type="button"
              onClick={() => {
                setProfileSaveError("");
                setIsEditModalOpen(true);
              }}
            >
              Edit
            </button>
          ) : null}
        </div>
      </section>

      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-line p-3">
          <p className="text-xs uppercase text-muted">Uploads</p>
          <p className="mt-1 text-2xl font-semibold">{profile?.stats?.uploadsCount ?? 0}</p>
        </div>
        <div className="rounded border border-line p-3">
          <p className="text-xs uppercase text-muted">Downloads</p>
          <p className="mt-1 text-2xl font-semibold">{profile?.stats?.totalDownloads ?? 0}</p>
        </div>
        <div className="rounded border border-line p-3">
          <p className="text-xs uppercase text-muted">Bookmarks</p>
          <p className="mt-1 text-2xl font-semibold">{profile?.stats?.bookmarksCount ?? 0}</p>
        </div>
      </section>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {["uploads", "bookmarks"].map((view) => (
            <button
              key={view}
              className={[
                "h-9 rounded border px-3 text-sm font-medium capitalize",
                activeView === view
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-line bg-white text-muted hover:bg-surface hover:text-ink",
              ].join(" ")}
              type="button"
              onClick={() => setActiveView(view)}
            >
              {view}
            </button>
          ))}
        </div>
        {activeView === "uploads" ? <FileSort value={sortBy} onChange={setSortBy} /> : null}
      </div>

      {activeView === "uploads" ? (
        <>
          <div className="mb-3">
            <FileFilters activeFilter={activeFilter} onChange={setActiveFilter} />
          </div>
          {error || bookmarkError ? <p className="mb-3 text-sm text-red-600">{error || bookmarkError}</p> : null}
          {isLoadingFiles ? (
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
        </>
      ) : isOwnProfile ? (
        <FileList
          bookmarkedIds={bookmarkedIds}
          files={bookmarkedFiles}
          onUpdateFile={handleUpdateFile}
          onDeleteFile={handleDeleteFile}
          onToggleBookmark={toggleBookmark}
        />
      ) : (
        <div className="rounded border border-dashed border-line p-6 text-sm text-muted">
          Bookmarks are private.
        </div>
      )}
      {isEditModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4" role="dialog" aria-modal="true" onClick={() => setIsEditModalOpen(false)}>
          <form className="w-full max-w-3xl rounded border border-line bg-white p-4 shadow-lg" onSubmit={handleProfileSave} onClick={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-semibold">Edit profile</h2>
            {profileSaveError ? (
              <p className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{profileSaveError}</p>
            ) : null}
            {(profileDraft.collegeId !== profile?.collegeId || profileDraft.programId !== profile?.programId) && profile?.role === "user" ? (
              <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Changing your college or program will reset your upload status to restricted. Future uploads will need moderator approval.
              </p>
            ) : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">Username
                <input className="mt-1 h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600" value={profileDraft.username} onChange={(event) => setProfileDraft((draft) => ({ ...draft, username: event.target.value }))} />
              </label>
              <label className="block text-sm font-medium">Email
                <input className="mt-1 h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600" type="email" value={profileDraft.email} onChange={(event) => setProfileDraft((draft) => ({ ...draft, email: event.target.value }))} />
              </label>
              <label className="block text-sm font-medium sm:col-span-2">Name
                <input className="mt-1 h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600" value={profileDraft.name} onChange={(event) => setProfileDraft((draft) => ({ ...draft, name: event.target.value }))} />
              </label>
              <label className="block text-sm font-medium">College
                <select className="mt-1 h-10 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-blue-600" value={profileDraft.collegeId} onChange={(event) => setProfileDraft((draft) => ({ ...draft, collegeId: event.target.value, programId: "" }))}>
                  <option value="">Select college</option>
                  {colleges.map((college) => <option key={college.id} value={college.id}>{college.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Program
                <select className="mt-1 h-10 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-blue-600" value={profileDraft.programId} onChange={(event) => setProfileDraft((draft) => ({ ...draft, programId: event.target.value }))} disabled={!profileDraft.collegeId}>
                  <option value="">{profileDraft.collegeId ? "Select program" : "Select college first"}</option>
                  {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
              <button className="h-9 rounded border border-line bg-white px-3 text-sm font-medium hover:bg-surface" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="h-9 rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white" type="submit">Save</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
