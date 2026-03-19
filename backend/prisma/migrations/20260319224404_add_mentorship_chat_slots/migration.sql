-- CreateEnum
CREATE TYPE "MentorshipMessageType" AS ENUM ('text', 'slot_proposal', 'system');

-- CreateTable
CREATE TABLE "MentorshipMessage" (
    "id" TEXT NOT NULL,
    "mentorshipRequestId" TEXT NOT NULL,
    "senderId" TEXT,
    "type" "MentorshipMessageType" NOT NULL DEFAULT 'text',
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorshipMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipTimeSlot" (
    "id" TEXT NOT NULL,
    "mentorshipRequestId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "selectedById" TEXT,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorshipTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorshipMessage_mentorshipRequestId_idx" ON "MentorshipMessage"("mentorshipRequestId");

-- CreateIndex
CREATE INDEX "MentorshipMessage_senderId_idx" ON "MentorshipMessage"("senderId");

-- CreateIndex
CREATE INDEX "MentorshipMessage_createdAt_idx" ON "MentorshipMessage"("createdAt");

-- CreateIndex
CREATE INDEX "MentorshipTimeSlot_mentorshipRequestId_idx" ON "MentorshipTimeSlot"("mentorshipRequestId");

-- CreateIndex
CREATE INDEX "MentorshipTimeSlot_messageId_idx" ON "MentorshipTimeSlot"("messageId");

-- CreateIndex
CREATE INDEX "MentorshipTimeSlot_startAt_idx" ON "MentorshipTimeSlot"("startAt");

-- CreateIndex
CREATE INDEX "MentorshipTimeSlot_isSelected_idx" ON "MentorshipTimeSlot"("isSelected");

-- AddForeignKey
ALTER TABLE "MentorshipMessage" ADD CONSTRAINT "MentorshipMessage_mentorshipRequestId_fkey" FOREIGN KEY ("mentorshipRequestId") REFERENCES "MentorshipRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipMessage" ADD CONSTRAINT "MentorshipMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipTimeSlot" ADD CONSTRAINT "MentorshipTimeSlot_mentorshipRequestId_fkey" FOREIGN KEY ("mentorshipRequestId") REFERENCES "MentorshipRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipTimeSlot" ADD CONSTRAINT "MentorshipTimeSlot_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "MentorshipMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipTimeSlot" ADD CONSTRAINT "MentorshipTimeSlot_selectedById_fkey" FOREIGN KEY ("selectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
