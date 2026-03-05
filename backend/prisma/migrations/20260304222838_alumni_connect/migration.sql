/*
  Warnings:

  - You are about to drop the column `alumniProfileId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `AlumniProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileType` to the `InviteToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MentorshipStatus" AS ENUM ('pending', 'accepted', 'declined', 'completed');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'student';

-- DropForeignKey
ALTER TABLE "InviteToken" DROP CONSTRAINT "InviteToken_profileId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_alumniProfileId_fkey";

-- DropIndex
DROP INDEX "User_alumniProfileId_key";

-- AlterTable
ALTER TABLE "AlumniProfile" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "InviteToken" ADD COLUMN     "profileType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "alumniProfileId",
ALTER COLUMN "role" DROP DEFAULT;

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "program" TEXT,
    "graduationYear" INTEGER,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateNote" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "alumniId" TEXT NOT NULL,
    "message" TEXT,
    "status" "MentorshipStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorshipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "MentorshipRequest_status_idx" ON "MentorshipRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AlumniProfile_userId_key" ON "AlumniProfile"("userId");

-- CreateIndex
CREATE INDEX "AlumniProfile_program_idx" ON "AlumniProfile"("program");

-- CreateIndex
CREATE INDEX "AlumniProfile_graduationYear_idx" ON "AlumniProfile"("graduationYear");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "AlumniProfile" ADD CONSTRAINT "AlumniProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateNote" ADD CONSTRAINT "PrivateNote_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "AlumniProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateNote" ADD CONSTRAINT "PrivateNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipRequest" ADD CONSTRAINT "MentorshipRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipRequest" ADD CONSTRAINT "MentorshipRequest_alumniId_fkey" FOREIGN KEY ("alumniId") REFERENCES "AlumniProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
