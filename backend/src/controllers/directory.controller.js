import { prisma } from "../db/prisma.js";

export async function listDirectoryUsers(req, res) {
  try {
    const role = req.user?.role;

    let users = [];

    // Fetch alumni (always available in directory)
    const alumni = await prisma.alumniProfile.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        program: true,
        graduationYear: true,
        jobTitle: true,
        company: true,
        skills: true,
        userId: true,
        user: {
          select: {
            id: true,
            role: true,
            email: true
          }
        }
      },
      orderBy: {
        graduationYear: "desc"
      }
    });

    const formattedAlumni = alumni.map((person) => ({
      id: person.user?.id || null,
      profileId: person.id,
      profileType: "alumni",
      role: person.user?.role || "alumni",
      email: person.user?.email || null,
      claimed: Boolean(person.userId),

      firstName: person.firstName,
      lastName: person.lastName,
      program: person.program,
      graduationYear: person.graduationYear,
      jobTitle: person.jobTitle,
      company: person.company,
      skills: person.skills
    }));

    users = [...formattedAlumni];

    // If alumni / faculty / admin → include students
    if (role === "alumni" || role === "faculty" || role === "admin") {

      const students = await prisma.studentProfile.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          program: true,
          graduationYear: true,
          skills: true,
          user: {
            select: {
              id: true,
              role: true,
              email: true
            }
          }
        },
        orderBy: {
          graduationYear: "desc"
        }
      });

      const formattedStudents = students.map((person) => ({
        id: person.user.id,
        profileId: person.id,
        profileType: "student",
        role: person.user.role,
        email: person.user.email,
        claimed: true,

        firstName: person.firstName,
        lastName: person.lastName,
        program: person.program,
        graduationYear: person.graduationYear,
        jobTitle: null,
        company: null,
        skills: person.skills
      }));

      users = [...users, ...formattedStudents];
    }

    return res.json({ users });

  } catch (error) {
    console.error("Directory fetch error:", error);
    return res.status(500).json({
      message: "Failed to fetch directory users"
    });
  }
}