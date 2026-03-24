import { prisma } from "../db/prisma.js";
import {
  canViewStudentRows,
  sanitizeAlumniProfile,
  sanitizeStudentProfile
} from "../policies/access.policy.js";

function tokenizeSearch(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
}

function buildAlumniSearchConditions(search) {
  const terms = tokenizeSearch(search);

  return terms.map((term) => {
    const lowerTerm = term.toLowerCase();
    const asNumber = Number(term);
    const isInteger = Number.isInteger(asNumber);

    if (lowerTerm === "claimed") return { userId: { not: null } };
    if (lowerTerm === "unclaimed") return { userId: null };

    const orConditions = [
      { firstName: { contains: term, mode: "insensitive" } },
      { lastName: { contains: term, mode: "insensitive" } },
      { personalEmail: { contains: term, mode: "insensitive" } },
      { schoolEmail: { contains: term, mode: "insensitive" } },
      { company: { contains: term, mode: "insensitive" } },
      { jobTitle: { contains: term, mode: "insensitive" } },
      { program: { contains: term, mode: "insensitive" } },
      { user: { is: { email: { contains: term, mode: "insensitive" } } } },
      { skills: { has: term } },
    ];

    if (isInteger) {
      orConditions.push({ graduationYear: asNumber });
    }

    return { OR: orConditions };
  });
}

function buildStudentSearchConditions(search) {
  const terms = tokenizeSearch(search);

  return terms.map((term) => {
    const lowerTerm = term.toLowerCase();
    const asNumber = Number(term);
    const isInteger = Number.isInteger(asNumber);

    if (lowerTerm === "claimed") return { userId: { not: null } };
    if (lowerTerm === "unclaimed") return { userId: null };

    const orConditions = [
      { firstName: { contains: term, mode: "insensitive" } },
      { lastName: { contains: term, mode: "insensitive" } },
      { personalEmail: { contains: term, mode: "insensitive" } },
      { schoolEmail: { contains: term, mode: "insensitive" } },
      { program: { contains: term, mode: "insensitive" } },
      { interests: { contains: term, mode: "insensitive" } },
      { user: { is: { email: { contains: term, mode: "insensitive" } } } },
      { skills: { has: term } },
    ];

    if (isInteger) {
      orConditions.push({ graduationYear: asNumber });
    }

    return { OR: orConditions };
  });
}

