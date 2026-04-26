import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getColleges, getPrograms, updateMyDetails } from "../services/api.js";

export default function SignupDetails() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [name, setName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [programId, setProgramId] = useState("");
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadColleges() {
      const data = await getColleges();
      setColleges(data);
    }
    loadColleges().catch((loadError) => {
      console.error("Failed to load colleges", loadError);
      setError("Could not load colleges");
    });
  }, []);

  useEffect(() => {
    async function loadPrograms() {
      if (!collegeId) {
        setPrograms([]);
        return;
      }
      const data = await getPrograms({ collegeId });
      setPrograms(data);
    }
    loadPrograms().catch((loadError) => {
      console.error("Failed to load programs", loadError);
      setError("Could not load programs");
    });
  }, [collegeId]);

  const selectedCollege = useMemo(
    () => colleges.find((college) => college.id === collegeId),
    [collegeId, colleges],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (!name.trim() || !collegeId || !programId) {
        setError("Name, college, and program are required.");
        return;
      }
      setIsSubmitting(true);
      const user = await updateMyDetails({ name: name.trim(), collegeId, programId });
      setCurrentUser(user);
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      console.error("Failed to save signup details", submitError);
      setError(submitError.response?.data?.message ?? "Could not save details");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <form className="w-full max-w-2xl rounded border border-line bg-white p-5" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-semibold">Complete profile</h1>
        <p className="mt-1 text-sm text-muted">
          Step 2 of 2: choose the college and program library you belong to. This controls your dashboard and subject access.
        </p>
        {error ? <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="name">Name</label>
            <input id="name" className="h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-blue-600" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="college">College</label>
            <select id="college" className="h-10 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-blue-600" value={collegeId} onChange={(event) => {
              setCollegeId(event.target.value);
              setProgramId("");
            }}>
              <option value="">Select college</option>
              {colleges.map((college) => <option key={college.id} value={college.id}>{college.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="program">Program</label>
            <select id="program" className="h-10 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-blue-600" value={programId} onChange={(event) => setProgramId(event.target.value)} disabled={!collegeId}>
              <option value="">{collegeId ? "Select program" : "Select college first"}</option>
              {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">{selectedCollege?.name ?? ""}</p>
        <button className="mt-5 h-10 w-full rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white disabled:opacity-60" type="submit" disabled={isSubmitting || !name.trim() || !collegeId || !programId}>
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
