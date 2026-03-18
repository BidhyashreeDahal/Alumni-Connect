import { prisma } from "../db/prisma.js";

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function computeCompletionScore(profile, type) {
  const checks =
    type === "alumni"
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
          Boolean(profile?.personalEmail || profile?.schoolEmail || profile?.user?.email)
        ]
      : [
          Boolean(profile?.firstName),
          Boolean(profile?.lastName),
          Boolean(profile?.program),
          Boolean(profile?.graduationYear),
          (profile?.skills || []).length >= 3,
          Boolean(profile?.interests),
          Boolean(profile?.linkedinUrl),
          Boolean(profile?.user?.email)
        ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function item({
  id,
  title,
  description,
  category,
  priority = "medium",
  actionLabel,
  actionHref,
  meta
}) {
  return {
    id,
    title,
    description,
    category,
    priority,
    actionLabel: actionLabel || null,
    actionHref: actionHref || null,
    meta: meta || null
  };
}

function toSection(title, description, items) {
  return {
    title,
    description,
    items
  };
}

async function getAdminOrFacultyReminders(role) {
  const now = new Date();
  const next14Days = daysFromNow(14);
  const recentWindow = daysFromNow(-7);

  const [
    alumniProfiles,
    studentProfiles,
    expiredInvites,
    pendingInvites,
    upcomingEvents,
    recentClaims
  ] = await Promise.all([
    prisma.alumniProfile.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        program: true,
        graduationYear: true,
        jobTitle: true,
        company: true,
        skills: true,
        linkedinUrl: true,
        meetingLink: true,
        personalEmail: true,
        schoolEmail: true,
        updatedAt: true
      }
    }),
    prisma.studentProfile.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        program: true,
        graduationYear: true,
        skills: true,
        interests: true,
        linkedinUrl: true,
        updatedAt: true,
        user: {
          select: {
            email: true
          }
        }
      }
    }),
    prisma.inviteToken.count({
      where: {
        usedAt: null,
        expiresAt: { lt: now }
      }
    }),
    prisma.inviteToken.count({
      where: {
        usedAt: null,
        expiresAt: { gte: now }
      }
    }),
    prisma.event.findMany({
      where: {
        eventDate: {
          gte: now,
          lte: next14Days
        }
      },
      orderBy: { eventDate: "asc" },
      take: 3,
      select: {
        id: true,
        title: true,
        eventDate: true,
        location: true
      }
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["alumni", "student"] },
        createdAt: { gte: recentWindow }
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        role: true,
        email: true,
        createdAt: true
      }
    })
  ]);

  const unclaimedAlumni = alumniProfiles.filter((profile) => !profile.userId).length;
  const unclaimedStudents = studentProfiles.filter((profile) => !profile.userId).length;
  const incompleteClaimedProfiles =
    alumniProfiles.filter((profile) => profile.userId && computeCompletionScore(profile, "alumni") < 90).length +
    studentProfiles.filter((profile) => profile.userId && computeCompletionScore(profile, "student") < 90).length;

  const needsAttention = [];
  const comingUp = [];
  const suggestedActions = [];
  const recentUpdates = [];

  if (expiredInvites > 0) {
    needsAttention.push(
      item({
        id: "expired-invites",
        title: `${expiredInvites} invite${expiredInvites === 1 ? "" : "s"} expired`,
        description: "Review and reissue access for members who have not yet completed account setup.",
        category: "attention",
        priority: "high",
        actionLabel: "Open Invites",
        actionHref: "/invite"
      })
    );
  }

  if (unclaimedAlumni + unclaimedStudents > 0) {
    needsAttention.push(
      item({
        id: "unclaimed-profiles",
        title: `${unclaimedAlumni + unclaimedStudents} profile${unclaimedAlumni + unclaimedStudents === 1 ? "" : "s"} still unclaimed`,
        description: `${unclaimedAlumni} alumni and ${unclaimedStudents} students are still waiting to activate their accounts.`,
        category: "attention",
        priority: "high",
        actionLabel: "Review Directory",
        actionHref: "/directory"
      })
    );
  }

  if (pendingInvites > 0) {
    suggestedActions.push(
      item({
        id: "pending-invites",
        title: `${pendingInvites} active invite${pendingInvites === 1 ? "" : "s"} in progress`,
        description: "Track invitation progress and follow up with members who have not completed setup.",
        category: "suggested",
        priority: "medium",
        actionLabel: "Manage Invites",
        actionHref: "/invite"
      })
    );
  }

  if (incompleteClaimedProfiles > 0) {
    suggestedActions.push(
      item({
        id: "incomplete-profiles",
        title: `${incompleteClaimedProfiles} claimed profile${incompleteClaimedProfiles === 1 ? "" : "s"} need stronger data`,
        description: "Encourage members to complete key profile fields so reporting and directory quality remain strong.",
        category: "suggested",
        priority: "medium",
        actionLabel: "Open Directory",
        actionHref: "/directory"
      })
    );
  }

  if (upcomingEvents.length > 0) {
    upcomingEvents.forEach((event) => {
      comingUp.push(
        item({
          id: `event-${event.id}`,
          title: event.title,
          description: `Scheduled for ${new Date(event.eventDate).toLocaleDateString()}${event.location ? ` at ${event.location}` : ""}.`,
          category: "upcoming",
          priority: "medium",
          actionLabel: "Open Events",
          actionHref: "/events"
        })
      );
    });
  } else {
    comingUp.push(
      item({
        id: "no-upcoming-events",
        title: "No events scheduled in the next two weeks",
        description: "Consider publishing an event to maintain visible engagement across the network.",
        category: "upcoming",
        priority: "low",
        actionLabel: role === "admin" ? "Create Event" : "Open Events",
        actionHref: "/events"
      })
    );
  }

  if (recentClaims.length > 0) {
    recentClaims.forEach((user) => {
      recentUpdates.push(
        item({
          id: `recent-user-${user.id}`,
          title: `${user.email} joined as ${user.role}`,
          description: `A new ${user.role} account was activated on ${new Date(user.createdAt).toLocaleDateString()}.`,
          category: "update",
          priority: "low"
        })
      );
    });
  } else {
    recentUpdates.push(
      item({
        id: "no-recent-claims",
        title: "No recent account claims",
        description: "New member activity will appear here as invitations are claimed.",
        category: "update",
        priority: "low"
      })
    );
  }

  return {
    summary: {
      headline: role === "admin"
        ? "Priority reminders for platform oversight, member access, and upcoming activity."
        : "Priority reminders to support member engagement and timely faculty follow-up.",
      stats: [
        { label: "Unclaimed Profiles", value: unclaimedAlumni + unclaimedStudents },
        { label: "Expired Invites", value: expiredInvites },
        { label: "Upcoming Events", value: upcomingEvents.length }
      ]
    },
    sections: [
      toSection("Needs Attention", "Priority actions that may affect member access, adoption, or follow-up.", needsAttention),
      toSection("Coming Up", "Events and near-term activity that should stay visible this week.", comingUp),
      toSection("Suggested Actions", "Practical next steps that support engagement quality and cleaner data.", suggestedActions),
      toSection("Recent Updates", "Recent member activity worth noting in your workspace.", recentUpdates)
    ]
  };
}

