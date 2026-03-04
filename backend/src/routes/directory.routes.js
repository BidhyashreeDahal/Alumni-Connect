import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * GET /directory/alumni
 * List alumni for students to browse mentors
 */
router.get("/alumni", requireAuth, async (req, res) => {
  const alumni = await prisma.alumniProfile.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      program: true,
      graduationYear: true,
      jobTitle: true,
      company: true,
      skills: true
    },
    orderBy: {
      graduationYear: "desc"
    }
  });

  res.json({ alumni });
});

export default router;