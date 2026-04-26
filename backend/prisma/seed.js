const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  /*
   =========================
   GBU (CSE)
   =========================
  */
  const gbu = await prisma.college.upsert({
    where: { slug: "gbu" },
    update: {},
    create: {
      name: "Gautam Buddha University",
      slug: "gbu",
    },
  });

  const gbuCourse = await prisma.course.upsert({
    where: {
      collegeId_code: {
        collegeId: gbu.id,
        code: "BTECH-CSE",
      },
    },
    update: {},
    create: {
      name: "B.Tech Computer Science and Engineering",
      code: "BTECH-CSE",
      collegeId: gbu.id,
    },
  });

  const gbuProgram = await prisma.program.upsert({
    where: {
      collegeId_name: {
        collegeId: gbu.id,
        name: gbuCourse.name,
      },
    },
    update: { courseId: gbuCourse.id },
    create: {
      name: gbuCourse.name,
      collegeId: gbu.id,
      courseId: gbuCourse.id,
    },
  });

  const gbuSem3 = await prisma.semester.upsert({
    where: {
      courseId_number: {
        courseId: gbuCourse.id,
        number: 3,
      },
    },
    update: {},
    create: {
      courseId: gbuCourse.id,
      number: 3,
    },
  });

  const gbuSem4 = await prisma.semester.upsert({
    where: {
      courseId_number: {
        courseId: gbuCourse.id,
        number: 4,
      },
    },
    update: {},
    create: {
      courseId: gbuCourse.id,
      number: 4,
    },
  });

  const gbuUser = await prisma.user.upsert({
    where: { email: "gbu@lexora.local" },
    update: {},
    create: {
      name: "GBU Contributor",
      username: "gbu_user",
      email: "gbu@lexora.local",
      password:
        "$2b$12$spZVb0mGgwkXXqoWmMzHE.ZxKcW7Sv75LsYUhr2fgmSTsEOo6Bs8O",
      collegeId: gbu.id,
      programId: gbuProgram.id,
    },
  });

  // ===== GBU SEM 3 =====
  const gbuSubjectsSem3 = [
    ["CS201", "Internet Technology"],
    ["CS203", "Concepts of Operating Systems"],
    ["CS205", "Data Structure & Algorithms"],
    ["CS207", "Problem Solving using C++"],
    ["CS209", "Logic Design"],
    ["MA201", "Engineering Mathematics-III"],
  ];

  for (const [code, name] of gbuSubjectsSem3) {
    await prisma.subject.upsert({
      where: {
        courseId_semesterId_subjectCode: {
          courseId: gbuCourse.id,
          semesterId: gbuSem3.id,
          subjectCode: code,
        },
      },
      update: {},
      create: {
        subjectCode: code,
        subjectName: name,
        courseId: gbuCourse.id,
        semesterId: gbuSem3.id,
      },
    });
  }

  // ===== GBU SEM 4 =====
  const gbuSubjectsSem4 = [
    ["CS202", "Software Engineering"],
    ["CS204", "Database Management System"],
    ["CS206", "Java Programming"],
    ["CS208", "Artificial Intelligence"],
    ["CS210", "Theory of Automata"],
    ["CS212", "Discrete Structures"],
  ];

  for (const [code, name] of gbuSubjectsSem4) {
    await prisma.subject.upsert({
      where: {
        courseId_semesterId_subjectCode: {
          courseId: gbuCourse.id,
          semesterId: gbuSem4.id,
          subjectCode: code,
        },
      },
      update: {},
      create: {
        subjectCode: code,
        subjectName: name,
        courseId: gbuCourse.id,
        semesterId: gbuSem4.id,
      },
    });
  }

  /*
   =========================
   DEMO COLLEGE (AI)
   =========================
  */
  const demo = await prisma.college.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo International College",
      slug: "demo",
    },
  });

  const demoCourse = await prisma.course.upsert({
    where: {
      collegeId_code: {
        collegeId: demo.id,
        code: "BTECH-AI",
      },
    },
    update: {},
    create: {
      name: "B.Tech Artificial Intelligence",
      code: "BTECH-AI",
      collegeId: demo.id,
    },
  });

  const demoProgram = await prisma.program.upsert({
    where: {
      collegeId_name: {
        collegeId: demo.id,
        name: demoCourse.name,
      },
    },
    update: { courseId: demoCourse.id },
    create: {
      name: demoCourse.name,
      collegeId: demo.id,
      courseId: demoCourse.id,
    },
  });

  const demoSem3 = await prisma.semester.upsert({
    where: {
      courseId_number: {
        courseId: demoCourse.id,
        number: 3,
      },
    },
    update: {},
    create: {
      courseId: demoCourse.id,
      number: 3,
    },
  });

  const demoSem4 = await prisma.semester.upsert({
    where: {
      courseId_number: {
        courseId: demoCourse.id,
        number: 4,
      },
    },
    update: {},
    create: {
      courseId: demoCourse.id,
      number: 4,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@lexora.local" },
    update: {},
    create: {
      name: "Demo Contributor",
      username: "demo_user",
      email: "demo@lexora.local",
      password:
        "$2b$12$spZVb0mGgwkXXqoWmMzHE.ZxKcW7Sv75LsYUhr2fgmSTsEOo6Bs8O",
      collegeId: demo.id,
      programId: demoProgram.id,
    },
  });

  // ===== DEMO SEM 3 =====
  const demoSubjectsSem3 = [
    ["AI201", "Software Engineering"],
    ["AI203", "Intelligent Systems"],
    ["AI205", "Theory of Computations"],
    ["AI207", "Database Management Systems"],
    ["AI209", "Image Processing and Computer Vision"],
    ["AI211", "Introduction to R Programming"],
  ];

  for (const [code, name] of demoSubjectsSem3) {
    await prisma.subject.upsert({
      where: {
        courseId_semesterId_subjectCode: {
          courseId: demoCourse.id,
          semesterId: demoSem3.id,
          subjectCode: code,
        },
      },
      update: {},
      create: {
        subjectCode: code,
        subjectName: name,
        courseId: demoCourse.id,
        semesterId: demoSem3.id,
      },
    });
  }

  // ===== DEMO SEM 4 =====
  const demoSubjectsSem4 = [
    ["AI202", "Machine Learning"],
    ["AI204", "Operating Systems"],
    ["AI206", "Embedded Systems"],
    ["AI208", "Design and Analysis of Algorithms"],
    ["AI210", "Quantum Computing"],
    ["AI212", "Computer Networks"],
  ];

  for (const [code, name] of demoSubjectsSem4) {
    await prisma.subject.upsert({
      where: {
        courseId_semesterId_subjectCode: {
          courseId: demoCourse.id,
          semesterId: demoSem4.id,
          subjectCode: code,
        },
      },
      update: {},
      create: {
        subjectCode: code,
        subjectName: name,
        courseId: demoCourse.id,
        semesterId: demoSem4.id,
      },
    });
  }

  console.log("🌱 Seed completed successfully");
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
