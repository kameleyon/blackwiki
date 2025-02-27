/*
  Warnings:

  - You are about to drop the `Collaboration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollaborationInvite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `updatedAt` on the `Tag` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Collaboration_userId_articleId_key";

-- DropIndex
DROP INDEX "CollaborationInvite_userId_articleId_key";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN "metadata" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Collaboration";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CollaborationInvite";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Tag" ("createdAt", "id", "name") SELECT "createdAt", "id", "name" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
