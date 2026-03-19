import { prisma } from "../db/prisma.js";

function alumniCompletion(profile) {
  const checks = [
    Boolean(profile?.firstName),
    Boolean(profile?.lastName),
    Boolean(profile?.program),
    Boolean(profile?.graduationYear),
    Boolean(profile?.jobTitle),
    Boolean(profile?.company),
    (profile?.skills || []).length >= 3,
    Boolean(profile?.linkedinUrl),
    Boolean(profile?.meetingLink),
    Boolean(profile?.personalEmail || profile?.schoolEmail)
  ]
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)
  return { profileCompletion: score, profileReady: score >= 90 }
}

/**
 * Send mentorship request
 * Student only
 */
export async function createMentorshipRequest(req, res) {

  const userId = req.user.id
  const { alumniId, message } = req.body

  if (!alumniId) {
    return res.status(400).json({ message: "alumniId is required" })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true }
  })

  if (!user || !user.studentProfile) {
    return res.status(403).json({
      message: "Only students can request mentorship"
    })
  }

  const studentId = user.studentProfile.id

  const alumni = await prisma.alumniProfile.findUnique({
    where: { id: alumniId }
  })

  if (!alumni) {
    return res.status(404).json({
      message: "Alumni not found"
    })
  }

  const existing = await prisma.mentorshipRequest.findFirst({
    where: {
      studentId,
      alumniId,
      status: {
        in: ["pending", "accepted"]
      }
    }
  })

  if (existing) {
    return res.status(400).json({
      message: "You already have an active mentorship request with this alumni"
    })
  }

  if (!message || message.trim().length < 20) {
    return res.status(400).json({
      message: "Please explain what mentorship help you need (minimum 20 characters)"
    })
  }

  const request = await prisma.mentorshipRequest.create({
    data: {
      studentId,
      alumniId,
      message
    }
  })

  return res.status(201).json({
    message: "Mentorship request sent",
    request
  })
}

/**
 * Get incoming mentorship requests
 * Alumni only
 * Pagination enabled
 */
export async function getMentorshipRequests(req, res) {

  const userId = req.user.id

  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 5
  const skip = (page - 1) * limit

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { alumniProfile: true }
  })

  if (!user || !user.alumniProfile) {
    return res.status(403).json({
      message: "Only alumni can view requests"
    })
  }

  const alumniId = user.alumniProfile.id

  const [requests, total] = await Promise.all([
    prisma.mentorshipRequest.findMany({
      where: { alumniId },
      include: { student: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.mentorshipRequest.count({
      where: { alumniId }
    })
  ])

  return res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    requests
  })
}

/**
 * Accept mentorship request
 */
export async function acceptMentorshipRequest(req, res) {

  const userId = req.user.id
  const { id } = req.params

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { alumniProfile: true }
  })

  if (!user?.alumniProfile) {
    return res.status(403).json({
      message: "Only alumni can accept mentorship requests"
    })
  }

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id }
  })

  if (!request) {
    return res.status(404).json({
      message: "Request not found"
    })
  }

  if (request.alumniId !== user.alumniProfile.id) {
    return res.status(403).json({
      message: "You are not allowed to modify this request"
    })
  }

  if (request.status !== "pending") {
    return res.status(400).json({
      message: "Only pending requests can be accepted"
    })
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: "accepted" }
  })

  return res.json({
    message: "Mentorship request accepted",
    request: updated
  })
}

/**
 * Reject mentorship request
 */
export async function rejectMentorshipRequest(req, res) {

  const { id } = req.params

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { alumniProfile: true }
  })

  if (!user?.alumniProfile) {
    return res.status(404).json({
      message: "Alumni profile not found"
    })
  }

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id }
  })

  if (!request) {
    return res.status(404).json({
      message: "Request not found"
    })
  }

  if (request.alumniId !== user.alumniProfile.id) {
    return res.status(403).json({
      message: "Not authorized"
    })
  }

  if (request.status !== "pending") {
    return res.status(400).json({
      message: "Only pending requests can be declined"
    })
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: "declined" }
  })

  return res.json({
    message: "Mentorship request declined",
    request: updated
  })
}

