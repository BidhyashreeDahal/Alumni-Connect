router.post("/claim", async (req, res) => {
  const { token, password } = req.body || {};

  if (!token || !password) {
    return res.status(400).json({ message: "token and password are required" });
  }

  if (String(password).length < 10) {
    return res.status(400).json({ message: "Password must be at least 10 characters" });
  }

  const tokenHash = hashToken(String(token));

  const invite = await prisma.inviteToken.findUnique({
    where: { tokenHash }
  });

  if (!invite) return res.status(400).json({ message: "Invalid token" });
  if (invite.usedAt) return res.status(400).json({ message: "Token already used" });
  if (invite.expiresAt < new Date()) return res.status(400).json({ message: "Token expired" });

  let profile;
  let role;
  let userLinkField;

  if (invite.profileType === "alumni") {
    profile = await prisma.alumniProfile.findUnique({
      where: { id: invite.profileId }
    });

    role = "alumni";
    userLinkField = { alumniProfileId: invite.profileId };
  }

  if (invite.profileType === "student") {
    profile = await prisma.studentProfile.findUnique({
      where: { id: invite.profileId }
    });

    role = "student";
    userLinkField = { studentProfileId: invite.profileId };
  }

  if (!profile) return res.status(404).json({ message: "Profile not found" });

  const email = (profile.personalEmail || profile.schoolEmail || "").toLowerCase();

  if (!email) {
    return res.status(400).json({ message: "Profile has no email" });
  }

  const emailTaken = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (emailTaken) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      ...userLinkField
    },
    select: { id: true, email: true, role: true }
  });

  await prisma.inviteToken.update({
    where: { tokenHash },
    data: { usedAt: new Date() }
  });

  const safeUser = { id: user.id, email: user.email, role: user.role };
  const jwtToken = jwt.sign(safeUser, process.env.JWT_SECRET, { expiresIn: "30m" });

  setAuthCookie(res, jwtToken);

  return res.status(201).json({
    message: "Account created",
    user: safeUser
  });
});