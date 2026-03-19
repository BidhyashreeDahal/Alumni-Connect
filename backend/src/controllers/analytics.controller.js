import { prisma } from "../db/prisma.js";

/**
 * Get dashboard analytics
 * Faculty/Admin only
 */
export async function getDashboard(req, res) {
  try {
    // total counts
    const totalStudents = await prisma.studentProfile.count();
    const totalAlumni = await prisma.alumniProfile.count();

    const claimedAlumni = await prisma.alumniProfile.count({
      where: { userId: { not: null } },
    });

    const mentorshipRequests = await prisma.mentorshipRequest.count();

    const acceptedMentorships = await prisma.mentorshipRequest.count({
      // Include completed mentorships since they were accepted earlier.
      where: { status: { in: ["accepted", "completed"] } },
    });

    const totalEvents = await prisma.event.count();

    const eventRegistrations = await prisma.eventRegistration.count();

    // top hiring companies
    const companies = await prisma.alumniProfile.groupBy({
      by: ["company"],
      where: {
        company: {
          not: null,
          notIn: [""],
        },
      },
      _count: { company: true },
      orderBy: {
        _count: { company: "desc" },
      },
      take: 5,
    });

    const topHiringCompanies = companies
      .map((c) => ({
        company: c.company,
        count: c._count.company,
      }));

    // alumni by graduation year
    const alumniByYearRaw = await prisma.alumniProfile.groupBy({
      by: ["graduationYear"],
      where: { graduationYear: { not: null } },
      _count: { graduationYear: true },
      orderBy: {
        graduationYear: "asc",
      },
    });

    const alumniByYear = alumniByYearRaw.map((row) => ({
      graduationYear: row.graduationYear,
      count: row._count.graduationYear,
    }));

    return res.json({
      totals: {
        students: totalStudents,
        alumni: totalAlumni,
        claimedAlumni,
        mentorshipRequests,
        acceptedMentorships,
        events: totalEvents,
        eventRegistrations,
      },
      topHiringCompanies,
      alumniByYear,
    });

  } catch (error) {
    req.log?.error({ err: error }, "Failed to generate analytics");
    return res.status(500).json({ message: "Failed to generate analytics" });
  }
}
