import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";
import { recordAuditLog } from "../services/auditLog.service.js";

/**
 * Create a new user (admin, faculty, or student)
 * Admin-only endpoint
 */
export async function createUser(req, res) {
  const { email, password, role, firstName, lastName, personalEmail, program, graduationYear } = req.body || {};

  if (!email || !password || !role) {
    return res.status(400).json({ message: "email, password, role are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Allowed roles
  const allowedRoles = ["admin", "faculty", "student"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "role must be admin, faculty, or student" });
  }

  if (String(password).length < 10) {
    return res.status(400).json({ message: "Password must be at least 10 characters" });
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
        isActive: true,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    // If the user is a student, create StudentProfile automatically
    if (role === "student") {
      const normalizedPersonalEmail = personalEmail
        ? String(personalEmail).trim().toLowerCase()
        : null;

      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          schoolEmail: normalizedEmail,
          personalEmail: normalizedPersonalEmail,
          firstName: firstName ? String(firstName).trim() : null,
          lastName: lastName ? String(lastName).trim() : null,
          program: program ? String(program).trim() : null,
          graduationYear: graduationYear ? Number(graduationYear) : null,
        },
      });
    }

    await recordAuditLog(req, {
      action: "user_created",
      entityType: "user",
      entityId: user.id,
      summary: `Created ${user.role} user ${user.email}`,
      metadata: {
        email: user.email,
        role: user.role,
        firstName: firstName || null,
        lastName: lastName || null,
        personalEmail: personalEmail || null,
        program: program || null,
        graduationYear: graduationYear ?? null
      }
    });

    return res.status(201).json({
      message: "User created",
      user,
    });

  }
  catch (err) {
  req.log?.error({ err }, "Failed to create user");
  return res.status(500).json({ message: err.message });
}
}

export async function listUsers(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize) || 20, 1), 100);
  const skip = (page - 1) * pageSize;

  const [total, users] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize
    })
  ]);

  return res.json({
    users,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    }
  });
}

export async function updateUserByAdmin(req, res) {
  const { id } = req.params;
  const { role, isActive } = req.body || {};

  try {

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        alumniProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.id === id) {
      if (isActive === false) {
        return res.status(400).json({
          message: "You cannot deactivate your own account"
        });
      }
      if (role !== undefined && role !== "admin") {
        return res.status(400).json({
          message: "You cannot change your own role from admin"
        });
      }
    }

    if (
      role !== undefined &&
      ((user.role === "student" && role === "alumni") ||
        (user.role === "alumni" && role === "student"))
    ) {
      return res.status(400).json({
        message: "Use the dedicated conversion workflow for student/alumni role transitions."
      });
    }

    const updates = {};

    /* ---------------- ROLE CHANGE ---------------- */

    if (role !== undefined) {

      const allowedRoles = ["admin", "faculty", "student", "alumni"];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "role must be one of admin, faculty, student, alumni"
        });
      }

      /* Promote Student → Alumni */
      if (role === "alumni") {
        if (!user.alumniProfile) {
          const student = user.studentProfile;
          const matchingUnclaimedAlumni = await prisma.alumniProfile.findFirst({
            where: {
              userId: null,
              OR: [
                { schoolEmail: user.email },
                { personalEmail: user.email }
              ]
            },
            select: { id: true }
          });

          if (matchingUnclaimedAlumni) {
            await prisma.alumniProfile.update({
              where: { id: matchingUnclaimedAlumni.id },
              data: { userId: user.id }
            });
          } else {
            await prisma.alumniProfile.create({
              data: {
                userId: user.id,
                schoolEmail: student?.schoolEmail ?? user.email,
                personalEmail: student?.personalEmail ?? null,
                firstName: student?.firstName ?? null,
                lastName: student?.lastName ?? null,
                program: student?.program ?? null,
                graduationYear: student?.graduationYear ?? null,
                linkedinUrl: student?.linkedinUrl ?? null
              }
            });
          }

        }

      }

      /* Downgrade Alumni → Student */
      if (role === "student") {
        if (!user.studentProfile) {
          const alumni = user.alumniProfile;
          const matchingUnclaimedStudent = await prisma.studentProfile.findFirst({
            where: {
              userId: null,
              OR: [
                { schoolEmail: user.email },
                { personalEmail: user.email }
              ]
            },
            select: { id: true }
          });

          if (matchingUnclaimedStudent) {
            await prisma.studentProfile.update({
              where: { id: matchingUnclaimedStudent.id },
              data: { userId: user.id }
            });
          } else {
            await prisma.studentProfile.create({
              data: {
                userId: user.id,
                schoolEmail: alumni?.schoolEmail ?? user.email,
                personalEmail: alumni?.personalEmail ?? null,
                firstName: alumni?.firstName ?? null,
                lastName: alumni?.lastName ?? null,
                program: alumni?.program ?? null,
                graduationYear: alumni?.graduationYear ?? null,
                linkedinUrl: alumni?.linkedinUrl ?? null
              }
            });
          }

        }

      }

      updates.role = role;
    }

    /* ---------------- ACTIVATE / DEACTIVATE ---------------- */

    if (isActive !== undefined) {

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          message: "isActive must be boolean"
        });
      }

      updates.isActive = isActive;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid updates provided"
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await recordAuditLog(req, {
      action: "user_updated_by_admin",
      entityType: "user",
      entityId: updatedUser.id,
      summary: `Updated user ${updatedUser.email}`,
      metadata: {
        before: {
          role: user.role,
          isActive: user.isActive
        },
        after: {
          role: updatedUser.role,
          isActive: updatedUser.isActive
        }
      }
    });

    return res.json({
      message: "User updated",
      user: updatedUser
    });

  } catch (err) {
    req.log?.error({ err }, "Failed to update user");

    if (err?.code === "P2002") {
      return res.status(409).json({
        message: "Role update conflicts with an existing profile email. Please resolve duplicate profile emails and try again."
      });
    }

    return res.status(500).json({
      message: "Failed to update user"
    });

  }
}

