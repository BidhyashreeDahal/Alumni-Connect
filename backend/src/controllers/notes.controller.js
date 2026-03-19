import { prisma } from "../db/prisma.js";
import { canEditNote } from "../policies/access.policy.js";
import { recordAuditLog } from "../services/auditLog.service.js";

/**
 * Create a private note for a student or alumni profile
 * Faculty/Admin only
 */
export async function createNote(req, res) {
  const { profileId, profileType, content } = req.body;

  if (!profileId || !profileType || !content) {
    return res.status(400).json({
      message: "profileId, profileType, and content are required",
    });
  }

  if (!["student", "alumni"].includes(profileType)) {
    return res.status(400).json({
      message: "profileType must be student or alumni",
    });
  }

  let profile;

  if (profileType === "student") {
    profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });
  }

  if (profileType === "alumni") {
    profile = await prisma.alumniProfile.findUnique({
      where: { id: profileId },
      select: { id: true },
    });
  }

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  const note = await prisma.privateNote.create({
    data: {
      profileId,
      profileType,
      authorId: req.user.id,
      content: String(content),
    },
  });

  await recordAuditLog(req, {
    action: "note_created",
    entityType: "private_note",
    entityId: note.id,
    summary: `Created note for ${profileType} profile`,
    metadata: {
      profileId,
      profileType
    }
  });

  return res.status(201).json({
    message: "Note created",
    note,
  });
}

/**
 * Get notes for a profile
 * Faculty/Admin only
 */
export async function getNotesByProfile(req, res) {

  const { id: profileId } = req.params
  const { profileType } = req.query

  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  if (!profileType) {
    return res.status(400).json({
      message: "profileType query parameter required",
    })
  }

  const where = {
    profileId,
    profileType,
    authorId: req.user.role === "admin" ? undefined : req.user.id,
  }

  const notes = await prisma.privateNote.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  })

  const total = await prisma.privateNote.count({ where })

  return res.json({
    notes,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  })

}
/**
 * Delete a note
 * Faculty/Admin only
 */
export async function deleteNote(req, res) {
  const { id } = req.params;

  const note = await prisma.privateNote.findUnique({
    where: { id },
  });

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  if (!canEditNote(req.user.role, note.authorId, req.user.id)) {
    return res.status(403).json({
      message: "Not authorized to delete this note",
    });
  }

  await prisma.privateNote.delete({
    where: { id },
  });

  await recordAuditLog(req, {
    action: "note_deleted",
    entityType: "private_note",
    entityId: note.id,
    summary: "Deleted private note",
    metadata: {
      profileId: note.profileId,
      profileType: note.profileType
    }
  });

  return res.json({ message: "Note deleted" });
}

export async function updateNote(req, res) {
  const { id } = req.params;
  const { content } = req.body || {};

  if (!content || !String(content).trim()) {
    return res.status(400).json({ message: "content is required" });
  }

  const note = await prisma.privateNote.findUnique({
    where: { id },
  });

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  if (!canEditNote(req.user.role, note.authorId, req.user.id)) {
    return res.status(403).json({
      message: "Not authorized to edit this note",
    });
  }

  const updated = await prisma.privateNote.update({
    where: { id },
    data: { content: String(content).trim() },
  });

  await recordAuditLog(req, {
    action: "note_updated",
    entityType: "private_note",
    entityId: updated.id,
    summary: "Updated private note",
    metadata: {
      profileId: updated.profileId,
      profileType: updated.profileType
    }
  });

  return res.json({
    message: "Note updated",
    note: updated,
  });
}