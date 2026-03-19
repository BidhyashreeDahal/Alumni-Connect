import { prisma } from "../db/prisma.js";
import { sanitizeStudentProfile } from "../policies/access.policy.js";
/**
 * GET /students/me
 * Student fetches their own peofile
 */

export async function getMyStudentProfile(req, res) {
    const userId = req.user.id;

    const profile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    email: true
                }
            }
        }
    });
    if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
    }
    if (profile.isArchived) {
        return res.status(403).json({ message: "Profile is archived" });
    }
    return res.status(200).json({ profile: sanitizeStudentProfile(profile, req.user) });
}

/**
 * PUT /students/me
 * Student updates their own profile
 */
export async function updateMyStudentProfile(req, res) {
    const userId = req.user.id;
    const allowed =[
        "schoolEmail",
        "personalEmail",
        "firstName",
        "lastName",
        "program",
        "graduationYear",
        "skills",
        "interests",
        "linkedinUrl"
    ];
    const updates = {};
    for (const key of allowed) {
        if(req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }
    if (updates.schoolEmail !== undefined) {
        updates.schoolEmail = updates.schoolEmail
            ? String(updates.schoolEmail).trim().toLowerCase()
            : null;
    }
    if (updates.personalEmail !== undefined) {
        updates.personalEmail = updates.personalEmail
            ? String(updates.personalEmail).trim().toLowerCase()
            : null;
    }
    if(updates.skills && !Array.isArray(updates.skills)){
        return res.status(400).json({message: "skills must be a array"}); 
    }
    if (updates.graduationYear !== undefined && updates.graduationYear !== null && updates.graduationYear !== "") {
        const y = parseInt(String(updates.graduationYear), 10);
        if (isNaN(y) || y < 1900 || y > 2100) {
            return res.status(400).json({ message: "graduationYear must be valid" });
        }
        updates.graduationYear = y;
    } else if (updates.graduationYear === "") {
        updates.graduationYear = null;
    }

    try {
        const profile = await prisma.studentProfile.update({
            where: { userId },
            data: updates
        });
        return res.json({
            message:"Student profile updated",
            profile: sanitizeStudentProfile(profile, req.user)
        });
    } catch (error) {
        const isUniqueViolation = error?.code === "P2002";
        return res.status(isUniqueViolation ? 409 : 500).json({
            message: isUniqueViolation ? "Email already exists on another profile" : "Failed to update student profile"
        });
    }
}
