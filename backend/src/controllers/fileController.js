const fileService = require("../services/fileService");

async function uploadFile(req, res) {
  const file = await fileService.uploadFile({
    body: req.body,
    file: req.file,
    user: req.user,
    req,
  });

  res.status(201).json({ data: file });
}

async function listFiles(req, res) {
  const result = await fileService.listFiles(req.query, req.user);
  res.json(result);
}

async function getFile(req, res) {
  const file = await fileService.getPublicFile(req.params.id, req.user);
  res.json({ data: file });
}

async function downloadFile(req, res) {
  const file = await fileService.incrementDownloadCount(req.params.id, req.user);
  res.json({ data: file });
}

async function updateFile(req, res) {
  const file = await fileService.updateFile(req.params.id, req.body, req.user.id);
  res.json({ data: file });
}

async function deleteFile(req, res) {
  await fileService.deleteFile(req.params.id, req.user.id);
  res.status(204).send();
}

async function searchFiles(req, res) {
  const result = await fileService.searchFiles(req.query, req.user);
  res.json(result);
}

module.exports = { uploadFile, listFiles, getFile, downloadFile, updateFile, deleteFile, searchFiles };
