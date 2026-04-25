import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getSubjects, uploadFile } from "../services/api.js";

const fileTypes = [
  { label: "Notes", value: "notes" },
  { label: "Assignment", value: "assignment" },
  { label: "Test Paper", value: "test-paper" },
  { label: "Syllabus", value: "syllabus" },
];
const maxFileSize = 10 * 1024 * 1024;

export default function UploadPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId") ?? "";
  const [subjects, setSubjects] = useState([]);
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("notes");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubjects() {
      try {
        setError("");
        const data = await getSubjects();
        setSubjects(data);
      } catch (loadError) {
        console.error("Failed to fetch subjects", loadError);
        setError("Could not load subject details for upload.");
      }
    }

    loadSubjects();
  }, []);

  const selectedSubject = subjects.find((subject) => subject.id === subjectId);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!subjectId) {
      setError("Choose a subject before uploading.");
      return;
    }

    if (!file || !title || !fileType) {
      setError("Please fill title, category, and choose a file.");
      return;
    }

    if (file.size > maxFileSize) {
      setError("File too large (max 10MB)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("subjectId", subjectId);
    formData.append("fileType", fileType);

    try {
      setIsSubmitting(true);
      await uploadFile(formData);
      setSuccessMessage("File uploaded successfully.");
      setTitle("");
      setFile(null);
      sessionStorage.setItem("uploadSuccessMessage", "File uploaded successfully.");
      window.setTimeout(() => {
        navigate(`/subjects/${subjectId}`);
      }, 800);
    } catch (uploadError) {
      console.error("Upload failed", uploadError);
      setError(uploadError.response?.data?.message ?? "Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: "Upload" }]} />
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Upload file</h1>
        <p className="mt-1 text-sm text-muted">
          {selectedSubject
            ? `Upload to ${selectedSubject.subjectCode} — ${selectedSubject.subjectName}`
            : "Go to a subject page to upload files"}
        </p>
      </div>

      {error ? <p className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {successMessage ? (
        <p className="mb-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </p>
      ) : null}
      {subjectId ? (
        <p className="mb-3 rounded border border-line bg-surface p-3 text-sm text-muted">
          {currentUser?.uploadPrivilege === "trusted"
            ? "Uploads go live instantly"
            : "Uploads will be reviewed before publishing"}
        </p>
      ) : null}

      {!subjectId ? (
        <div className="rounded border border-line bg-white p-4 text-sm text-muted">
          Go to a subject page to upload files
          <div className="mt-3">
            <Link className="font-medium text-blue-700 hover:underline" to="/dashboard">
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : (
        <form className="space-y-4 rounded border border-line bg-white p-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600"
              placeholder="Unit 2 transaction management notes"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="type">
              Category
            </label>
            <select
              id="type"
              className="h-10 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-blue-600"
              value={fileType}
              onChange={(event) => setFileType(event.target.value)}
            >
              {fileTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="file">
              File
            </label>
            <input
              id="file"
              className="block w-full rounded border border-line p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-surface file:px-3 file:py-2 file:text-sm"
              type="file"
              key={successMessage}
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                if (nextFile && nextFile.size > maxFileSize) {
                  setError("File too large (max 10MB)");
                  setFile(null);
                  event.target.value = "";
                  return;
                }
                setError("");
                setFile(nextFile);
              }}
            />
            <p className="mt-1 text-xs text-muted">PDF or document files up to 10MB.</p>
          </div>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button
              className="h-9 rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
