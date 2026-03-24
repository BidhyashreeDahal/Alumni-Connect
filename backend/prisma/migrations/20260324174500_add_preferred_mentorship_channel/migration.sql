-- CreateEnum
CREATE TYPE "MentorshipContactChannel" AS ENUM ('email', 'linkedin', 'calendly');

-- AlterTable
ALTER TABLE "AlumniProfile"
ADD COLUMN "preferredMentorshipChannel" "MentorshipContactChannel";
