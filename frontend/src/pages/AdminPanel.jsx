import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import {
  createAdminCollege,
  createAdminCourse,
  createAdminSemester,
  createAdminSubject,
  createAdminUser,
  deleteAdminCollege,
  deleteAdminSubject,
  deleteAdminUser,
  getAdminColleges,
  getAdminCourses,
  getAdminPrograms,
  getAdminSemesters,
  getAdminSubjects,
  getAdminUsers,
  updateAdminCollege,
  updateAdminSubject,
  updateAdminUser,
} from "../services/api.js";

const sections = ["users", "colleges", "subjects"];
const roles = ["user", "moderator", "admin"];
const privileges = ["restricted", "trusted"];
const emptyUser = {
  username: "",
  name: "",
  email: "",
  password: "",
  role: "user",
  uploadPrivilege: "restricted",
  collegeId: "",
  programId: "",
};
const emptyCollege = { name: "", slug: "" };
const emptyCourse = { name: "", code: "", collegeId: "" };
const emptySemester = { courseId: "", number: "" };
const emptySubject = { subjectCode: "", subjectName: "", courseId: "", semesterId: "" };

function getErrorMessage(error, fallback) {
  return error.response?.data?.message ?? fallback;
}

function labelForSection(section) {
  return section.charAt(0).toUpperCase() + section.slice(1);
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("users");
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ collegeId: "", programId: "", role: "", uploadPrivilege: "" });
  const [userForm, setUserForm] = useState(emptyUser);
  const [collegeForm, setCollegeForm] = useState(emptyCollege);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [semesterForm, setSemesterForm] = useState(emptySemester);
  const [subjectForm, setSubjectForm] = useState(emptySubject);
  const [editingUserId, setEditingUserId] = useState("");
  const [editingCollegeId, setEditingCollegeId] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedSubjectCourse = useMemo(
    () => courses.find((course) => course.id === subjectForm.courseId),
    [courses, subjectForm.courseId],
  );

  async function loadColleges() {
    const data = await getAdminColleges();
    setColleges(data);
    return data;
  }

  async function loadCourses(collegeId = "") {
    const data = await getAdminCourses({ collegeId: collegeId || undefined });
    setCourses(data);
    return data;
  }

  async function loadSemesters(courseId = "") {
    const data = await getAdminSemesters({ courseId: courseId || undefined });
    setSemesters(data);
    return data;
  }

  async function loadUsers() {
    const data = await getAdminUsers({
      collegeId: filters.collegeId || undefined,
      programId: filters.programId || undefined,
      role: filters.role || undefined,
      uploadPrivilege: filters.uploadPrivilege || undefined,
    });
    setUsers(data);
  }

  async function loadSubjects() {
    const data = await getAdminSubjects({
      courseId: subjectForm.courseId || undefined,
      semesterId: subjectForm.semesterId || undefined,
    });
    setSubjects(data);
  }

  async function refreshAll() {
    try {
      setError("");
      setIsLoading(true);
      await Promise.all([loadColleges(), loadCourses(), loadSemesters(), loadUsers(), loadSubjects()]);
    } catch (loadError) {
      console.error("Failed to load admin data", loadError);
      setError(getErrorMessage(loadError, "Failed to load admin data"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    async function loadFilteredPrograms() {
      if (!filters.collegeId && !userForm.collegeId) {
        setPrograms([]);
        return;
      }

      try {
        const collegeId = userForm.collegeId || filters.collegeId;
        setPrograms(await getAdminPrograms({ collegeId }));
      } catch (loadError) {
        console.error("Failed to load programs", loadError);
      }
    }

    loadFilteredPrograms();
  }, [filters.collegeId, userForm.collegeId]);

  useEffect(() => {
    loadUsers().catch((loadError) => {
      console.error("Failed to load users", loadError);
      setError(getErrorMessage(loadError, "Failed to load users"));
    });
  }, [filters]);

  useEffect(() => {
    loadSemesters(subjectForm.courseId).catch((loadError) => {
      console.error("Failed to load semesters", loadError);
      setError(getErrorMessage(loadError, "Failed to load semesters"));
    });
  }, [subjectForm.courseId]);

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function beginEditUser(user) {
    setEditingUserId(user.id);
    setUserForm({
      username: user.username ?? "",
      name: user.name ?? "",
      email: user.email ?? "",
      password: "",
      role: user.role ?? "user",
      uploadPrivilege: user.uploadPrivilege ?? "restricted",
      collegeId: user.collegeId ?? "",
      programId: user.programId ?? "",
    });
    setActiveSection("users");
  }

  function resetUserForm() {
    setEditingUserId("");
    setUserForm(emptyUser);
  }

  async function handleUserSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const payload = { ...userForm };
      if (!payload.password) {
        delete payload.password;
      }

      if (editingUserId) {
        await updateAdminUser(editingUserId, payload);
        showNotice("User updated");
      } else {
        await createAdminUser(payload);
        showNotice("User created");
      }

      resetUserForm();
      await loadUsers();
    } catch (submitError) {
      console.error("Failed to save user", submitError);
      setError(getErrorMessage(submitError, "Failed to save user"));
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteAdminUser(id);
      setUsers((current) => current.filter((user) => user.id !== id));
      showNotice("User deleted");
    } catch (deleteError) {
      console.error("Failed to delete user", deleteError);
      setError(getErrorMessage(deleteError, "Failed to delete user"));
    }
  }

  function beginEditCollege(college) {
    setEditingCollegeId(college.id);
    setCollegeForm({ name: college.name ?? "", slug: college.slug ?? "" });
  }

  function resetCollegeForm() {
    setEditingCollegeId("");
    setCollegeForm(emptyCollege);
  }

  async function handleCollegeSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (editingCollegeId) {
        await updateAdminCollege(editingCollegeId, collegeForm);
        showNotice("College updated");
      } else {
        await createAdminCollege(collegeForm);
        showNotice("College created");
      }

      resetCollegeForm();
      await loadColleges();
      await loadCourses();
    } catch (submitError) {
      console.error("Failed to save college", submitError);
      setError(getErrorMessage(submitError, "Failed to save college"));
    }
  }

  async function handleDeleteCollege(id) {
    if (!window.confirm("Delete this college and related academic setup?")) return;
    try {
      await deleteAdminCollege(id);
      await refreshAll();
      showNotice("College deleted");
    } catch (deleteError) {
      console.error("Failed to delete college", deleteError);
      setError(getErrorMessage(deleteError, "Failed to delete college"));
    }
  }

  async function handleCourseSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const course = await createAdminCourse(courseForm);
      setCourseForm(emptyCourse);
      setSubjectForm((current) => ({ ...current, courseId: course.id, semesterId: "" }));
      await loadCourses();
      showNotice("Course created");
    } catch (submitError) {
      console.error("Failed to create course", submitError);
      setError(getErrorMessage(submitError, "Failed to create course"));
    }
  }

  async function handleSemesterSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const semester = await createAdminSemester(semesterForm);
      setSemesterForm({ courseId: semesterForm.courseId, number: "" });
      setSubjectForm((current) => ({ ...current, courseId: semester.courseId, semesterId: semester.id }));
      await loadSemesters(semester.courseId);
      showNotice("Semester created");
    } catch (submitError) {
      console.error("Failed to create semester", submitError);
      setError(getErrorMessage(submitError, "Failed to create semester"));
    }
  }

  function beginEditSubject(subject) {
    setEditingSubjectId(subject.id);
    setSubjectForm({
      subjectCode: subject.subjectCode ?? "",
      subjectName: subject.subjectName ?? "",
      courseId: subject.courseId ?? "",
      semesterId: subject.semesterId ?? "",
    });
  }

  function resetSubjectForm() {
    setEditingSubjectId("");
    setSubjectForm(emptySubject);
  }

  async function handleSubjectSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (editingSubjectId) {
        await updateAdminSubject(editingSubjectId, subjectForm);
        showNotice("Subject updated");
      } else {
        await createAdminSubject(subjectForm);
        showNotice("Subject created");
      }

      resetSubjectForm();
      await Promise.all([loadSubjects(), loadCourses()]);
    } catch (submitError) {
      console.error("Failed to save subject", submitError);
      setError(getErrorMessage(submitError, "Failed to save subject"));
    }
  }

  async function handleDeleteSubject(id) {
    if (!window.confirm("Delete this subject? Files linked to it may block deletion.")) return;
    try {
      await deleteAdminSubject(id);
      setSubjects((current) => current.filter((subject) => subject.id !== id));
      showNotice("Subject deleted");
    } catch (deleteError) {
      console.error("Failed to delete subject", deleteError);
      setError(getErrorMessage(deleteError, "Failed to delete subject"));
    }
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Admin" }]} />
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted">Manage users, colleges, and the academic subject structure.</p>
        </div>
        {isLoading ? <span className="text-sm text-muted">Loading...</span> : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-line pb-3">
        {sections.map((section) => (
          <button
            key={section}
            className={`rounded border px-3 py-2 text-sm font-medium ${
              activeSection === section ? "border-blue-700 bg-blue-700 text-white" : "border-line bg-white text-ink"
            }`}
            type="button"
            onClick={() => setActiveSection(section)}
          >
            {labelForSection(section)}
          </button>
        ))}
      </div>

      {notice ? <p className="mb-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</p> : null}
      {error ? <p className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {activeSection === "users" ? (
        <section className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={filters.collegeId} onChange={(event) => setFilters((current) => ({ ...current, collegeId: event.target.value, programId: "" }))}>
              <option value="">All colleges</option>
              {colleges.map((college) => <option key={college.id} value={college.id}>{college.name}</option>)}
            </select>
            <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={filters.programId} onChange={(event) => setFilters((current) => ({ ...current, programId: event.target.value }))}>
              <option value="">All programs</option>
              {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
            </select>
            <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={filters.role} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}>
              <option value="">All roles</option>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={filters.uploadPrivilege} onChange={(event) => setFilters((current) => ({ ...current, uploadPrivilege: event.target.value }))}>
              <option value="">All privileges</option>
              {privileges.map((privilege) => <option key={privilege} value={privilege}>{privilege}</option>)}
            </select>
          </div>

          <form className="grid gap-3 rounded border border-line bg-white p-3 md:grid-cols-4" onSubmit={handleUserSubmit}>
            <input className="h-9 rounded border border-line px-2 text-sm" placeholder="Username" value={userForm.username} onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))} />
            <input className="h-9 rounded border border-line px-2 text-sm" placeholder="Name" value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} />
            <input className="h-9 rounded border border-line px-2 text-sm" placeholder="Email" type="email" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} />
            <input className="h-9 rounded border border-line px-2 text-sm" placeholder={editingUserId ? "New password optional" : "Password"} type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} />
            <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={userForm.collegeId} onChange={(event) => setUserForm((current) => ({ ...current, collegeId: event.target.value, programId: "" }))}>
              <option value="">No college</option>
              {colleges.map((college) => <option key={college.id} value={college.id}>{college.name}</option>)}
            </select>
            <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={userForm.programId} onChange={(event) => setUserForm((current) => ({ ...current, programId: event.target.value }))}>
              <option value="">No program</option>
              {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
            </select>
            <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={userForm.uploadPrivilege} onChange={(event) => setUserForm((current) => ({ ...current, uploadPrivilege: event.target.value }))}>
              {privileges.map((privilege) => <option key={privilege} value={privilege}>{privilege}</option>)}
            </select>
            <div className="flex gap-2 md:col-span-4">
              <button className="h-9 rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white" type="submit">{editingUserId ? "Update user" : "Add user"}</button>
              {editingUserId ? <button className="h-9 rounded border border-line bg-white px-3 text-sm" type="button" onClick={resetUserForm}>Cancel</button> : null}
            </div>
          </form>

          <div className="overflow-hidden rounded border border-line">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-surface text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Username</th>
                  <th className="px-3 py-2 font-semibold">Email</th>
                  <th className="px-3 py-2 font-semibold">College</th>
                  <th className="px-3 py-2 font-semibold">Program</th>
                  <th className="px-3 py-2 font-semibold">Privilege</th>
                  <th className="px-3 py-2 font-semibold">Role</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface">
                    <td className="px-3 py-2 font-medium">{user.username}</td>
                    <td className="px-3 py-2 text-muted">{user.email}</td>
                    <td className="px-3 py-2 text-muted">{user.college?.name ?? "-"}</td>
                    <td className="px-3 py-2 text-muted">{user.program?.name ?? "-"}</td>
                    <td className="px-3 py-2 text-muted">{user.uploadPrivilege}</td>
                    <td className="px-3 py-2 text-muted">{user.role}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="mr-2 text-blue-700 hover:underline" type="button" onClick={() => beginEditUser(user)}>Edit</button>
                      <button className="text-red-700 hover:underline" type="button" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 ? <tr><td className="px-3 py-6 text-center text-muted" colSpan="7">No users found</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeSection === "colleges" ? (
        <section className="space-y-4">
          <form className="grid gap-3 rounded border border-line bg-white p-3 md:grid-cols-3" onSubmit={handleCollegeSubmit}>
            <input className="h-9 rounded border border-line px-2 text-sm" placeholder="College name" value={collegeForm.name} onChange={(event) => setCollegeForm((current) => ({ ...current, name: event.target.value }))} />
            <input className="h-9 rounded border border-line px-2 text-sm" placeholder="Slug" value={collegeForm.slug} onChange={(event) => setCollegeForm((current) => ({ ...current, slug: event.target.value }))} />
            <div className="flex gap-2">
              <button className="h-9 rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white" type="submit">{editingCollegeId ? "Update college" : "Add college"}</button>
              {editingCollegeId ? <button className="h-9 rounded border border-line bg-white px-3 text-sm" type="button" onClick={resetCollegeForm}>Cancel</button> : null}
            </div>
          </form>

          <div className="overflow-hidden rounded border border-line">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-surface text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">College</th>
                  <th className="px-3 py-2 font-semibold">Slug</th>
                  <th className="px-3 py-2 font-semibold">Programs</th>
                  <th className="px-3 py-2 font-semibold">Courses</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {colleges.map((college) => (
                  <tr key={college.id} className="hover:bg-surface">
                    <td className="px-3 py-2 font-medium">{college.name}</td>
                    <td className="px-3 py-2 text-muted">{college.slug}</td>
                    <td className="px-3 py-2 text-muted">{college._count?.programs ?? college.programs?.length ?? 0}</td>
                    <td className="px-3 py-2 text-muted">{college._count?.courses ?? college.courses?.length ?? 0}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="mr-2 text-blue-700 hover:underline" type="button" onClick={() => beginEditCollege(college)}>Edit</button>
                      <button className="text-red-700 hover:underline" type="button" onClick={() => handleDeleteCollege(college.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {colleges.length === 0 ? <tr><td className="px-3 py-6 text-center text-muted" colSpan="5">No colleges yet</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeSection === "subjects" ? (
        <section className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <form className="grid gap-3 rounded border border-line bg-white p-3 md:grid-cols-2" onSubmit={handleCourseSubmit}>
              <h2 className="font-semibold md:col-span-2">Course setup</h2>
              <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={courseForm.collegeId} onChange={(event) => setCourseForm((current) => ({ ...current, collegeId: event.target.value }))}>
                <option value="">Select college</option>
                {colleges.map((college) => <option key={college.id} value={college.id}>{college.name}</option>)}
              </select>
              <input className="h-9 rounded border border-line px-2 text-sm" placeholder="Course code, e.g. BTECH-CSE" value={courseForm.code} onChange={(event) => setCourseForm((current) => ({ ...current, code: event.target.value }))} />
              <input className="h-9 rounded border border-line px-2 text-sm md:col-span-2" placeholder="Course name" value={courseForm.name} onChange={(event) => setCourseForm((current) => ({ ...current, name: event.target.value }))} />
              <button className="h-9 rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white md:w-fit" type="submit">Add course</button>
            </form>

            <form className="grid gap-3 rounded border border-line bg-white p-3 md:grid-cols-2" onSubmit={handleSemesterSubmit}>
              <h2 className="font-semibold md:col-span-2">Semester setup</h2>
              <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={semesterForm.courseId} onChange={(event) => setSemesterForm((current) => ({ ...current, courseId: event.target.value }))}>
                <option value="">Select course</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.code} - {course.name}</option>)}
              </select>
              <input className="h-9 rounded border border-line px-2 text-sm" min="1" placeholder="Semester number" type="number" value={semesterForm.number} onChange={(event) => setSemesterForm((current) => ({ ...current, number: event.target.value }))} />
              <button className="h-9 rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white md:w-fit" type="submit">Add semester</button>
            </form>
          </div>

          <form className="grid gap-3 rounded border border-line bg-white p-3 md:grid-cols-4" onSubmit={handleSubjectSubmit}>
            <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={subjectForm.courseId} onChange={(event) => setSubjectForm((current) => ({ ...current, courseId: event.target.value, semesterId: "" }))}>
              <option value="">Select course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.code} - {course.name}</option>)}
            </select>
            <select className="h-9 rounded border border-line bg-white px-2 text-sm" value={subjectForm.semesterId} onChange={(event) => setSubjectForm((current) => ({ ...current, semesterId: event.target.value }))}>
              <option value="">Select semester</option>
              {semesters.map((semester) => <option key={semester.id} value={semester.id}>Semester {semester.number}</option>)}
            </select>
            <input className="h-9 rounded border border-line px-2 text-sm" placeholder="Subject code" value={subjectForm.subjectCode} onChange={(event) => setSubjectForm((current) => ({ ...current, subjectCode: event.target.value }))} />
            <input className="h-9 rounded border border-line px-2 text-sm" placeholder="Subject name" value={subjectForm.subjectName} onChange={(event) => setSubjectForm((current) => ({ ...current, subjectName: event.target.value }))} />
            <div className="flex gap-2 md:col-span-4">
              <button className="h-9 rounded border border-blue-700 bg-blue-700 px-3 text-sm font-medium text-white" type="submit">{editingSubjectId ? "Update subject" : "Add subject"}</button>
              {editingSubjectId ? <button className="h-9 rounded border border-line bg-white px-3 text-sm" type="button" onClick={resetSubjectForm}>Cancel</button> : null}
              {selectedSubjectCourse ? <span className="self-center text-sm text-muted">Selected course: {selectedSubjectCourse.name}</span> : null}
            </div>
          </form>

          <div className="overflow-hidden rounded border border-line">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-surface text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Code</th>
                  <th className="px-3 py-2 font-semibold">Subject</th>
                  <th className="px-3 py-2 font-semibold">Course</th>
                  <th className="px-3 py-2 font-semibold">Semester</th>
                  <th className="px-3 py-2 font-semibold">Files</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-surface">
                    <td className="px-3 py-2 font-mono text-xs">{subject.subjectCode}</td>
                    <td className="px-3 py-2 font-medium">{subject.subjectName}</td>
                    <td className="px-3 py-2 text-muted">{subject.course?.code} - {subject.course?.name}</td>
                    <td className="px-3 py-2 text-muted">Semester {subject.semester?.number}</td>
                    <td className="px-3 py-2 text-muted">{subject._count?.files ?? 0}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="mr-2 text-blue-700 hover:underline" type="button" onClick={() => beginEditSubject(subject)}>Edit</button>
                      <button className="text-red-700 hover:underline" type="button" onClick={() => handleDeleteSubject(subject.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 ? <tr><td className="px-3 py-6 text-center text-muted" colSpan="6">No subjects yet</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