export async function listDirectoryUsers(req, res) {
  try {

    const role = req.user?.role;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 12, 1), 100);

    const skip = (page - 1) * pageSize;

    const search = String(req.query.search || "").trim();
    const firstName = String(req.query.firstName || "").trim();
    const lastName = String(req.query.lastName || "").trim();
    const email = String(req.query.email || "").trim();
    const schoolEmail = String(req.query.schoolEmail || "").trim();
    const personalEmail = String(req.query.personalEmail || "").trim();
    const program = String(req.query.program || "").trim();
    const year = req.query.year ? Number(req.query.year) : null;
    const industry = String(req.query.industry || "").trim();
    const company = String(req.query.company || "").trim();
    const jobTitle = String(req.query.jobTitle || "").trim();
    const skill = String(req.query.skill || "").trim();
    const interests = String(req.query.interests || "").trim();
    const hasLinkedin = String(req.query.hasLinkedin || "").trim().toLowerCase();
    const hasMeetingLink = String(req.query.hasMeetingLink || "").trim().toLowerCase();
    const profileType = String(req.query.profileType || "").trim();
    const claimed = String(req.query.claimed || "").trim().toLowerCase();
    const updatedAfter = String(req.query.updatedAfter || "").trim();
    const updatedBefore = String(req.query.updatedBefore || "").trim();

    const updatedAfterDate = updatedAfter ? new Date(updatedAfter) : null;
    const updatedBeforeDate = updatedBefore ? new Date(updatedBefore) : null;
    const validUpdatedAfter =
      updatedAfterDate && !Number.isNaN(updatedAfterDate.getTime());
    const validUpdatedBefore =
      updatedBeforeDate && !Number.isNaN(updatedBeforeDate.getTime());

    const updatedAtFilter = validUpdatedAfter || validUpdatedBefore
      ? {
          ...(validUpdatedAfter ? { gte: updatedAfterDate } : {}),
          ...(validUpdatedBefore ? { lte: updatedBeforeDate } : {}),
        }
      : null;

    const alumniAnd = [{ isArchived: false }];

    if (program) alumniAnd.push({ program: { contains: program, mode: "insensitive" } });
    if (Number.isInteger(year)) alumniAnd.push({ graduationYear: year });
    if (industry) alumniAnd.push({ company: { contains: industry, mode: "insensitive" } });
    if (company) alumniAnd.push({ company: { contains: company, mode: "insensitive" } });
    if (jobTitle) alumniAnd.push({ jobTitle: { contains: jobTitle, mode: "insensitive" } });
    if (firstName) alumniAnd.push({ firstName: { contains: firstName, mode: "insensitive" } });
    if (lastName) alumniAnd.push({ lastName: { contains: lastName, mode: "insensitive" } });
    if (personalEmail) alumniAnd.push({ personalEmail: { contains: personalEmail, mode: "insensitive" } });
    if (schoolEmail) alumniAnd.push({ schoolEmail: { contains: schoolEmail, mode: "insensitive" } });
    if (skill) alumniAnd.push({ skills: { has: skill } });
    if (hasLinkedin === "yes") alumniAnd.push({ linkedinUrl: { not: null } });
    if (hasLinkedin === "no") alumniAnd.push({ linkedinUrl: null });
    if (hasMeetingLink === "yes") alumniAnd.push({ meetingLink: { not: null } });
    if (hasMeetingLink === "no") alumniAnd.push({ meetingLink: null });
    if (updatedAtFilter) alumniAnd.push({ updatedAt: updatedAtFilter });
    if (claimed === "claimed") alumniAnd.push({ userId: { not: null } });
    if (claimed === "unclaimed") alumniAnd.push({ userId: null });
    if (email) {
      alumniAnd.push({
        OR: [
          { personalEmail: { contains: email, mode: "insensitive" } },
          { schoolEmail: { contains: email, mode: "insensitive" } },
          { user: { is: { email: { contains: email, mode: "insensitive" } } } },
        ],
      });
    }
    if (search) alumniAnd.push(...buildAlumniSearchConditions(search));

    const studentAnd = [{ isArchived: false }];
    if (program) studentAnd.push({ program: { contains: program, mode: "insensitive" } });
    if (Number.isInteger(year)) studentAnd.push({ graduationYear: year });
    if (firstName) studentAnd.push({ firstName: { contains: firstName, mode: "insensitive" } });
    if (lastName) studentAnd.push({ lastName: { contains: lastName, mode: "insensitive" } });
    if (personalEmail) studentAnd.push({ personalEmail: { contains: personalEmail, mode: "insensitive" } });
    if (schoolEmail) studentAnd.push({ schoolEmail: { contains: schoolEmail, mode: "insensitive" } });
    if (skill) studentAnd.push({ skills: { has: skill } });
    if (interests) studentAnd.push({ interests: { contains: interests, mode: "insensitive" } });
    if (hasLinkedin === "yes") studentAnd.push({ linkedinUrl: { not: null } });
    if (hasLinkedin === "no") studentAnd.push({ linkedinUrl: null });
    if (updatedAtFilter) studentAnd.push({ updatedAt: updatedAtFilter });
    if (claimed === "claimed") studentAnd.push({ userId: { not: null } });
    if (claimed === "unclaimed") studentAnd.push({ userId: null });
    if (email) {
      studentAnd.push({
        OR: [
          { personalEmail: { contains: email, mode: "insensitive" } },
          { schoolEmail: { contains: email, mode: "insensitive" } },
          { user: { is: { email: { contains: email, mode: "insensitive" } } } },
        ],
      });
    }
    if (search) studentAnd.push(...buildStudentSearchConditions(search));

    const alumniWhere = { AND: alumniAnd };
    const studentWhere = { AND: studentAnd };

    const shouldLoadAlumni =
      !profileType || profileType === "alumni";

    const shouldLoadStudents =
      canViewStudentRows(role) &&
      (!profileType || profileType === "student");

    function completionFlags(person, type) {
      const checks =
        type === "alumni"
          ? [
              Boolean(person.firstName),
              Boolean(person.lastName),
              Boolean(person.program),
              Boolean(person.graduationYear),
              Boolean(person.jobTitle),
              Boolean(person.company),
              (person.skills || []).length >= 3,
              Boolean(person.linkedinUrl),
              Boolean(person.meetingLink),
              Boolean(person.personalEmail || person.schoolEmail || person.user?.email)
            ]
          : [
              Boolean(person.firstName),
              Boolean(person.lastName),
              Boolean(person.program),
              Boolean(person.graduationYear),
              (person.skills || []).length >= 3,
              Boolean(person.interests),
              Boolean(person.linkedinUrl),
              Boolean(person.personalEmail || person.schoolEmail || person.user?.email)
            ];

      const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
      return {
        profileCompletion: score,
        profileReady: score >= 90
      };
    }

    function mapAlumni(person) {
      const safe = sanitizeAlumniProfile(person, req.user);
      const readiness = completionFlags(person, "alumni");
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
        email: safe.personalEmail || safe.schoolEmail || null,
        profileCompletion: readiness.profileCompletion,
        profileReady: readiness.profileReady
      };
    }

    function mapStudent(person) {
      const safe = sanitizeStudentProfile(person, req.user);
      const readiness = completionFlags(person, "student");
      return {
        id: person.user?.id || null,
        profileId: safe.id,
        profileType: "student",
        role: person.user?.role || "student",
        claimed: Boolean(person.userId),
        firstName: safe.firstName,
        lastName: safe.lastName,
        program: safe.program,
        graduationYear: safe.graduationYear,
        jobTitle: null,
        company: null,
        skills: safe.skills,
        updatedAt: safe.updatedAt,
        email: safe.schoolEmail || safe.personalEmail || person.user?.email || null,
        profileCompletion: readiness.profileCompletion,
        profileReady: readiness.profileReady
      };
    }

    let users = [];
    let total = 0;

    /*
    -------------------------
    ALUMNI
    -------------------------
    */

    if (shouldLoadAlumni && !shouldLoadStudents) {

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

      users = alumni.map(mapAlumni);
    }

    /*
    -------------------------
    STUDENTS
    -------------------------
    */

    if (shouldLoadStudents && !shouldLoadAlumni) {

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

      users = students.map(mapStudent);
    }

    /*
    -------------------------
    MIXED (ALUMNI + STUDENTS)
    -------------------------
    */
    if (shouldLoadAlumni && shouldLoadStudents) {
      const [alumni, students, alumniCount, studentCount] = await Promise.all([
        prisma.alumniProfile.findMany({
          where: alumniWhere,
          include: {
            user: { select: { id: true, role: true, email: true } }
          }
        }),
        prisma.studentProfile.findMany({
          where: studentWhere,
          include: {
            user: { select: { id: true, role: true, email: true } }
          }
        }),
        prisma.alumniProfile.count({ where: alumniWhere }),
        prisma.studentProfile.count({ where: studentWhere })
      ]);

      total = alumniCount + studentCount;

      const combined = [...alumni.map(mapAlumni), ...students.map(mapStudent)];

      combined.sort((a, b) => {
        const timeDiff =
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (timeDiff !== 0) return timeDiff;

        const lastA = (a.lastName || "").toLowerCase();
        const lastB = (b.lastName || "").toLowerCase();
        if (lastA !== lastB) return lastA.localeCompare(lastB);

        return (a.firstName || "").toLowerCase().localeCompare((b.firstName || "").toLowerCase());
      });

      users = combined.slice(skip, skip + pageSize);
    }

    return res.json({
      users,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    });

  } catch (error) {
    req.log?.error({ err: error }, "Directory fetch error");

    return res.status(500).json({
      message: "Failed to fetch directory users"
    });

  }
}