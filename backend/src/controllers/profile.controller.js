import { prisma } from "../db/prisma.js";

/**
 * GET /profiles/:id
 * Fetch either alumni or student profile
 */
export async function getProfileById(req, res) {
  const { id } = req.params;

  try {

    // Check alumni profiles first
    const alumni = await prisma.alumniProfile.findUnique({
      where: { id }
    });

    if (alumni) {
      return res.json({
        profileType: "alumni",
        profile: alumni
      });
    }

    // Then check student profiles
    const student = await prisma.studentProfile.findUnique({
      where: { id }
    });

    if (student) {
      return res.json({
        profileType: "student",
        profile: student
      });
    }

    return res.status(404).json({ message: "Profile not found" });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}