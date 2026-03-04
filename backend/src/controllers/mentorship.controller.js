import { prisma } from "../db/prisma.js";

/**
 * Send mentorship request to an alumni
 * Student only
 */
export async function createMentorshipRequest(req, res) {
  const { alumniId, message } = req.body;

  if (!alumniId) {
    return res.status(400).json({ message: "alumniId is required" });
  }

  const userId = req.user.id;

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { studentProfileId: true },
  });

  if (!student?.studentProfileId) {
    return res.status(404).json({ message: "Student profile not found" });
  }

  const alumni = await prisma.alumniProfile.findUnique({
    where: { id: alumniId },
    select: { id: true },
  });

  if (!alumni) {
    return res.status(404).json({ message: "Alumni not found" });
  }

  // Prevent duplicate pending requests
  const existingRequest = await prisma.mentorshipRequest.findFirst({
    where: {
      studentId: student.studentProfileId,
      alumniId,
      status: "pending",
    },
  });

  if (existingRequest) {
    return res
      .status(409)
      .json({ message: "You already have a pending request with this alumni" });
  }

  const request = await prisma.mentorshipRequest.create({
    data: {
      studentId: student.studentProfileId,
      alumniId,
      message: message ? String(message) : null,
    },
  });

  return res.status(201).json({
    message: "Mentorship request sent",
    request,
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
    select: { alumniProfileId: true },
  });

  if (!user?.alumniProfileId) {
    return res.status(404).json({ message: "Alumni profile not found" });
  }

  const requests = await prisma.mentorshipRequest.findMany({
    where: { alumniId: user.alumniProfileId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          program: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ requests });
}

/**
 * Accept a mentorship request
 * Alumni only
 */
export async function acceptMentorshipRequest(req, res) {
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
    data: { status: "accepted" },
  });

  return res.json({
    message: "Mentorship request accepted",
    request: updated,
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
