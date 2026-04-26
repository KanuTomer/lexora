const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const auditService = require("./auditService");
const { destroyAsset, uploadBuffer } = require("./cloudinaryService");
const fileRepository = require("../repositories/fileRepository");
const reportRepository = require("../repositories/reportRepository");
const subjectRepository = require("../repositories/subject.repository");
const userRepository = require("../repositories/user.repository");
const { assertSubjectInScope, getSubjectScope } = require("./tenantScope");

const allowedFileTypes = new Set(["notes", "assignment", "test-paper", "syllabus"]);
const allowedSorts = new Set(["recent", "downloads"]);
const allowedUploadMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);
const allowedUploadExtensions = new Set([".pdf", ".png", ".jpg", ".jpeg"]);

function createHttpError(message, statusCode, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

async function cleanupUploadedFile(file) {
  if (!file?.path) {
    return;
  }

  await fs.unlink(file.path).catch(() => {});
}

function getUploadedFilePath(fileUrl) {
  try {
    const url = new URL(fileUrl);
    const filename = path.basename(decodeURIComponent(url.pathname));
    return path.resolve(__dirname, "../../../uploads", filename);
  } catch {
    return null;
  }
}

async function validateSubject(subjectId, user) {
  const subject = await subjectRepository.findById(subjectId, { where: getSubjectScope(user) });
  if (!subject) {
    throw createHttpError("Subject not found", 404);
  }
  assertSubjectInScope(subject, user);
  return subject;
}

async function hasCatalogPlacementInScope(subjectCatalogId, user) {
  if (!subjectCatalogId) {
    return false;
  }

  const subject = await subjectRepository.findFirst({
    where: {
      subjectCatalogId,
      ...getSubjectScope(user),
    },
  });
  return Boolean(subject);
}

function parsePagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const requestedLimit = Number.parseInt(query.limit, 10) || 10;
  const limit = Math.min(Math.max(requestedLimit, 1), 50);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    total,
    totalCount: total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
    nextPage: page < totalPages ? page + 1 : null,
  };
}

function getOrderBy(sort) {
  return sort === "downloads"
    ? [{ downloads: "desc" }, { createdAt: "desc" }, { id: "desc" }]
    : [{ createdAt: "desc" }, { id: "desc" }];
}

function canModerate(user) {
  return user?.role === "moderator" || user?.role === "admin";
}

async function validateUploader(uploadedById) {
  if (!uploadedById) {
    throw createHttpError("Authentication required", 401);
  }

  const user = await userRepository.findById(uploadedById);
  if (!user) {
    throw createHttpError("Uploader user not found", 404);
  }

  return user;
}

function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function resolveStoredAsset(file) {
  const contentHash = hashBuffer(file.buffer);
  const existingAsset = await fileRepository.findAssetByHash(contentHash);
  if (existingAsset) {
    return {
      assetId: existingAsset.id,
      contentHash,
      fileUrl: existingAsset.fileUrl,
      publicId: existingAsset.publicId,
      deduplicated: true,
    };
  }

  let uploadResult;
  try {
    uploadResult = await uploadBuffer(file.buffer, "lexora/files");
    if (process.env.NODE_ENV !== "production") {
      console.log("Cloudinary file upload succeeded", {
        originalName: file.originalname,
        publicId: uploadResult.public_id,
        contentHash,
      });
    }
  } catch (cloudinaryError) {
    console.error("Cloudinary file upload failed", cloudinaryError);
    throw createHttpError("Upload failed. Please try again.", 502);
  }

  try {
    const asset = await fileRepository.createAsset({
      contentHash,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      size: file.size,
      mimeType: file.mimetype,
    });

    return {
      assetId: asset.id,
      contentHash,
      fileUrl: asset.fileUrl,
      publicId: asset.publicId,
      deduplicated: false,
    };
  } catch (error) {
    if (error.code === "P2002") {
      const racedAsset = await fileRepository.findAssetByHash(contentHash);
      if (racedAsset) {
        await destroyAsset(uploadResult.public_id).catch((destroyError) => {
          console.error("Failed to clean up duplicate Cloudinary asset", destroyError);
        });
        return {
          assetId: racedAsset.id,
          contentHash,
          fileUrl: racedAsset.fileUrl,
          publicId: racedAsset.publicId,
          deduplicated: true,
        };
      }
    }

    await destroyAsset(uploadResult.public_id).catch((destroyError) => {
      console.error("Failed to clean up Cloudinary asset after asset create failure", destroyError);
    });
    throw error;
  }
}

