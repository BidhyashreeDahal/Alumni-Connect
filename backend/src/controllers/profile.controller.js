import { prisma } from "../db/prisma.js";
import {
  isAdminOrFaculty,
  sanitizeAlumniProfile,
  sanitizeStudentProfile
} from "../policies/access.policy.js";

/**
 * GET /profiles/:id
 * Fetch either alumni or student profile
 */
export async function getProfileById(req, res) {
  const { id } = req.params;
  const requester = req.user;

  try {

    // Check alumni profiles first
    const alumni = await prisma.alumniProfile.findUnique({
      where: { id },
      include: { user: { select: { email: true } } }
    });

    if (alumni && (!alumni.isArchived || isAdminOrFaculty(requester.role))) {
      return res.json({
        profileType: "alumni",
        profile: sanitizeAlumniProfile(alumni, requester)
      });
    }

    // Then check student profiles
    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: { user: { select: { email: true } } }
    });

    if (student && (!student.isArchived || isAdminOrFaculty(requester.role))) {
      const isSelf = student.userId === requester.id;
      const canViewStudentProfile =
        requester.role === "admin" ||
        requester.role === "faculty" ||
        requester.role === "alumni" ||
        isSelf;

      if (!canViewStudentProfile) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return res.json({
        profileType: "student",
        profile: sanitizeStudentProfile(student, requester)
      });
    }

    return res.status(404).json({ message: "Profile not found" });

  } catch (error) {
    req.log?.error({ err: error }, "Profile fetch error");
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}