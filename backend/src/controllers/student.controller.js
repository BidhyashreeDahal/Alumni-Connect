import { prisma } from "../db/prisma.js";
import { sanitizeStudentProfile } from "../policies/access.policy.js";
import { recordAuditLog } from "../services/auditLog.service.js";
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
        await recordAuditLog(req, {
            action: "student_profile_updated",
            entityType: "student_profile",
            entityId: profile.id,
            summary: "Updated student profile",
            metadata: {
                updatedFields: Object.keys(updates)
            }
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

/**
 * POST /students
 * Admin/Faculty create student profile record only (unclaimed)
 */
export async function createStudentProfile(req, res) {
    const {
        schoolEmail,
        personalEmail,
        firstName,
        lastName,
        program,
        graduationYear,
        skills,
        interests,
        linkedinUrl
    } = req.body || {};

    const normalizedSchoolEmail = String(schoolEmail).trim().toLowerCase();
    const normalizedPersonalEmail = personalEmail
        ? String(personalEmail).trim().toLowerCase()
        : null;

    const gradYear =
        graduationYear === undefined || graduationYear === null || graduationYear === ""
            ? null
            : parseInt(String(graduationYear), 10);

    if (gradYear !== null && (isNaN(gradYear) || gradYear < 1900 || gradYear > 2100)) {
        return res.status(400).json({ message: "graduationYear must be valid" });
    }

    if (skills !== undefined && !Array.isArray(skills)) {
        return res.status(400).json({ message: "skills must be an array" });
    }

    try {
        const profile = await prisma.studentProfile.create({
            data: {
                schoolEmail: normalizedSchoolEmail,
                personalEmail: normalizedPersonalEmail,
                firstName: String(firstName).trim(),
                lastName: String(lastName).trim(),
                program: program ? String(program).trim() : null,
                graduationYear: gradYear,
                skills: Array.isArray(skills) ? skills.map((s) => String(s).trim()).filter(Boolean) : [],
                interests: interests ? String(interests).trim() : null,
                linkedinUrl: linkedinUrl ? String(linkedinUrl).trim() : null
            }
        });

        await recordAuditLog(req, {
            action: "student_profile_created",
            entityType: "student_profile",
            entityId: profile.id,
            summary: "Created student profile",
            metadata: {
                schoolEmail: profile.schoolEmail,
                personalEmail: profile.personalEmail,
                firstName: profile.firstName,
                lastName: profile.lastName,
                program: profile.program,
                graduationYear: profile.graduationYear
            }
        });

        return res.status(201).json({
            message: "Profile created",
            profile: sanitizeStudentProfile(profile, req.user)
        });
    } catch (error) {
        const isUniqueViolation = error?.code === "P2002";
        return res.status(isUniqueViolation ? 409 : 500).json({
            message: isUniqueViolation
                ? "Email already exists on another profile"
                : "Failed to create student profile"
        });
    }
}
