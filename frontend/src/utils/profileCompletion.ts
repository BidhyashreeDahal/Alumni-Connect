export type ProfileType = "student" | "alumni"

export function computeProfileCompletion(profile: any, profileType: ProfileType) {
  const checks =
    profileType === "alumni"
      ? [
          Boolean(profile?.firstName),
          Boolean(profile?.lastName),
          Boolean(profile?.program),
          Boolean(profile?.graduationYear),
          Boolean(profile?.jobTitle),
          Boolean(profile?.company),
          (profile?.skills || []).length >= 3,
          Boolean(profile?.linkedinUrl),
          Boolean(profile?.meetingLink),
          Boolean(profile?.personalEmail || profile?.schoolEmail)
        ]
      : [
          Boolean(profile?.firstName),
          Boolean(profile?.lastName),
          Boolean(profile?.program),
          Boolean(profile?.graduationYear),
          (profile?.skills || []).length >= 3,
          Boolean(profile?.interests),
          Boolean(profile?.linkedinUrl),
          Boolean(profile?.schoolEmail)
        ]

  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)
  return {
    score,
    ready: score >= 90
  }
}
