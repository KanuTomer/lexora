import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000/api" : "/api");
export const BASE_URL = API_URL.endsWith("/api") ? API_URL.slice(0, -4) || "" : API_URL;

export const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function signup(payload) {
  const response = await api.post("/auth/signup", payload);
  return response.data.data;
}

export async function login(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data.data;
}

export async function getMe() {
  const response = await api.get("/users/me");
  return response.data.data;
}

export async function getUserProfile(id) {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
}

export async function updateMe(payload) {
  const response = await api.patch("/users/me", payload);
  return response.data.data;
}

export async function uploadAvatar(formData) {
  const response = await api.patch("/users/me/avatar", formData);
  return response.data.data;
}

export async function updateMyDetails(payload) {
  const response = await api.patch("/users/me/details", payload);
  return response.data.data;
}

export async function getColleges() {
  const response = await api.get("/colleges");
  return response.data.data;
}

export async function getPrograms(params = {}) {
  const response = await api.get("/programs", { params });
  return response.data.data;
}

export async function getSubjects() {
  const response = await api.get("/subjects");
  return response.data.data;
}

export async function getFiles(params = {}) {
  const response = await api.get("/files", { params });
  return response.data;
}

export async function getFilesBySubject(subjectId, params = {}) {
  return getFiles({ ...params, subjectId });
}

export async function searchFiles(params = {}) {
  const response = await api.get("/search", { params });
  return response.data;
}

export async function uploadFile(formData) {
  const response = await api.post("/files/upload", formData);
  return response.data.data;
}

export async function getFileById(id) {
  const response = await api.get(`/files/${id}`);
  return response.data.data;
}

export async function incrementDownload(id) {
  const response = await api.post(`/files/${id}/download`);
  return response.data.data;
}

export async function updateFile(id, payload) {
  const response = await api.patch(`/files/${id}`, payload);
  return response.data.data;
}

export async function deleteFile(id) {
  await api.delete(`/files/${id}`);
}

export async function getBookmarkedFiles() {
  const response = await api.get("/bookmarks");
  return response.data.data;
}

export async function toggleBookmark(fileId) {
  const response = await api.post(`/bookmarks/${fileId}`);
  return response.data.data;
}

export async function getModerationFiles(params = {}) {
  const response = await api.get("/moderation", { params });
  return response.data;
}

export async function getStaleModerationFiles(params = {}) {
  const response = await api.get("/moderation/stale", { params });
  return response.data;
}

export async function getModerationUsers() {
  const response = await api.get("/moderation/users");
  return response.data.data;
}

export async function getCourseModerators() {
  const response = await api.get("/moderators");
  return response.data.data;
}

export async function updateModerationUserPrivilege(id, uploadPrivilege) {
  const response = await api.patch(`/moderation/users/${id}/privilege`, { uploadPrivilege });
  return response.data.data;
}

export async function approveModerationFile(id) {
  const response = await api.post(`/moderation/${id}/approve`);
  return response.data.data;
}

export async function deleteModerationFile(id) {
  await api.post(`/moderation/${id}/delete`);
}

export async function ignoreModerationFile(id) {
  const response = await api.post(`/moderation/${id}/ignore`);
  return response.data.data;
}

export async function keepModerationFile(id) {
  const response = await api.post(`/moderation/${id}/keep`);
  return response.data.data;
}

export async function getReportedModerationFiles(params = {}) {
  const response = await api.get("/moderation/reported", { params });
  return response.data;
}

export async function reportFile(payload) {
  const response = await api.post("/reports", payload);
  return response.data.data;
}

export async function getAdminUsers(params = {}) {
  const response = await api.get("/admin/users", { params });
  return response.data.data;
}

export async function createAdminUser(payload) {
  const response = await api.post("/admin/users", payload);
  return response.data.data;
}

export async function updateAdminUser(id, payload) {
  const response = await api.patch(`/admin/users/${id}`, payload);
  return response.data.data;
}

export async function deleteAdminUser(id) {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data.data;
}

export async function updateAdminUserRole(id, role) {
  const response = await api.patch(`/admin/users/${id}/role`, { role });
  return response.data.data;
}

export async function getAdminColleges() {
  const response = await api.get("/admin/colleges");
  return response.data.data;
}

export async function createAdminCollege(payload) {
  const response = await api.post("/admin/colleges", payload);
  return response.data.data;
}

export async function updateAdminCollege(id, payload) {
  const response = await api.patch(`/admin/colleges/${id}`, payload);
  return response.data.data;
}

export async function deleteAdminCollege(id) {
  const response = await api.delete(`/admin/colleges/${id}`);
  return response.data.data;
}

export async function getAdminPrograms(params = {}) {
  const response = await api.get("/admin/programs", { params });
  return response.data.data;
}

export async function getAdminCourses(params = {}) {
  const response = await api.get("/admin/courses", { params });
  return response.data.data;
}

export async function createAdminCourse(payload) {
  const response = await api.post("/admin/courses", payload);
  return response.data.data;
}

export async function getAdminSemesters(params = {}) {
  const response = await api.get("/admin/semesters", { params });
  return response.data.data;
}

export async function createAdminSemester(payload) {
  const response = await api.post("/admin/semesters", payload);
  return response.data.data;
}

export async function getAdminSubjects(params = {}) {
  const response = await api.get("/admin/subjects", { params });
  return response.data.data;
}

export async function createAdminSubject(payload) {
  const response = await api.post("/admin/subjects", payload);
  return response.data.data;
}

export async function updateAdminSubject(id, payload) {
  const response = await api.patch(`/admin/subjects/${id}`, payload);
  return response.data.data;
}

export async function deleteAdminSubject(id) {
  const response = await api.delete(`/admin/subjects/${id}`);
  return response.data.data;
}

export async function importAdminAcademicData(payload) {
  const response = await api.post("/admin/import", payload);
  return response.data.data;
}