/**
 * Student sees their mentorship requests
 * Pagination enabled
 */
export async function getMyMentorshipRequests(req, res) {

  try {

    const userId = req.user.id

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const skip = (page - 1) * limit

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    })

    if (!user?.studentProfile) {
      return res.status(403).json({
        message: "Only students can view their requests"
      })
    }

    const studentId = user.studentProfile.id

    const [requests, total] = await Promise.all([
      prisma.mentorshipRequest.findMany({
        where: { studentId },
        include: {
          alumni: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              company: true,
              linkedinUrl: true,
              personalEmail: true,
              meetingLink: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.mentorshipRequest.count({
        where: { studentId }
      })
    ])

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      requests
    })

  } catch (error) {
    req.log?.error({ err: error }, "Failed to load mentorship requests")

    return res.status(500).json({
      message: "Failed to load mentorship requests"
    })
  }
}

/**
 * Complete mentorship
 */
export async function completeMentorship(req, res) {

  const { id } = req.params
  const userId = req.user.id

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id }
  })

  if (!request) {
    return res.status(404).json({
      message: "Request not found"
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      alumniProfile: true
    }
  })

  const isStudent = user?.studentProfile?.id === request.studentId
  const isAlumni = user?.alumniProfile?.id === request.alumniId

  if (!isStudent && !isAlumni) {
    return res.status(403).json({
      message: "Not authorized"
    })
  }

  if (request.status !== "accepted") {
    return res.status(400).json({
      message: "Only accepted mentorships can be completed"
    })
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: "completed" }
  })

  return res.json({
    message: "Mentorship marked as completed",
    request: updated
  })
}

/**
 * Cancel mentorship
 * Student only
 */
export async function cancelMentorship(req, res) {

  const { id } = req.params
  const userId = req.user.id

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id }
  })

  if (!request) {
    return res.status(404).json({
      message: "Request not found"
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true }
  })

  const isOwner = user?.studentProfile?.id === request.studentId

  if (!isOwner) {
    return res.status(403).json({
      message: "Only the requesting student can cancel this request"
    })
  }

  if (!["pending", "accepted"].includes(request.status)) {
    return res.status(400).json({
      message: "Only pending or accepted requests can be cancelled"
    })
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: "cancelled" }
  })

  return res.json({
    message: "Mentorship request cancelled",
    request: updated
  })
}

/**
 * Student-only: mentors with strongest platform engagement
 */
export async function getPopularMentors(req, res) {
  try {
    const popular = await prisma.mentorshipRequest.groupBy({
      by: ["alumniId"],
      where: {
        status: { in: ["pending", "accepted", "completed"] }
      },
      _count: { alumniId: true },
      orderBy: { _count: { alumniId: "desc" } },
      take: 8
    })

    const alumniIds = popular.map((row) => row.alumniId).filter(Boolean)

    if (!alumniIds.length) {
      return res.json({ mentors: [] })
    }

    const profiles = await prisma.alumniProfile.findMany({
      where: {
        id: { in: alumniIds },
        isArchived: false
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        program: true,
        graduationYear: true,
        jobTitle: true,
        company: true,
        skills: true,
        linkedinUrl: true,
        meetingLink: true,
        personalEmail: true,
        schoolEmail: true,
        userId: true
      }
    })

    const countByAlumniId = new Map(popular.map((row) => [row.alumniId, row._count.alumniId]))

    const mentors = profiles
      .map((profile) => {
        const readiness = alumniCompletion(profile)
        return {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          program: profile.program,
          graduationYear: profile.graduationYear,
          jobTitle: profile.jobTitle,
          company: profile.company,
          skills: profile.skills || [],
          claimed: Boolean(profile.userId),
          engagementCount: countByAlumniId.get(profile.id) || 0,
          profileCompletion: readiness.profileCompletion,
          profileReady: readiness.profileReady
        }
      })
      .sort((a, b) => b.engagementCount - a.engagementCount)

    return res.json({ mentors })
  } catch (error) {
    req.log?.error({ err: error }, "Failed to load popular mentors")
    return res.status(500).json({ message: "Failed to load popular mentors" })
  }
}