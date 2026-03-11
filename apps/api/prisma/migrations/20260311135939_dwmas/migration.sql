-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('IDLE', 'SYNCING', 'SUCCESS', 'ERROR');

-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "lastSuccessfulSyncAt" TIMESTAMP(3),
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "sourceUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "syncError" TEXT,
ADD COLUMN     "syncStatus" "SyncStatus" NOT NULL DEFAULT 'IDLE';

-- AlterTable
ALTER TABLE "WorkflowRun" ADD COLUMN     "sourceUpdatedAt" TIMESTAMP(3);
