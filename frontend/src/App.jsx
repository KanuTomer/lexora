import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminColleges from "./pages/admin/AdminColleges.jsx";
import AdminCourses from "./pages/admin/AdminCourses.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminSemesters from "./pages/admin/AdminSemesters.jsx";
import AdminSubjects from "./pages/admin/AdminSubjects.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import BookmarksPage from "./pages/BookmarksPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FileDetailsPage from "./pages/FileDetailsPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import ModerationPanel from "./pages/ModerationPanel.jsx";
import Profile from "./pages/Profile.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import Signup from "./pages/Signup.jsx";
import SignupDetails from "./pages/SignupDetails.jsx";
import SubjectPage from "./pages/SubjectPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/signup/details"
        element={
          <ProtectedRoute>
            <SignupDetails />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="colleges" element={<AdminColleges />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="semesters" element={<AdminSemesters />} />
        <Route path="subjects" element={<AdminSubjects />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute disallowRole="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute disallowRole="admin">
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute disallowRole="admin">
              <SearchResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects/:subjectId"
          element={
            <ProtectedRoute disallowRole="admin">
              <SubjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute disallowRole="admin">
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/files/:fileId"
          element={
            <ProtectedRoute disallowRole="admin">
              <FileDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation"
          element={
            <ProtectedRoute role="moderator">
              <ModerationPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute disallowRole="admin">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:id" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
