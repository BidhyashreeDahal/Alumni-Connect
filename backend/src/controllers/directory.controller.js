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
