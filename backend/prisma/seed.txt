const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const college = await prisma.college.upsert({
    where: { slug: "demo-institute" },
    update: {},
    create: { name: "Demo Institute of Technology", slug: "demo-institute" },
  });

  const course = await prisma.course.upsert({
    where: { collegeId_code: { collegeId: college.id, code: "BTECH-CSE" } },
    update: {},
    create: { name: "B.Tech Computer Science", code: "BTECH-CSE", collegeId: college.id },
  });

  const program = await prisma.program.upsert({
    where: { collegeId_name: { collegeId: college.id, name: course.name } },
    update: {},
    create: { name: course.name, collegeId: college.id },
  });

  const semester = await prisma.semester.upsert({
    where: { courseId_number: { courseId: course.id, number: 4 } },
    update: {},
    create: { courseId: course.id, number: 4 },
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@opennote.local" },
    update: {},
    create: {
      name: "Demo Contributor",
      username: "demo_contributor",
      email: "demo@opennote.local",
      password: "$2b$12$spZVb0mGgwkXXqoWmMzHE.ZxKcW7Sv75LsYUhr2fgmSTsEOo6Bs8O",
      collegeId: college.id,
      programId: program.id,
    },
  });

  const dbms = await prisma.subject.upsert({
    where: {
      courseId_semesterId_subjectCode: {
        courseId: course.id,
        semesterId: semester.id,
        subjectCode: "CS401",
      },
    },
    update: {},
    create: {
      subjectCode: "CS401",
      subjectName: "Database Management Systems",
      courseId: course.id,
      semesterId: semester.id,
    },
  });

  await prisma.file.upsert({
    where: { id: "11111111-1111-4111-8111-111111111111" },
    update: {},
    create: {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Unit 1 relational model notes",
      fileUrl: "/uploads/demo-unit-1-relational-model.pdf",
      fileType: "notes",
      size: 1240000,
      subjectId: dbms.id,
      uploadedById: user.id,
      status: "approved",
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
