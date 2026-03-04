import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * POST /notes
 * Faculty/Admin create a private note for an alumni profile
 */
router.post(
  "/",
  requireAuth,
  requireRole(["admin", "faculty"]),
  async (req, res) => {
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
);

/**
 * GET /notes/profile/:id
 * Faculty/Admin view notes for a profile
 * Only shows notes created by the logged-in faculty
 */
router.get(
  "/profile/:id",
  requireAuth,
  requireRole(["admin", "faculty"]),
  async (req, res) => {
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
);

/**
 * DELETE /notes/:id
 * Faculty/Admin delete their own note
 */
router.delete(
  "/:id",
  requireAuth,
  requireRole(["admin", "faculty"]),
  async (req, res) => {
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
);

export default router;