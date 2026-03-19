-- AlterEnum
ALTER TYPE "MentorshipStatus" ADD VALUE 'scheduled';

-- AlterTable
ALTER TABLE "MentorshipRequest" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "meetingLink" TEXT,
ADD COLUMN     "meetingNotes" TEXT,
ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MentorshipFeedback" (
    "id" TEXT NOT NULL,
    "mentorshipRequestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorshipFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorshipFeedback_mentorshipRequestId_idx" ON "MentorshipFeedback"("mentorshipRequestId");

-- CreateIndex
CREATE INDEX "MentorshipFeedback_authorId_idx" ON "MentorshipFeedback"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorshipFeedback_mentorshipRequestId_authorId_key" ON "MentorshipFeedback"("mentorshipRequestId", "authorId");

-- AddForeignKey
ALTER TABLE "MentorshipFeedback" ADD CONSTRAINT "MentorshipFeedback_mentorshipRequestId_fkey" FOREIGN KEY ("mentorshipRequestId") REFERENCES "MentorshipRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipFeedback" ADD CONSTRAINT "MentorshipFeedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
