import { prisma } from "../db/prisma.js";

/**
 * Send mentorship request to an alumni
 * Student only
 */


export async function createMentorshipRequest(req, res) {
  const userId = req.user.id
  const { alumniId, message } = req.body

  if (!alumniId) {
    return res.status(400).json({ message: "alumniId is required" })
  }

  // Verify student
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true }
  })

  if (!user || !user.studentProfile) {
    return res.status(403).json({ message: "Only students can request mentorship" })
  }

  const studentId = user.studentProfile.id

  // Verify alumni exists
  const alumni = await prisma.alumniProfile.findUnique({
    where: { id: alumniId }
  })

  if (!alumni) {
    return res.status(404).json({ message: "Alumni not found" })
  }

  // Prevent duplicate active requests
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

  // Require meaningful message
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
 */
export async function getMentorshipRequests(req, res) {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { alumniProfile: true }
  });

  if (!user || !user.alumniProfile) {
    return res.status(403).json({ message: "Only alumni can view requests" });
  }

  const requests = await prisma.mentorshipRequest.findMany({
    where: {
      alumniId: user.alumniProfile.id
    },
    include: {
      student: true
    }
  });

  return res.json({ requests });
}

/**
 * Accept a mentorship request
 * Alumni only
 */
export async function acceptMentorshipRequest(req, res) {
  
  const userId = req.user.id;
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { alumniProfile: true }
  });

  if (!user || !user.alumniProfile) {
    return res.status(403).json({
      message: "Only alumni can accept mentorship requests"
    });
  }

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id }
  });

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (request.alumniId !== user.alumniProfile.id) {
    return res.status(403).json({
      message: "You are not allowed to modify this request"
    });
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: "accepted" }

  });

  return res.json({
    message: "Mentorship request accepted",
    request: updated
    
  });
}
/**
 * Reject a mentorship request
 * Alumni only
 */
export async function rejectMentorshipRequest(req, res) {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { alumniProfile: true }
  });

  if (!user?.alumniProfile) {
    return res.status(404).json({ message: "Alumni profile not found" });
  }

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id },
  });

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (request.alumniId !== user.alumniProfile.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: "declined" },
  });

  return res.json({
    message: "Mentorship request declined",
    request: updated,
  });
}
/**
 * Get my mentorships
 * Student can use this to see their mentorships
 */
export async function getMyMentorshipRequests(req, res) {
  try {

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!user || !user.studentProfile) {
      return res.status(403).json({
        message: "Only students can view their requests",
        requests: []
      });
    }

    const requests = await prisma.mentorshipRequest.findMany({
      where: {
        studentId: user.studentProfile.id
      },
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
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({ requests });

  } catch (error) {
    console.error("getMyMentorshipRequests error:", error);
    return res.status(500).json({
      message: "Failed to load mentorship requests",
      requests: []
    });
  }
}
export async function completeMentorship(req, res) {
  const { id } = req.params
  const userId = req.user.id

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id },
    include: {
      student: true,
      alumni: true
    }
  })

  if (!request) {
    return res.status(404).json({ message: "Request not found" })
  }

  // verify user belongs to this mentorship
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      alumniProfile: true
    }
  })

  const isStudent =
    user?.studentProfile?.id === request.studentId

  const isAlumni =
    user?.alumniProfile?.id === request.alumniId

  if (!isStudent && !isAlumni) {
    return res.status(403).json({
      message: "Not authorized to modify this mentorship"
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
