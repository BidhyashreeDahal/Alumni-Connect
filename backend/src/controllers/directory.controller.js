import { prisma } from "../db/prisma.js";
import {
  canViewStudentRows,
  sanitizeAlumniProfile,
  sanitizeStudentProfile
} from "../policies/access.policy.js";

export async function listDirectoryUsers(req, res) {
  try {

    const role = req.user?.role;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 12, 1), 100);

    const skip = (page - 1) * pageSize;

    const search = String(req.query.search || "").trim();
    const program = String(req.query.program || "").trim();
    const year = req.query.year ? Number(req.query.year) : null;
    const industry = String(req.query.industry || "").trim();
    const profileType = String(req.query.profileType || "").trim();
    const claimed = String(req.query.claimed || "").trim().toLowerCase();
    const updatedAfter = String(req.query.updatedAfter || "").trim();

    const updatedAfterDate = updatedAfter ? new Date(updatedAfter) : null;
    const validUpdatedAfter =
      updatedAfterDate && !Number.isNaN(updatedAfterDate.getTime());

    const alumniWhere = {
      isArchived: false,
      program: program || undefined,
      graduationYear: Number.isInteger(year) ? year : undefined,
      company: industry
        ? { contains: industry, mode: "insensitive" }
        : undefined,
      updatedAt: validUpdatedAfter ? { gte: updatedAfterDate } : undefined,
      userId:
        claimed === "claimed"
          ? { not: null }
          : claimed === "unclaimed"
          ? null
          : undefined,
      OR: search
        ? [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { personalEmail: { contains: search, mode: "insensitive" } },
            { schoolEmail: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } },
            { jobTitle: { contains: search, mode: "insensitive" } }
          ]
        : undefined
    };

    const studentWhere = {
      isArchived: false,
      program: program || undefined,
      graduationYear: Number.isInteger(year) ? year : undefined,
      updatedAt: validUpdatedAfter ? { gte: updatedAfterDate } : undefined,
      OR: search
        ? [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            {
              user: {
                is: { email: { contains: search, mode: "insensitive" } }
              }
            }
          ]
        : undefined
    };

    const shouldLoadAlumni =
      !profileType || profileType === "alumni";

    const shouldLoadStudents =
      canViewStudentRows(role) &&
      (!profileType || profileType === "student");

    let users = [];
    let total = 0;

    /*
    -------------------------
    ALUMNI
    -------------------------
    */

    if (shouldLoadAlumni) {

      const [alumni, alumniCount] = await Promise.all([

        prisma.alumniProfile.findMany({
          where: alumniWhere,
          include: {
            user: {
              select: {
                id: true,
                role: true,
                email: true
              }
            }
          },
          orderBy: [
            { updatedAt: "desc" },
            { lastName: "asc" },
            { firstName: "asc" }
          ],
          skip,
          take: pageSize
        }),

        prisma.alumniProfile.count({
          where: alumniWhere
        })

      ]);

      total += alumniCount;

      users = users.concat(
        alumni.map((person) => {
          const safe = sanitizeAlumniProfile(person, req.user);

          return {
            id: person.user?.id || null,
            profileId: safe.id,
            profileType: "alumni",
            role: person.user?.role || "alumni",
            claimed: Boolean(person.userId),
            firstName: safe.firstName,
            lastName: safe.lastName,
            program: safe.program,
            graduationYear: safe.graduationYear,
            jobTitle: safe.jobTitle,
            company: safe.company,
            skills: safe.skills,
            updatedAt: safe.updatedAt,
            email: safe.personalEmail || safe.schoolEmail || null
          };
        })
      );
    }

    /*
    -------------------------
    STUDENTS
    -------------------------
    */

    if (shouldLoadStudents) {

      const [students, studentCount] = await Promise.all([

        prisma.studentProfile.findMany({
          where: studentWhere,
          include: {
            user: {
              select: {
                id: true,
                role: true,
                email: true
              }
            }
          },
          orderBy: [
            { updatedAt: "desc" },
            { lastName: "asc" },
            { firstName: "asc" }
          ],
          skip,
          take: pageSize
        }),

        prisma.studentProfile.count({
          where: studentWhere
        })

      ]);

      total += studentCount;

      users = users.concat(
        students.map((person) => {
          const safe = sanitizeStudentProfile(person, req.user);

          return {
            id: person.user.id,
            profileId: safe.id,
            profileType: "student",
            role: person.user.role,
            claimed: true,
            firstName: safe.firstName,
            lastName: safe.lastName,
            program: safe.program,
            graduationYear: safe.graduationYear,
            jobTitle: null,
            company: null,
            skills: safe.skills,
            updatedAt: safe.updatedAt,
            email: safe.schoolEmail
          };
        })
      );
    }

    return res.json({
      users,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });

  } catch (error) {

    console.error("Directory fetch error:", error);

    return res.status(500).json({
      message: "Failed to fetch directory users"
    });

  }
}