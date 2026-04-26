import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/colleges", label: "Colleges" },
  { to: "/admin/courses", label: "Courses" },
  { to: "/admin/semesters", label: "Semesters" },
  { to: "/admin/subjects", label: "Subjects" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { clearSession, currentUser } = useAuth();

  function handleLogout() {
    clearSession();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white p-5 md:block">
        <div className="text-3xl font-bold tracking-tight">lexora.</div>
        <p className="mt-2 text-xs uppercase tracking-wide text-muted">Admin tools</p>
        <nav className="mt-6 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-blue-700 text-white" : "text-ink hover:bg-surface"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white px-4 md:px-6">
          <div>
            <p className="text-sm font-semibold">Admin Panel</p>
            <p className="text-xs text-muted">{currentUser?.username ?? "admin"}</p>
          </div>
          <button className="rounded border border-line px-3 py-2 text-sm hover:bg-surface" type="button" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
