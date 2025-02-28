-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isMerged" BOOLEAN NOT NULL DEFAULT false,
    "mergedAt" DATETIME,
    "mergedToId" TEXT,
    CONSTRAINT "Branch_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Branch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Branch_mergedToId_fkey" FOREIGN KEY ("mergedToId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BranchVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    CONSTRAINT "BranchVersion_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BranchVersion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_articleId_name_key" ON "Branch"("articleId", "name");

-- CreateIndex
CREATE INDEX "Branch_articleId_idx" ON "Branch"("articleId");

-- CreateIndex
CREATE INDEX "Branch_userId_idx" ON "Branch"("userId");

-- CreateIndex
CREATE INDEX "Branch_mergedToId_idx" ON "Branch"("mergedToId");

-- CreateIndex
CREATE UNIQUE INDEX "BranchVersion_branchId_versionId_key" ON "BranchVersion"("branchId", "versionId");

-- CreateIndex
CREATE INDEX "BranchVersion_branchId_idx" ON "BranchVersion"("branchId");

-- CreateIndex
CREATE INDEX "BranchVersion_versionId_idx" ON "BranchVersion"("versionId");

-- Drop and recreate Version table with branchId
CREATE TABLE "new_Version" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT NOT NULL,
    "editId" TEXT UNIQUE,
    "branchId" TEXT,
    CONSTRAINT "Version_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Version_editId_fkey" FOREIGN KEY ("editId") REFERENCES "Edit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Version_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data from old Version table
INSERT INTO "new_Version" ("id", "number", "content", "createdAt", "articleId", "editId")
SELECT "id", "number", "content", "createdAt", "articleId", "editId"
FROM "Version";

-- Drop old Version table
DROP TABLE "Version";

-- Rename new Version table
ALTER TABLE "new_Version" RENAME TO "Version";

-- Recreate Version indexes
CREATE UNIQUE INDEX "Version_articleId_number_key" ON "Version"("articleId", "number");
CREATE INDEX "Version_articleId_idx" ON "Version"("articleId");
CREATE INDEX "Version_number_articleId_idx" ON "Version"("number", "articleId");
CREATE INDEX "Version_branchId_idx" ON "Version"("branchId");
