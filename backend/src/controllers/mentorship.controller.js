import { prisma } from "../db/prisma.js";
import { recordAuditLog } from "../services/auditLog.service.js";

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
        in: ["pending", "accepted", "scheduled"]
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

  if (!["accepted", "scheduled"].includes(request.status)) {
    return res.status(400).json({
      message: "Only accepted or scheduled mentorships can be completed"
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

  if (!["pending", "accepted", "scheduled"].includes(request.status)) {
    return res.status(400).json({
      message: "Only pending, accepted, or scheduled requests can be cancelled"
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

export async function scheduleMentorship(req, res) {
  const { id } = req.params;
  const { scheduledAt, meetingLink, meetingNotes } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { alumniProfile: true }
  });

  if (!user?.alumniProfile) {
    return res.status(403).json({
      message: "Only alumni can schedule mentorship sessions"
    });
  }

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id }
  });

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (request.alumniId !== user.alumniProfile.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (request.status !== "accepted") {
    return res.status(400).json({
      message: "Only accepted mentorships can be scheduled"
    });
  }

  const scheduledDate = new Date(scheduledAt);
  if (Number.isNaN(scheduledDate.getTime())) {
    return res.status(400).json({ message: "Invalid scheduledAt value" });
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: {
      status: "scheduled",
      scheduledAt: scheduledDate,
      meetingLink,
      meetingNotes: meetingNotes || null,
      confirmedAt: null
    }
  });

  await recordAuditLog(req, {
    action: "mentorship_scheduled",
    entityType: "mentorship_request",
    entityId: updated.id,
    summary: "Scheduled mentorship session",
    metadata: {
      scheduledAt: updated.scheduledAt,
      meetingLink: updated.meetingLink
    }
  });

  return res.json({
    message: "Mentorship session scheduled",
    request: updated
  });
}
export async function confirmMentorship(req, res) {
  const { id } = req.params;

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id }
  });

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { studentProfile: true }
  });

  const isOwner = user?.studentProfile?.id === request.studentId;

  if (!isOwner) {
    return res.status(403).json({
      message: "Only the requesting student can confirm this session"
    });
  }

  if (request.status !== "scheduled") {
    return res.status(400).json({
      message: "Only scheduled mentorships can be confirmed"
    });
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: {
      confirmedAt: new Date()
    }
  });

  await recordAuditLog(req, {
    action: "mentorship_confirmed",
    entityType: "mentorship_request",
    entityId: updated.id,
    summary: "Student confirmed mentorship session"
  });

  return res.json({
    message: "Mentorship session confirmed",
    request: updated
  });
}
export async function submitMentorshipFeedback(req, res) {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id }
  });

  if (!request) {
    return res.status(404).json({
      message: "Mentorship request not found"
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      studentProfile: true,
      alumniProfile: true
    }
  });

  const isStudent = user?.studentProfile?.id === request.studentId;
  const isAlumni = user?.alumniProfile?.id === request.alumniId;

  if (!isStudent && !isAlumni) {
    return res.status(403).json({
      message: "Not authorized to leave feedback for this mentorship"
    });
  }

  if (!["scheduled", "completed"].includes(request.status)) {
    return res.status(400).json({
      message: "Feedback can only be submitted for scheduled or completed mentorships"
    });
  }

  if (request.scheduledAt && new Date(request.scheduledAt).getTime() > Date.now()) {
    return res.status(400).json({
      message: "Feedback can only be submitted after the scheduled session time"
    });
  }

  try {
    const feedback = await prisma.mentorshipFeedback.create({
      data: {
        mentorshipRequestId: request.id,
        authorId: req.user.id,
        rating,
        comment: comment || null
      }
    });

    await recordAuditLog(req, {
      action: "mentorship_feedback_submitted",
      entityType: "mentorship_request",
      entityId: request.id,
      summary: "Submitted mentorship feedback",
      metadata: {
        rating
      }
    });

    return res.status(201).json({
      message: "Feedback submitted",
      feedback
    });
  } catch (error) {
    const isUniqueViolation = error?.code === "P2002";

    return res.status(isUniqueViolation ? 409 : 500).json({
      message: isUniqueViolation
        ? "You have already submitted feedback for this mentorship"
        : "Failed to submit feedback"
    });
  }
}

async function getParticipantContext(userId, mentorshipRequestId) {
  const [request, user] = await Promise.all([
    prisma.mentorshipRequest.findUnique({ where: { id: mentorshipRequestId } }),
    prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, alumniProfile: true }
    })
  ])

  if (!request || !user) {
    return { request, user, isStudent: false, isAlumni: false, isParticipant: false }
  }

  const isStudent = user.studentProfile?.id === request.studentId
  const isAlumni = user.alumniProfile?.id === request.alumniId

  return {
    request,
    user,
    isStudent,
    isAlumni,
    isParticipant: isStudent || isAlumni
  }
}

export async function getMentorshipMessages(req, res) {
  const { id } = req.params

  const context = await getParticipantContext(req.user.id, id)

  if (!context.request) {
    return res.status(404).json({ message: "Mentorship request not found" })
  }

  if (!context.isParticipant) {
    return res.status(403).json({ message: "Not authorized" })
  }

  if (["pending", "declined", "cancelled"].includes(context.request.status)) {
    return res.status(400).json({
      message: "Conversation is available only after mentorship is accepted"
    })
  }

  const messages = await prisma.mentorshipMessage.findMany({
    where: { mentorshipRequestId: id },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          role: true
        }
      },
      slots: {
        orderBy: { startAt: "asc" },
        include: {
          selectedBy: {
            select: { id: true, email: true, role: true }
          }
        }
      }
    },
    orderBy: { createdAt: "asc" }
  })

  return res.json({ messages })
}

