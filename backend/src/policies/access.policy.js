export function isAdminOrFaculty(role) {
  return role === "admin" || role === "faculty";
}

export function canManageAlumni(role) {
  return isAdminOrFaculty(role);
}

export function canViewDirectory(role) {
  return ["admin", "faculty", "alumni", "student"].includes(role);
}

export function canViewStudentRows(role) {
  return role === "admin" || role === "faculty" || role === "alumni";
}

export function canViewSensitiveContact(role, isSelf = false) {
  return isSelf || isAdminOrFaculty(role);
}

export function canEditNote(role, noteAuthorId, requesterId) {
  if (role === "admin") return true;
  return noteAuthorId === requesterId;
}

export function sanitizeAlumniProfile(profile, requester) {
  if (!profile) return null;

  const isSelf = Boolean(requester?.id && profile.userId === requester.id);
  const allowSensitive = canViewSensitiveContact(requester?.role, isSelf);

  return {
    id: profile.id,
    profileType: "alumni",
    userId: profile.userId || null,
    firstName: profile.firstName,
    lastName: profile.lastName,
    program: profile.program,
    graduationYear: profile.graduationYear,
    jobTitle: profile.jobTitle,
    company: profile.company,
    skills: profile.skills || [],
    linkedinUrl: profile.linkedinUrl,
    updatedAt: profile.updatedAt,
    createdAt: profile.createdAt,
    personalEmail: allowSensitive ? profile.personalEmail : null,
    schoolEmail: allowSensitive ? profile.schoolEmail : null,
    meetingLink: allowSensitive ? profile.meetingLink : null,
  };
}

export function sanitizeStudentProfile(profile, requester) {
  if (!profile) return null;

  const isSelf = Boolean(requester?.id && profile.userId === requester.id);
  const allowSensitive = canViewSensitiveContact(requester?.role, isSelf);

  return {
    id: profile.id,
    profileType: "student",
    userId: profile.userId || null,
    firstName: profile.firstName,
    lastName: profile.lastName,
    program: profile.program,
    graduationYear: profile.graduationYear,
    skills: profile.skills || [],
    interests: isSelf || isAdminOrFaculty(requester?.role) ? profile.interests : null,
    linkedinUrl: profile.linkedinUrl,
    updatedAt: profile.updatedAt,
    createdAt: profile.createdAt,
    personalEmail: allowSensitive ? profile.personalEmail || null : null,
    schoolEmail: allowSensitive ? profile.schoolEmail || profile.user?.email || null : null,
  };
}
