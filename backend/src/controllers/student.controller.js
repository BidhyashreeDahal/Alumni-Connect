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
        "firstName",
        "lastName",
        "program",
        "graduationYear",
        "skills",
        "interests"
    ];
    const updates = {};
    for (const key of allowed) {
        if(req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }
    if(updates.skills && !Array.isArray(updates.skills)){
        return res.status(400).json({message: "skills must be a array"}); 
    }

    const profile = await prisma.studentProfile.update({
        where: { userId },
        data: updates
    });
    return res.json({
        message:"Student profile updated",
        profile: sanitizeStudentProfile(profile, req.user)
    });
}
