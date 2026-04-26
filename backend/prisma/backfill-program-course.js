const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function normalizeAcademicName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\bprogramme\b/g, "program")
    .replace(/\btechnology\b/g, "tech")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}

async function main() {
  const programs = await prisma.program.findMany({
    include: {
      college: true,
      course: { select: { id: true, code: true, name: true, collegeId: true } },
    },
  });

  let linked = 0;
  let alreadyLinked = 0;
  const unmatched = [];
  const ambiguous = [];
  const mismatched = [];

  console.log(`Inspecting ${programs.length} program(s).`);

  for (const program of programs) {
    const candidateCourses = await prisma.course.findMany({
      where: { collegeId: program.collegeId },
      select: { id: true, code: true, name: true },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });

    const normalizedProgramName = normalizeAcademicName(program.name);
    const matches = candidateCourses.filter((course) => normalizeAcademicName(course.name) === normalizedProgramName);

    console.log("Inspecting program:", {
      programId: program.id,
      programName: program.name,
      normalizedProgramName,
      collegeId: program.collegeId,
      collegeName: program.college?.name,
      candidateCourses: candidateCourses.map((course) => ({
        id: course.id,
        code: course.code,
        name: course.name,
        normalizedName: normalizeAcademicName(course.name),
      })),
      matchedCourseIds: matches.map((course) => course.id),
      existingCourseId: program.courseId,
      existingCourse: program.course
        ? {
            id: program.course.id,
            code: program.course.code,
            name: program.course.name,
            collegeId: program.course.collegeId,
            normalizedName: normalizeAcademicName(program.course.name),
          }
        : null,
    });

    if (program.courseId) {
      alreadyLinked += 1;

      const normalizedLinkedCourseName = normalizeAcademicName(program.course?.name);
      if (
        !program.course ||
        program.course.collegeId !== program.collegeId ||
        normalizedLinkedCourseName !== normalizedProgramName
      ) {
        mismatched.push({
          programId: program.id,
          programName: program.name,
          normalizedProgramName,
          collegeId: program.collegeId,
          collegeName: program.college?.name,
          linkedCourse: program.course,
          expectedMatches: matches.map((course) => ({
            id: course.id,
            code: course.code,
            name: course.name,
            normalizedName: normalizeAcademicName(course.name),
          })),
        });
      }

      continue;
    }

    if (matches.length === 0) {
      unmatched.push({
        programId: program.id,
        programName: program.name,
        normalizedProgramName,
        collegeId: program.collegeId,
        collegeName: program.college?.name,
        candidateCourses: candidateCourses.map((course) => ({
          id: course.id,
          code: course.code,
          name: course.name,
          normalizedName: normalizeAcademicName(course.name),
        })),
      });
      continue;
    }

    if (matches.length > 1) {
      ambiguous.push({
        programId: program.id,
        programName: program.name,
        normalizedProgramName,
        collegeId: program.collegeId,
        collegeName: program.college?.name,
        matches: matches.map((course) => ({
          id: course.id,
          code: course.code,
          name: course.name,
          normalizedName: normalizeAcademicName(course.name),
        })),
      });
      continue;
    }

    const [course] = matches;

    await prisma.program.update({
      where: { id: program.id },
      data: { courseId: course.id },
    });
    linked += 1;
  }

  console.log(`Program-course backfill complete. Linked ${linked} program(s). Already linked ${alreadyLinked} program(s).`);
  if (unmatched.length > 0) {
    console.warn("Unmatched programs require manual review:");
    console.warn(JSON.stringify(unmatched, null, 2));
  }

  if (ambiguous.length > 0) {
    console.warn("Ambiguous programs were not linked:");
    console.warn(JSON.stringify(ambiguous, null, 2));
  }

  if (mismatched.length > 0) {
    console.warn("Existing program-course links that need manual review:");
    console.warn(JSON.stringify(mismatched, null, 2));
  }
}

main()
  .catch((error) => {
    console.error("Program-course backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