export async function convertUserRoleByAdmin(req, res) {
  const { id } = req.params;
  const { targetRole, reason } = req.body || {};

  if (req.user.id === id) {
    return res.status(400).json({ message: "You cannot convert your own role" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        alumniProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!["student", "alumni"].includes(user.role)) {
      return res.status(409).json({
        message: "Only users currently in student or alumni roles can be converted"
      });
    }

    if (user.role === targetRole) {
      return res.status(400).json({
        message: `User is already ${targetRole}`
      });
    }

    if (targetRole === "alumni") {
      if (!user.alumniProfile) {
        const student = user.studentProfile;
        const matchingUnclaimedAlumni = await prisma.alumniProfile.findFirst({
          where: {
            userId: null,
            OR: [{ schoolEmail: user.email }, { personalEmail: user.email }]
          },
          select: { id: true }
        });

        if (matchingUnclaimedAlumni) {
          await prisma.alumniProfile.update({
            where: { id: matchingUnclaimedAlumni.id },
            data: { userId: user.id }
          });
        } else {
          await prisma.alumniProfile.create({
            data: {
              userId: user.id,
              schoolEmail: student?.schoolEmail ?? user.email,
              personalEmail: student?.personalEmail ?? null,
              firstName: student?.firstName ?? null,
              lastName: student?.lastName ?? null,
              program: student?.program ?? null,
              graduationYear: student?.graduationYear ?? null,
              linkedinUrl: student?.linkedinUrl ?? null
            }
          });
        }
      }
    }

    if (targetRole === "student") {
      if (!user.studentProfile) {
        const alumni = user.alumniProfile;
        const matchingUnclaimedStudent = await prisma.studentProfile.findFirst({
          where: {
            userId: null,
            OR: [{ schoolEmail: user.email }, { personalEmail: user.email }]
          },
          select: { id: true }
        });

        if (matchingUnclaimedStudent) {
          await prisma.studentProfile.update({
            where: { id: matchingUnclaimedStudent.id },
            data: { userId: user.id }
          });
        } else {
          await prisma.studentProfile.create({
            data: {
              userId: user.id,
              schoolEmail: alumni?.schoolEmail ?? user.email,
              personalEmail: alumni?.personalEmail ?? null,
              firstName: alumni?.firstName ?? null,
              lastName: alumni?.lastName ?? null,
              program: alumni?.program ?? null,
              graduationYear: alumni?.graduationYear ?? null,
              linkedinUrl: alumni?.linkedinUrl ?? null
            }
          });
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: targetRole },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await recordAuditLog(req, {
      action: "user_role_converted_by_admin",
      entityType: "user",
      entityId: updatedUser.id,
      summary: `Converted user role from ${user.role} to ${targetRole}`,
      metadata: {
        beforeRole: user.role,
        afterRole: targetRole,
        reason: String(reason).trim()
      }
    });

    return res.json({
      message: "User role converted",
      user: updatedUser
    });
  } catch (err) {
    req.log?.error({ err }, "Failed to convert user role");

    if (err?.code === "P2002") {
      return res.status(409).json({
        message: "Role conversion conflicts with an existing profile email. Please resolve duplicate profile emails and try again."
      });
    }

    return res.status(500).json({
      message: "Failed to convert user role"
    });
  }
}