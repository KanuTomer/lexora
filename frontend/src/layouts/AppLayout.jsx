import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import { AcademicProvider } from "../context/AcademicContext.jsx";

export default function AppLayout() {
  return (
    <AcademicProvider>
      <div className="min-h-screen bg-white text-ink">
        <Topbar />
        <div className="flex">
          <Sidebar />
          <main className="min-h-[calc(100vh-57px)] flex-1 overflow-x-auto bg-white">
            <div className="mx-auto w-full max-w-7xl px-5 py-5">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AcademicProvider>
  );
}
