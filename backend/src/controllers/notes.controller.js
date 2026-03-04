import { prisma } from "../db/prisma.js";

/**
 * Create a private note for an alumni profile
 * Faculty/Admin only
 */
export async function createNote(req, res) {
  const { profileId, content } = req.body;

  if (!profileId || !content) {
    return res.status(400).json({
      message: "profileId and content are required",
    });
  }

  const profile = await prisma.alumniProfile.findUnique({
    where: { id: profileId },
    select: { id: true },
  });

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  const note = await prisma.privateNote.create({
    data: {
      profileId,
      authorId: req.user.id,
      content: String(content),
    },
  });

  return res.status(201).json({
    message: "Note created",
    note,
  });
}

/**
 * Get notes for a profile
 * Faculty/Admin only - only shows notes created by the logged-in faculty
 */
export async function getNotesByProfile(req, res) {
  const { id } = req.params;

  const notes = await prisma.privateNote.findMany({
    where: {
      profileId: id,
      authorId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json({ notes });
}

/**
 * Delete a note
 * Faculty/Admin only - can only delete their own notes
 */
export async function deleteNote(req, res) {
  const { id } = req.params;

  const note = await prisma.privateNote.findUnique({
    where: { id },
  });

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  if (note.authorId !== req.user.id) {
    return res.status(403).json({ message: "Not authorized to delete this note" });
  }

  await prisma.privateNote.delete({
    where: { id },
  });

  return res.json({ message: "Note deleted" });
}
