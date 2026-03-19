-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "targetRole" "Role",
    "targetProgram" TEXT,
    "targetGradYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "targetAudience" TEXT NOT NULL DEFAULT 'all';

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Announcement_targetRole_idx" ON "Announcement"("targetRole");

-- CreateIndex
CREATE INDEX "Announcement_targetProgram_idx" ON "Announcement"("targetProgram");

-- CreateIndex
CREATE INDEX "Announcement_targetGradYear_idx" ON "Announcement"("targetGradYear");

-- CreateIndex
CREATE INDEX "Announcement_creatorId_idx" ON "Announcement"("creatorId");

-- CreateIndex
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