export async function sendMentorshipMessage(req, res) {
  const { id } = req.params
  const { text } = req.body

  const context = await getParticipantContext(req.user.id, id)

  if (!context.request) {
    return res.status(404).json({ message: "Mentorship request not found" })
  }

  if (!context.isParticipant) {
    return res.status(403).json({ message: "Not authorized" })
  }

  if (!["accepted", "scheduled"].includes(context.request.status)) {
    return res.status(400).json({
      message: "Messages can be sent only for accepted or scheduled mentorships"
    })
  }

  const message = await prisma.mentorshipMessage.create({
    data: {
      mentorshipRequestId: id,
      senderId: req.user.id,
      type: "text",
      text
    },
    include: {
      sender: {
        select: { id: true, email: true, role: true }
      },
      slots: true
    }
  })

  return res.status(201).json({
    message: "Message sent",
    data: message
  })
}

export async function proposeMentorshipSlots(req, res) {
  const { id } = req.params
  const { slots, note } = req.body

  const context = await getParticipantContext(req.user.id, id)

  if (!context.request) {
    return res.status(404).json({ message: "Mentorship request not found" })
  }

  if (!context.isParticipant) {
    return res.status(403).json({ message: "Not authorized" })
  }

  if (!["accepted", "scheduled"].includes(context.request.status)) {
    return res.status(400).json({
      message: "Time slots can be proposed only for accepted or scheduled mentorships"
    })
  }

  const normalized = [...new Set(slots)].map((slot) => new Date(slot))
  const invalid = normalized.some((date) => Number.isNaN(date.getTime()))
  if (invalid) {
    return res.status(400).json({ message: "One or more slot values are invalid" })
  }

  const now = Date.now()
  const hasPastSlot = normalized.some((date) => date.getTime() <= now)
  if (hasPastSlot) {
    return res.status(400).json({ message: "Please propose future time slots only" })
  }

  const created = await prisma.$transaction(async (tx) => {
    const slotMessage = await tx.mentorshipMessage.create({
      data: {
        mentorshipRequestId: id,
        senderId: req.user.id,
        type: "slot_proposal",
        text: note || null
      }
    })

    await tx.mentorshipTimeSlot.createMany({
      data: normalized.map((date) => ({
        mentorshipRequestId: id,
        messageId: slotMessage.id,
        startAt: date
      }))
    })

    return tx.mentorshipMessage.findUnique({
      where: { id: slotMessage.id },
      include: {
        sender: {
          select: { id: true, email: true, role: true }
        },
        slots: {
          orderBy: { startAt: "asc" }
        }
      }
    })
  })

  await recordAuditLog(req, {
    action: "mentorship_slot_proposed",
    entityType: "mentorship_request",
    entityId: id,
    summary: "Proposed mentorship time slots",
    metadata: {
      slotCount: normalized.length
    }
  })

  return res.status(201).json({
    message: "Time slots proposed",
    data: created
  })
}

export async function selectMentorshipSlot(req, res) {
  const { id, slotId } = req.params

  const context = await getParticipantContext(req.user.id, id)

  if (!context.request) {
    return res.status(404).json({ message: "Mentorship request not found" })
  }

  if (!context.isParticipant) {
    return res.status(403).json({ message: "Not authorized" })
  }

  if (!["accepted", "scheduled"].includes(context.request.status)) {
    return res.status(400).json({
      message: "Slots can only be selected for accepted or scheduled mentorships"
    })
  }

  const slot = await prisma.mentorshipTimeSlot.findUnique({
    where: { id: slotId },
    include: {
      message: true,
      mentorshipRequest: true
    }
  })

  if (!slot || slot.mentorshipRequestId !== id) {
    return res.status(404).json({ message: "Slot not found" })
  }

  if (slot.message.senderId === req.user.id) {
    return res.status(400).json({
      message: "You cannot select a slot from your own proposal"
    })
  }

  const selected = await prisma.$transaction(async (tx) => {
    await tx.mentorshipTimeSlot.updateMany({
      where: { messageId: slot.messageId },
      data: {
        isSelected: false,
        selectedById: null,
        selectedAt: null
      }
    })

    const picked = await tx.mentorshipTimeSlot.update({
      where: { id: slot.id },
      data: {
        isSelected: true,
        selectedById: req.user.id,
        selectedAt: new Date()
      }
    })

    await tx.mentorshipRequest.update({
      where: { id },
      data: {
        status: "scheduled",
        scheduledAt: slot.startAt,
        confirmedAt: new Date()
      }
    })

    await tx.mentorshipMessage.create({
      data: {
        mentorshipRequestId: id,
        senderId: null,
        type: "system",
        text: `Session confirmed for ${slot.startAt.toISOString()}`
      }
    })

    return picked
  })

  await recordAuditLog(req, {
    action: "mentorship_slot_selected",
    entityType: "mentorship_request",
    entityId: id,
    summary: "Selected mentorship time slot",
    metadata: {
      slotId: selected.id,
      startAt: selected.startAt
    }
  })

  return res.json({
    message: "Time slot selected and mentorship scheduled",
    slot: selected
  })
}