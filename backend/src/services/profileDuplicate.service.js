import { prisma } from "../db/prisma.js";

function normalize(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function findPotentialUnclaimedAlumniDuplicate({
  firstName,
  lastName,
  graduationYear,
  program,
  excludeId
}) {
  const normalizedFirstName = normalize(firstName);
  const normalizedLastName = normalize(lastName);
  const normalizedProgram = normalize(program);

  if (!normalizedFirstName || !normalizedLastName || graduationYear === undefined || graduationYear === null) {
    return null;
  }

  const where = {
    isArchived: false,
    userId: null,
    graduationYear: Number(graduationYear),
    firstName: {
      equals: normalizedFirstName,
      mode: "insensitive"
    },
    lastName: {
      equals: normalizedLastName,
      mode: "insensitive"
    },
    id: excludeId ? { not: excludeId } : undefined
  };

  if (normalizedProgram) {
    where.program = {
      equals: normalizedProgram,
      mode: "insensitive"
    };
  }

  return prisma.alumniProfile.findFirst({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      program: true,
      graduationYear: true
    }
  });
}