async function getStudentReminders(userId) {
  const now = new Date();
  const next14Days = daysFromNow(14);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: {
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      },
      eventRegistrations: {
        where: {
          status: "registered",
          event: {
            eventDate: {
              gte: now
            }
          }
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              eventDate: true,
              location: true
            }
          }
        },
        orderBy: {
          event: {
            eventDate: "asc"
          }
        },
        take: 3
      }
    }
  });

  if (!user?.studentProfile) {
    return {
      summary: {
        headline: "Student reminders are available once your profile is linked.",
        stats: [
          { label: "Profile Completion", value: "0%" },
          { label: "Upcoming Events", value: 0 },
          { label: "Mentorship Requests", value: 0 }
        ]
      },
      sections: [
        toSection("Needs Attention", "Link your student profile to unlock reminders.", [
          item({
            id: "missing-profile",
            title: "Student profile not found",
            description: "Your account needs a linked student profile before reminders can be shown here.",
            category: "attention",
            priority: "high",
            actionLabel: "Open Dashboard",
            actionHref: "/dashboard"
          })
        ]),
        toSection("Coming Up", "Events will appear here once your account is set up.", []),
        toSection("Suggested Actions", "Recommended next steps for your workspace.", []),
        toSection("Recent Updates", "Recent status changes will appear here.", [])
      ]
    };
  }

  const [requests, upcomingEvents] = await Promise.all([
    prisma.mentorshipRequest.findMany({
      where: { studentId: user.studentProfile.id },
      include: {
        alumni: {
          select: {
            firstName: true,
            lastName: true,
            company: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 4
    }),
    prisma.event.findMany({
      where: {
        eventDate: {
          gte: now,
          lte: next14Days
        }
      },
      orderBy: { eventDate: "asc" },
      take: 3,
      select: {
        id: true,
        title: true,
        eventDate: true,
        location: true
      }
    })
  ]);

  const completion = computeCompletionScore(user.studentProfile, "student");
  const pendingRequests = requests.filter((request) => request.status === "pending");
  const acceptedRequests = requests.filter((request) => request.status === "accepted");

  const needsAttention = [];
  const comingUp = [];
  const suggestedActions = [];
  const recentUpdates = [];

  if (completion < 90) {
    needsAttention.push(
      item({
        id: "profile-completion",
        title: `Profile is ${completion}% complete`,
        description: "Complete the remaining profile details to strengthen mentor matching and visibility.",
        category: "attention",
        priority: "high",
        actionLabel: "Update Profile",
        actionHref: "/profile"
      })
    );
  }

  if (pendingRequests.length > 0) {
    needsAttention.push(
      item({
        id: "pending-mentorship",
        title: `${pendingRequests.length} mentorship request${pendingRequests.length === 1 ? "" : "s"} awaiting response`,
        description: "Review your latest requests and follow up where needed to keep momentum moving.",
        category: "attention",
        priority: "medium",
        actionLabel: "Open Mentorship",
        actionHref: "/mentorship"
      })
    );
  }

  if (user.eventRegistrations.length > 0) {
    user.eventRegistrations.forEach((registration) => {
      comingUp.push(
        item({
          id: `registered-event-${registration.event.id}`,
          title: registration.event.title,
          description: `You are registered for ${new Date(registration.event.eventDate).toLocaleDateString()}${registration.event.location ? ` at ${registration.event.location}` : ""}.`,
          category: "upcoming",
          priority: "medium",
          actionLabel: "View Events",
          actionHref: "/events"
        })
      );
    });
  } else if (upcomingEvents.length > 0) {
    upcomingEvents.forEach((event) => {
      comingUp.push(
        item({
          id: `discover-event-${event.id}`,
          title: event.title,
          description: `Upcoming on ${new Date(event.eventDate).toLocaleDateString()}${event.location ? ` at ${event.location}` : ""}.`,
          category: "upcoming",
          priority: "low",
          actionLabel: "Browse Events",
          actionHref: "/events"
        })
      );
    });
  }

  if (acceptedRequests.length > 0) {
    suggestedActions.push(
      item({
        id: "accepted-mentorship",
        title: `${acceptedRequests.length} accepted mentorship connection${acceptedRequests.length === 1 ? "" : "s"}`,
        description: "Keep the conversation active and make progress while the mentorship connection is open.",
        category: "suggested",
        priority: "medium",
        actionLabel: "Review Mentorship",
        actionHref: "/mentorship"
      })
    );
  } else {
    suggestedActions.push(
      item({
        id: "find-mentor",
        title: "Explore alumni mentors",
        description: "Use the directory to identify alumni whose background aligns with your goals and interests.",
        category: "suggested",
        priority: "low",
        actionLabel: "Open Directory",
        actionHref: "/directory?profileType=alumni"
      })
    );
  }

  requests.slice(0, 3).forEach((request) => {
    const mentorName = [request.alumni?.firstName, request.alumni?.lastName].filter(Boolean).join(" ") || "an alumni mentor";
    recentUpdates.push(
      item({
        id: `request-${request.id}`,
        title: `${mentorName} request is ${request.status}`,
        description: request.status === "accepted"
          ? "A mentor has accepted your request. This is a good time to continue the conversation."
          : request.status === "pending"
          ? "Your mentorship request is still active and awaiting a response."
          : "Review the request outcome and decide on your next outreach step.",
        category: "update",
        priority: "low",
        actionLabel: "Open Mentorship",
        actionHref: "/mentorship"
      })
    );
  });

  return {
    summary: {
      headline: "Personal reminders to help you stay active, visible, and well-prepared in the network.",
      stats: [
        { label: "Profile Completion", value: `${completion}%` },
        { label: "Active Requests", value: pendingRequests.length + acceptedRequests.length },
        { label: "Upcoming Events", value: user.eventRegistrations.length || upcomingEvents.length }
      ]
    },
    sections: [
      toSection("Needs Attention", "Items that can improve your profile readiness and mentorship momentum.", needsAttention),
      toSection("Coming Up", "Events and upcoming activity available in your workspace.", comingUp),
      toSection("Suggested Actions", "Recommended next steps based on your current activity.", suggestedActions),
      toSection("Recent Updates", "Recent changes to your mentorship activity and progress.", recentUpdates)
    ]
  };
}

async function getAlumniReminders(userId) {
  const now = new Date();
  const next14Days = daysFromNow(14);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      alumniProfile: {
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      },
      eventRegistrations: {
        where: {
          status: "registered",
          event: {
            eventDate: {
              gte: now
            }
          }
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              eventDate: true,
              location: true
            }
          }
        },
        orderBy: {
          event: {
            eventDate: "asc"
          }
        },
        take: 3
      }
    }
  });

  if (!user?.alumniProfile) {
    return {
      summary: {
        headline: "Alumni reminders are available once your profile is linked.",
        stats: [
          { label: "Profile Completion", value: "0%" },
          { label: "Pending Requests", value: 0 },
          { label: "Upcoming Events", value: 0 }
        ]
      },
      sections: [
        toSection("Needs Attention", "Link your alumni profile to unlock reminders.", [
          item({
            id: "missing-alumni-profile",
            title: "Alumni profile not found",
            description: "Your account needs a linked alumni profile before reminders can be shown here.",
            category: "attention",
            priority: "high",
            actionLabel: "Open Dashboard",
            actionHref: "/dashboard"
          })
        ]),
        toSection("Coming Up", "Events will appear here once your account is set up.", []),
        toSection("Suggested Actions", "Recommended next steps for your workspace.", []),
        toSection("Recent Updates", "Recent status changes will appear here.", [])
      ]
    };
  }

  const [incomingRequests, upcomingEvents] = await Promise.all([
    prisma.mentorshipRequest.findMany({
      where: { alumniId: user.alumniProfile.id },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            program: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.event.findMany({
      where: {
        eventDate: {
          gte: now,
          lte: next14Days
        }
      },
      orderBy: { eventDate: "asc" },
      take: 3,
      select: {
        id: true,
        title: true,
        eventDate: true,
        location: true
      }
    })
  ]);

  const completion = computeCompletionScore(user.alumniProfile, "alumni");
  const pendingRequests = incomingRequests.filter((request) => request.status === "pending");
  const acceptedRequests = incomingRequests.filter((request) => request.status === "accepted");

  const needsAttention = [];
  const comingUp = [];
  const suggestedActions = [];
  const recentUpdates = [];

  if (pendingRequests.length > 0) {
    needsAttention.push(
      item({
        id: "incoming-requests",
        title: `${pendingRequests.length} mentorship request${pendingRequests.length === 1 ? "" : "s"} waiting for you`,
        description: "Respond to students requesting guidance so interest and momentum are not lost.",
        category: "attention",
        priority: "high",
        actionLabel: "Open Mentorship",
        actionHref: "/mentorship"
      })
    );
  }

  if (completion < 90) {
    needsAttention.push(
      item({
        id: "alumni-profile-completion",
        title: `Profile is ${completion}% complete`,
        description: "Complete your professional details so students can understand your background with confidence.",
        category: "attention",
        priority: "medium",
        actionLabel: "Update Profile",
        actionHref: "/profile"
      })
    );
  }

  if (user.eventRegistrations.length > 0) {
    user.eventRegistrations.forEach((registration) => {
      comingUp.push(
        item({
          id: `alumni-event-${registration.event.id}`,
          title: registration.event.title,
          description: `You are registered for ${new Date(registration.event.eventDate).toLocaleDateString()}${registration.event.location ? ` at ${registration.event.location}` : ""}.`,
          category: "upcoming",
          priority: "medium",
          actionLabel: "View Events",
          actionHref: "/events"
        })
      );
    });
  } else if (upcomingEvents.length > 0) {
    upcomingEvents.forEach((event) => {
      comingUp.push(
        item({
          id: `alumni-discover-event-${event.id}`,
          title: event.title,
          description: `Upcoming on ${new Date(event.eventDate).toLocaleDateString()}${event.location ? ` at ${event.location}` : ""}.`,
          category: "upcoming",
          priority: "low",
          actionLabel: "Browse Events",
          actionHref: "/events"
        })
      );
    });
  }

  if (acceptedRequests.length > 0) {
    suggestedActions.push(
      item({
        id: "accepted-connections",
        title: `${acceptedRequests.length} active mentorship connection${acceptedRequests.length === 1 ? "" : "s"}`,
        description: "Keep the conversation active and move accepted requests toward a meaningful outcome.",
        category: "suggested",
        priority: "medium",
        actionLabel: "Manage Mentorship",
        actionHref: "/mentorship"
      })
    );
  }

  if (pendingRequests.length === 0 && acceptedRequests.length === 0) {
    suggestedActions.push(
      item({
        id: "refresh-presence",
        title: "Strengthen your profile visibility",
        description: "A complete profile and updated meeting link make it easier for students to reach out with confidence.",
        category: "suggested",
        priority: "low",
        actionLabel: "Open Profile",
        actionHref: "/profile"
      })
    );
  }

  incomingRequests.slice(0, 3).forEach((request) => {
    const studentName = [request.student?.firstName, request.student?.lastName].filter(Boolean).join(" ") || "A student";
    recentUpdates.push(
      item({
        id: `incoming-${request.id}`,
        title: `${studentName} request is ${request.status}`,
        description: request.status === "pending"
          ? "A student is waiting for your response."
          : request.status === "accepted"
          ? "You accepted this mentorship request and can continue building the connection."
          : "Review the request history and decide on the most appropriate next step.",
        category: "update",
        priority: "low",
        actionLabel: "Open Mentorship",
        actionHref: "/mentorship"
      })
    );
  });

  return {
    summary: {
      headline: "Alumni reminders focused on mentorship responsiveness, visibility, and follow-through.",
      stats: [
        { label: "Profile Completion", value: `${completion}%` },
        { label: "Pending Requests", value: pendingRequests.length },
        { label: "Upcoming Events", value: user.eventRegistrations.length || upcomingEvents.length }
      ]
    },
    sections: [
      toSection("Needs Attention", "Priority items that need your response or profile follow-through.", needsAttention),
      toSection("Coming Up", "Event visibility and upcoming network activity.", comingUp),
      toSection("Suggested Actions", "Helpful next steps to improve engagement quality.", suggestedActions),
      toSection("Recent Updates", "Recent mentorship activity linked to your account.", recentUpdates)
    ]
  };
}

export async function getMyReminders(req, res) {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    let payload;

    if (role === "admin" || role === "faculty") {
      payload = await getAdminOrFacultyReminders(role);
    } else if (role === "student") {
      payload = await getStudentReminders(userId);
    } else if (role === "alumni") {
      payload = await getAlumniReminders(userId);
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json({
      role,
      ...payload
    });
  } catch (error) {
    console.error("Failed to load reminders", error);
    return res.status(500).json({ message: "Failed to load reminders" });
  }
}
