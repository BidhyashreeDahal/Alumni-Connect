import { prisma } from "../db/prisma.js";

/**
 * Send mentorship request to an alumni
 * Student only
 */
export async function createMentorshipRequest(req, res) {
  const userId = req.user.id;
  const { alumniId, message } = req.body;

  if (!alumniId) {
    return res.status(400).json({ message: "alumniId is required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true }
  });

  if (!user || !user.studentProfile) {
    return res.status(403).json({ message: "Only students can request mentorship" });
  }

  const alumni = await prisma.alumniProfile.findUnique({
    where: { id: alumniId }
  });

  if (!alumni) {
    return res.status(404).json({ message: "Alumni not found" });
  }

  const request = await prisma.mentorshipRequest.create({
    data: {
      studentId: user.studentProfile.id,
      alumniId,
      message: message || null
    }
  });

  return res.status(201).json({
    message: "Mentorship request sent",
    request
  });
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
    select: { alumniProfileId: true },
  });

  if (!user?.alumniProfileId) {
    return res.status(404).json({ message: "Alumni profile not found" });
  }

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id },
  });

  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (request.alumniId !== user.alumniProfileId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const updated = await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: "rejected" },
  });

  return res.json({
    message: "Mentorship request rejected",
    request: updated,
  });
}
/**
 * Get my mentorships
 * Student can use this to see their mentorships
 */
export async function getMyMentorshipRequests(req, res) {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true }
  });

  if (!user || !user.studentProfile) {
    return res.status(403).json({ message: "Only students can view their requests" });
  }

  const requests = await prisma.mentorshipRequest.findMany({
    where: {
      studentId: user.studentProfile.id
    },
    include: {
      alumni: true
    }
  });

  return res.json({ requests });
}