async function uploadFile({ body, file, user, req }) {
  try {
    if (!file) {
      throw createHttpError("File is required", 400);
    }

    const extension = path.extname(file.originalname || "").toLowerCase();
    if (!allowedUploadMimeTypes.has(file.mimetype) || !allowedUploadExtensions.has(extension)) {
      throw createHttpError("Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed.", 400);
    }

    const { title, subjectId, fileType } = body;
    const missingFields = ["title", "subjectId", "fileType"].filter((field) => !body[field]);
    if (missingFields.length > 0) {
      throw createHttpError("Missing required upload fields", 400, { missingFields });
    }

    if (!allowedFileTypes.has(fileType)) {
      throw createHttpError("Invalid file type", 400, {
        allowedFileTypes: Array.from(allowedFileTypes),
      });
    }

    const uploader = await validateUploader(user?.id);
    const subject = await validateSubject(subjectId, uploader);
    const storedAsset = await resolveStoredAsset(file);

    return fileRepository.create({
      title,
      fileUrl: storedAsset.fileUrl,
      publicId: storedAsset.publicId,
      contentHash: storedAsset.contentHash,
      assetId: storedAsset.assetId,
      fileType,
      size: file.size,
      status: uploader.uploadPrivilege === "trusted" ? "approved" : "pending",
      subjectId,
      subjectCatalogId: subject.subjectCatalogId ?? null,
      uploadedById: user.id,
    });
  } catch (error) {
    await cleanupUploadedFile(file);
    throw error;
  }
}

async function listFiles(query, user) {
  const { page, limit, skip, take } = parsePagination(query);
  const sort = allowedSorts.has(query.sort) ? query.sort : "recent";
  const subjectWhere = getSubjectScope(user);

  if (query.fileType && !allowedFileTypes.has(query.fileType)) {
    throw createHttpError("Invalid file type", 400, {
      allowedFileTypes: Array.from(allowedFileTypes),
    });
  }

  const subject = query.subjectId ? await validateSubject(query.subjectId, user) : null;
  const shouldUseSharedCatalog = Boolean(subject?.subjectCatalogId);

  const filters = {
    subjectId: shouldUseSharedCatalog ? undefined : query.subjectId,
    subjectCatalogId: shouldUseSharedCatalog ? subject.subjectCatalogId : undefined,
    semesterId: query.semesterId,
    uploadedById: query.uploadedById,
    fileType: query.fileType,
    status: canModerate(user) ? (query.status ?? "approved") : "approved",
    isStale: query.isStale,
    subjectWhere: shouldUseSharedCatalog ? undefined : subjectWhere,
    orderBy: getOrderBy(sort),
    skip,
    take,
  };

  const [files, total] = await Promise.all([
    fileRepository.findMany(filters),
    fileRepository.countMany(filters),
  ]);

  return {
    data: files,
    meta: buildPaginationMeta(total, page, limit),
  };
}

async function listReportedFiles(query, user) {
  const { page, limit, skip, take } = parsePagination(query);
  const orderBy = query.sort === "recent"
    ? [{ updatedAt: "desc" }, { id: "desc" }]
    : [{ reportsCount: "desc" }, { updatedAt: "desc" }, { id: "desc" }];
  const subjectWhere = getSubjectScope(user);
  const [files, total] = await Promise.all([
    fileRepository.findReported({ subjectWhere, orderBy, skip, take }),
    fileRepository.countReported({ subjectWhere }),
  ]);
  const recentReports = await reportRepository.findRecentByFileIds(files.map((file) => file.id));
  const reportReasonsByFile = new Map();
  for (const report of recentReports) {
    const reasons = reportReasonsByFile.get(report.fileId) ?? [];
    reasons.push(report.reason);
    reportReasonsByFile.set(report.fileId, reasons);
  }

  return {
    data: files.map((file) => {
      const reasons = reportReasonsByFile.get(file.id) ?? [];
      const reasonCounts = reasons.reduce((counts, reason) => {
        counts[reason] = (counts[reason] ?? 0) + 1;
        return counts;
      }, {});
      const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      return {
        ...file,
        reportReasons: reasons,
        topReason,
      };
    }),
    meta: buildPaginationMeta(total, page, limit),
  };
}

