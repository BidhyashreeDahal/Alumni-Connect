import { prisma } from "../db/prisma.js";

/**
 * List alumni for students to browse mentors
 */
export async function listAlumni(req, res) {
  const alumni = await prisma.alumniProfile.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      program: true,
      graduationYear: true,
      jobTitle: true,
      company: true,
      skills: true
    },
    orderBy: {
      graduationYear: "desc"
    }
  });

  res.json({ alumni });
}

/**
 * List students directory
 */
export async function listStudents(req, res) {
  const { program, year, search } = req.query;

  const students = await prisma.studentProfile.findMany({
    where: {
      program: program || undefined,
      graduationYear: year ? Number(year) : undefined,
      OR: search
        ? [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } }
          ]
        : undefined
    },
    orderBy: { createdAt: "desc" }
  });

  return res.json({ students });
}
