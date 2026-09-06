-- CreateEnum
CREATE TYPE "ContributionType" AS ENUM ('GIVE', 'PLEDGE');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FULFILLED', 'OUTSTANDING');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('CAMERA', 'MICROPHONE', 'LIGHTING');

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorPhone" TEXT NOT NULL,
    "type" "ContributionType" NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContributionItem" (
    "id" TEXT NOT NULL,
    "contributionId" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "ContributionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contribution_type_idx" ON "Contribution"("type");

-- CreateIndex
CREATE INDEX "Contribution_status_idx" ON "Contribution"("status");

-- CreateIndex
CREATE INDEX "Contribution_createdAt_idx" ON "Contribution"("createdAt");

-- CreateIndex
CREATE INDEX "ContributionItem_contributionId_idx" ON "ContributionItem"("contributionId");

-- CreateIndex
CREATE INDEX "ContributionItem_category_idx" ON "ContributionItem"("category");

-- AddForeignKey
ALTER TABLE "ContributionItem" ADD CONSTRAINT "ContributionItem_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "Contribution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
