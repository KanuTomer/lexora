import { NavLink } from "react-router-dom";
import { useAcademic } from "../context/AcademicContext.jsx";

export default function Sidebar() {
  const {
    selectedCourse,
    selectedSemesterId,
    semesters,
    semesterSubjects,
    isLoadingSubjects,
    subjectError,
    setSelectedSemesterId,
  } = useAcademic();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-57px)] w-64 shrink-0 overflow-y-auto border-r border-line bg-surface px-3 py-4 md:block">
      <div className="mb-5">
        <p className="block text-xs font-semibold uppercase text-muted">Programme</p>
        <p className="mt-2 whitespace-normal break-words text-sm font-semibold leading-5 text-ink">
          {selectedCourse?.name ?? "Programme"}
        </p>
      </div>

      <label className="block text-xs font-semibold uppercase text-muted" htmlFor="semester-select">
        Semester
      </label>
      <select
        id="semester-select"
        className="mt-2 h-9 w-full rounded border border-line bg-white px-2 text-sm outline-none focus:border-blue-600"
        value={selectedSemesterId}
        onChange={(event) => setSelectedSemesterId(event.target.value)}
      >
        {semesters.map((semester) => (
          <option key={semester.id} value={semester.id}>
            Semester {semester.number}
          </option>
        ))}
      </select>

      <nav className="mt-5" aria-label="Subjects">
        <p className="mb-2 text-xs font-semibold uppercase text-muted">Subject codes</p>
        {subjectError ? <p className="text-sm text-red-600">{subjectError}</p> : null}
        {isLoadingSubjects ? <p className="text-sm text-muted">Loading subjects...</p> : null}
        <div className="space-y-1">
          {semesterSubjects.map((subject) => (
            <NavLink
              key={subject.id}
              to={`/subjects/${subject.id}`}
              className={({ isActive }) =>
                [
                  "block rounded px-2 py-2 text-sm hover:bg-white",
                  isActive ? "bg-white font-semibold text-blue-700 shadow-sm" : "text-ink",
                ].join(" ")
              }
            >
              <span className="block font-mono text-xs text-muted">{subject.subjectCode}</span>
              <span className="block truncate">{subject.subjectName}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}
