-- RBAC hardening: account status + archive flags
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "AlumniProfile"
ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "StudentProfile"
ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  ALTER TYPE "MentorshipStatus" ADD VALUE IF NOT EXISTS 'cancelled';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "RSVPStatus" AS ENUM ('registered', 'waitlisted', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "EventRegistration"
ADD COLUMN IF NOT EXISTS "status" "RSVPStatus" NOT NULL DEFAULT 'registered';
