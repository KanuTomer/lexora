import { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { getAdminUsers, getColleges, getPrograms, updateAdminUserRole } from "../services/api.js";

const roles = ["user", "moderator", "admin"];
const privileges = ["restricted", "trusted"];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filters, setFilters] = useState({ collegeId: "", programId: "", role: "", uploadPrivilege: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getColleges().then(setColleges).catch((loadError) => {
      console.error("Failed to load colleges", loadError);
    });
  }, []);

  useEffect(() => {
    if (!filters.collegeId) {
      setPrograms([]);
      setFilters((current) => ({ ...current, programId: "" }));
      return;
    }

    getPrograms({ collegeId: filters.collegeId }).then(setPrograms).catch((loadError) => {
      console.error("Failed to load programs", loadError);
    });
  }, [filters.collegeId]);

  useEffect(() => {
    async function loadUsers() {
      try {
        setError("");
        setIsLoading(true);
        setUsers(await getAdminUsers({
          collegeId: filters.collegeId || undefined,
          programId: filters.programId || undefined,
          role: filters.role || undefined,
          uploadPrivilege: filters.uploadPrivilege || undefined,
        }));
      } catch (loadError) {
        console.error("Failed to load users", loadError);
        setError("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [filters]);

  async function handleRoleChange(userId, role) {
    const updatedUser = await updateAdminUserRole(userId, role);
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Admin" }]} />
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted">Manage user roles.</p>
      </div>
      <div className="mb-3 grid gap-3 md:grid-cols-4">
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
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {isLoading ? (
        <div className="rounded border border-line p-6 text-sm text-muted">Loading users...</div>
      ) : (
        <div className="overflow-hidden rounded border border-line">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Username</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Program</th>
                <th className="px-3 py-2 font-semibold">Privilege</th>
                <th className="px-3 py-2 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface">
                  <td className="px-3 py-2 font-medium">{user.username}</td>
                  <td className="px-3 py-2 text-muted">{user.email}</td>
                  <td className="px-3 py-2 text-muted">{user.program?.name ?? "-"}</td>
                  <td className="px-3 py-2 text-muted">{user.uploadPrivilege}</td>
                  <td className="px-3 py-2">
                    <select
                      className="h-8 rounded border border-line bg-white px-2 text-sm outline-none focus:border-blue-600"
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
