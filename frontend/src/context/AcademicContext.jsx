import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSubjects } from "../services/api.js";

const AcademicContext = createContext(null);

export function AcademicProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectError, setSubjectError] = useState("");

  useEffect(() => {
    async function loadSubjects() {
      try {
        setSubjectError("");
        setIsLoadingSubjects(true);
        const data = await getSubjects();
        setSubjects(data);
        setSelectedCourseId(data[0]?.courseId ?? "");
        setSelectedSemesterId(data[0]?.semesterId ?? "");
      } catch (error) {
        console.error("Failed to load academic context", error);
        setSubjectError("Failed to load academic structure");
      } finally {
        setIsLoadingSubjects(false);
      }
    }

    loadSubjects();
  }, []);

  const selectedCourse = useMemo(
    () => subjects.find((subject) => subject.courseId === selectedCourseId)?.course ?? null,
    [selectedCourseId, subjects],
  );

  const semesters = useMemo(
    () =>
      Array.from(
        new Map(
          subjects
            .filter((subject) => subject.courseId === selectedCourseId)
            .map((subject) => [subject.semesterId, subject.semester]),
        ).values(),
      )
        .filter(Boolean)
        .sort((a, b) => a.number - b.number),
    [selectedCourseId, subjects],
  );

  const selectedSemester = useMemo(
    () => semesters.find((semester) => semester.id === selectedSemesterId) ?? null,
    [selectedSemesterId, semesters],
  );

  const semesterSubjects = useMemo(
    () =>
      subjects
        .filter(
          (subject) =>
            subject.courseId === selectedCourseId && subject.semesterId === selectedSemesterId,
        )
        .sort((a, b) => a.subjectCode.localeCompare(b.subjectCode)),
    [selectedCourseId, selectedSemesterId, subjects],
  );

  const value = {
    subjects,
    selectedCourse,
    selectedCourseId,
    selectedSemester,
    selectedSemesterId,
    semesters,
    semesterSubjects,
    isLoadingSubjects,
    subjectError,
    setSelectedCourseId,
    setSelectedSemesterId,
  };

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error("useAcademic must be used inside AcademicProvider");
  }

  return context;
}
