/*
  Warnings:

  - Added the required column `profileType` to the `PrivateNote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('student', 'alumni');

-- DropForeignKey
ALTER TABLE "PrivateNote" DROP CONSTRAINT "PrivateNote_profileId_fkey";

-- AlterTable
ALTER TABLE "PrivateNote" ADD COLUMN     "profileType" "ProfileType" NOT NULL;

-- CreateIndex
CREATE INDEX "PrivateNote_profileId_idx" ON "PrivateNote"("profileId");
