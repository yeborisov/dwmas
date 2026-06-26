-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "githubCommentId" TEXT;

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "githubIssueNumber" INTEGER,
ADD COLUMN     "githubIssueState" TEXT,
ADD COLUMN     "githubIssueUrl" TEXT;
