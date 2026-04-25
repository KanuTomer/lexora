const fileService = require("../services/fileService");
const moderationUserService = require("../services/moderationUserService");

async function listFiles(req, res) {
  const result = await fileService.listFiles({ ...req.query, status: "pending" });
  res.json(result);
}

async function listReportedFiles(req, res) {
  const result = await fileService.listReportedFiles(req.query);
  res.json(result);
}

async function listStaleFiles(req, res) {
  const result = await fileService.listStaleFiles(req.query);
  res.json(result);
}

async function listUsers(req, res) {
  const users = await moderationUserService.listUsers(req.user);
  res.json({ data: users });
}

async function updateUserPrivilege(req, res) {
  const user = await moderationUserService.updatePrivilege(
    req.user,
    req.params.id,
    req.body.uploadPrivilege,
  );
  res.json({ data: user });
}

async function approveFile(req, res) {
  const file = await fileService.approveFileAsModerator(
    req.params.id ?? req.params.fileId,
    req.user.id,
  );
  res.json({ data: file });
}

async function deleteFile(req, res) {
  await fileService.deleteFileAsModerator(req.params.id ?? req.params.fileId, req.user.id);
  res.status(204).send();
}

async function ignoreFile(req, res) {
  const file = await fileService.ignoreReportsAsModerator(
    req.params.id ?? req.params.fileId,
    req.user.id,
  );
  res.json({ data: file });
}

async function keepFile(req, res) {
  const file = await fileService.keepStaleFileAsModerator(
    req.params.id ?? req.params.fileId,
    req.user.id,
  );
  res.json({ data: file });
}

module.exports = {
  approveFile,
  deleteFile,
  ignoreFile,
  listFiles,
  listReportedFiles,
  listStaleFiles,
  listUsers,
  updateUserPrivilege,
  keepFile,
};
