/*
  Warnings:

  - You are about to drop the column `twitter` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "password" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "wecherp" TEXT,
    "expertise" TEXT,
    "interests" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("bio", "email", "emailVerified", "expertise", "id", "image", "interests", "joinedAt", "lastActive", "location", "name", "password", "role", "website") SELECT "bio", "email", "emailVerified", "expertise", "id", "image", "interests", "joinedAt", "lastActive", "location", "name", "password", "role", "website" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
