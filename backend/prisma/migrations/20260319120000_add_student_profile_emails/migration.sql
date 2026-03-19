-- AlterTable
ALTER TABLE "StudentProfile"
ADD COLUMN "personalEmail" TEXT,
ADD COLUMN "schoolEmail" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_personalEmail_key" ON "StudentProfile"("personalEmail");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_schoolEmail_key" ON "StudentProfile"("schoolEmail");