async function listStaleFiles(query, user) {
  const { page, limit, skip, take } = parsePagination(query);
  const orderBy = query.sort === "recent"
    ? [{ updatedAt: "desc" }, { id: "desc" }]
    : [{ updatedAt: "asc" }, { id: "asc" }];
  const subjectWhere = getSubjectScope(user);
  const [files, total] = await Promise.all([
    fileRepository.findStale({ subjectWhere, orderBy, skip, take }),
    fileRepository.countStale({ subjectWhere }),
  ]);

  return {
    data: files,
    meta: buildPaginationMeta(total, page, limit),
  };
}

async function getFile(id, user) {
  const file = await fileRepository.findById(id);
  if (!file) {
    throw createHttpError("File not found", 404);
  }
  if (user) {
    try {
      assertSubjectInScope(file.subject, user);
    } catch (error) {
      if (!(await hasCatalogPlacementInScope(file.subjectCatalogId, user))) {
        throw createHttpError("File not found", 404);
      }
    }
  }
  return file;
}

async function getPublicFile(id, user) {
  const file = await getFile(id, user);
  if (file.status !== "approved") {
    throw createHttpError("File not found", 404);
  }
  return file;
}

async function incrementDownloadCount(id, user) {
  await getPublicFile(id, user);
  return fileRepository.incrementDownloads(id);
}

function ensureOwner(file, userId) {
  if (!userId) {
    throw createHttpError("Authentication required", 401);
  }

  if (file.uploadedById !== userId) {
    throw createHttpError("Forbidden", 403);
  }
}

async function updateFile(id, payload, userId) {
  const file = await getFile(id);
  ensureOwner(file, userId);

  const data = {};
  if (Object.prototype.hasOwnProperty.call(payload, "title")) {
    if (!payload.title?.trim()) {
      throw createHttpError("Title is required", 400);
    }
    data.title = payload.title.trim();
  }

  if (Object.prototype.hasOwnProperty.call(payload, "fileType")) {
    if (!allowedFileTypes.has(payload.fileType)) {
      throw createHttpError("Invalid file type", 400, {
        allowedFileTypes: Array.from(allowedFileTypes),
      });
    }
    data.fileType = payload.fileType;
  }

  if (Object.keys(data).length === 0) {
    throw createHttpError("No editable fields provided", 400, {
      editableFields: ["title", "fileType"],
    });
  }

  return fileRepository.updateById(id, data);
}

async function deleteFile(id, userId) {
  const file = await getFile(id);
  ensureOwner(file, userId);

  await deleteFileRecordAndAsset(file);
}

async function deleteFileRecordAndAsset(file) {
  const shouldDeleteSharedAsset = file.assetId
    ? (await fileRepository.countByAssetId(file.assetId)) <= 1
    : true;

  await fileRepository.deleteById(file.id);

  if (shouldDeleteSharedAsset && file.publicId) {
    await destroyAsset(file.publicId).catch((error) => {
      console.error("Failed to delete Cloudinary asset", error);
    });
    return;
  }

  const uploadedPath = getUploadedFilePath(file.fileUrl);
  const uploadsRoot = path.resolve(__dirname, "../../../uploads");
  const relativePath = uploadedPath ? path.relative(uploadsRoot, uploadedPath) : "";
  if (uploadedPath && relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    await fs.unlink(uploadedPath).catch(() => {});
  }
}

