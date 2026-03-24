-- Add consent tracking fields for account claim flow
ALTER TABLE "User"
ADD COLUMN "consentAcceptedAt" TIMESTAMP(3),
ADD COLUMN "consentVersion" TEXT;
