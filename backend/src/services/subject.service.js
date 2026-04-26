const subjectRepository = require("../repositories/subject.repository");
const { getSubjectScope } = require("./tenantScope");

function hasPagination(query = {}) {
  return Object.prototype.hasOwnProperty.call(query, "page")
    || Object.prototype.hasOwnProperty.call(query, "limit");
}

function parsePagination(query = {}) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const requestedLimit = Number.parseInt(query.limit, 10) || 20;
  const limit = Math.min(Math.max(requestedLimit, 1), 100);
  return { page, limit, skip: (page - 1) * limit, take: limit };
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

async function listSubjects(user, query = {}) {
  const filters = { where: getSubjectScope(user) };

  if (!hasPagination(query)) {
    return subjectRepository.findMany(filters);
  }

  const { page, limit, skip, take } = parsePagination(query);
  const [subjects, total] = await Promise.all([
    subjectRepository.findMany({ ...filters, skip, take }),
    subjectRepository.countMany(filters),
  ]);

  return {
    data: subjects,
    meta: buildPaginationMeta(total, page, limit),
  };
}

async function getSubject(id, user) {
  const subject = await subjectRepository.findById(id, { where: getSubjectScope(user) });
  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }
  return subject;
}

module.exports = { listSubjects, getSubject };