async function deleteFileAsModerator(id, actor) {
  const file = await getFile(id, actor);
  await auditService.logAction({
    action: "moderation.file.deleted",
    actorId: actor.id,
    targetId: file.id,
    metadata: { status: file.status, reportsCount: file.reportsCount },
  });
  await deleteFileRecordAndAsset(file);
}

async function approveFileAsModerator(id, actor) {
  const file = await getFile(id, actor);
  await reportRepository.clearForFile(file.id);
  const updatedFile = await fileRepository.updateById(file.id, {
    status: "approved",
    reportsCount: 0,
    rejectionReason: null,
    moderatedAt: new Date(),
    moderatorId: actor.id,
  });
  await auditService.logAction({
    action: "moderation.file.approved",
    actorId: actor.id,
    targetId: file.id,
    metadata: { previousStatus: file.status },
  });
  return updatedFile;
}

async function rejectFileAsModerator(id, actor, reason) {
  const file = await getFile(id, actor);
  await reportRepository.clearForFile(file.id);
  const updatedFile = await fileRepository.updateById(file.id, {
    status: "rejected",
    reportsCount: 0,
    rejectionReason: typeof reason === "string" && reason.trim() ? reason.trim() : null,
    moderatedAt: new Date(),
    moderatorId: actor.id,
  });
  await auditService.logAction({
    action: "moderation.file.rejected",
    actorId: actor.id,
    targetId: file.id,
    metadata: { previousStatus: file.status, reason: updatedFile.rejectionReason },
  });
  return updatedFile;
}

async function ignoreReportsAsModerator(id, actor) {
  const file = await getFile(id, actor);
  await reportRepository.clearForFile(file.id);
  const refreshedFile = await fileRepository.findById(file.id);
  await auditService.logAction({
    action: "moderation.file.ignored",
    actorId: actor.id,
    targetId: file.id,
    metadata: { reportsCount: file.reportsCount },
  });
  return refreshedFile;
}

async function keepStaleFileAsModerator(id, actor) {
  const file = await getFile(id, actor);
  const updatedFile = await fileRepository.updateById(file.id, { isStale: false });
  await auditService.logAction({
    action: "moderation.file.kept",
    actorId: actor.id,
    targetId: file.id,
    metadata: { isStale: false },
  });
  return updatedFile;
}

async function searchFiles(query, user) {
  const q = query.q?.trim();
  const { page, limit, skip, take } = parsePagination(query);
  const sort = allowedSorts.has(query.sort) ? query.sort : "recent";
  const subjectWhere = getSubjectScope(user);

  if (!q) {
    return {
      data: [],
      meta: buildPaginationMeta(0, page, limit),
    };
  }

  const where = {
    AND: [
      {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { subject: { subjectCode: { contains: q, mode: "insensitive" } } },
          { subject: { subjectName: { contains: q, mode: "insensitive" } } },
          { subjectCatalog: { subjectCode: { contains: q, mode: "insensitive" } } },
          { subjectCatalog: { canonicalName: { contains: q, mode: "insensitive" } } },
          { uploadedBy: { name: { contains: q, mode: "insensitive" } } },
          { uploadedBy: { username: { contains: q, mode: "insensitive" } } },
        ],
      },
      Object.keys(subjectWhere).length > 0
        ? {
            OR: [
              { subject: subjectWhere },
              { subjectCatalog: { subjects: { some: subjectWhere } } },
            ],
          }
        : {},
    ],
    status: "approved",
  };

  const [files, total] = await Promise.all([
    fileRepository.searchMany({ where, orderBy: getOrderBy(sort), skip, take }),
    fileRepository.countSearch(where),
  ]);

  return {
    data: files,
    meta: buildPaginationMeta(total, page, limit),
  };
}

module.exports = {
  uploadFile,
  listFiles,
  listReportedFiles,
  listStaleFiles,
  searchFiles,
  getFile,
  getPublicFile,
  incrementDownloadCount,
  updateFile,
  deleteFile,
  deleteFileAsModerator,
  approveFileAsModerator,
  rejectFileAsModerator,
  ignoreReportsAsModerator,
  keepStaleFileAsModerator,
};
