-- Add optional passwordHash for credential logins and enforce unique usernames
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
