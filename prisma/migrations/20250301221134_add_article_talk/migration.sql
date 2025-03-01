-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "articleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    CONSTRAINT "Collaboration_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CollaborationContributor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collaborationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'contributor',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollaborationContributor_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "Collaboration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "imageAlt" TEXT,
    "imageWidth" INTEGER,
    "imageHeight" INTEGER,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("authorId", "content", "createdAt", "id", "image", "imageAlt", "imageHeight", "imageWidth", "isPublished", "likes", "metadata", "slug", "status", "summary", "title", "updatedAt", "views") SELECT "authorId", "content", "createdAt", "id", "image", "imageAlt", "imageHeight", "imageWidth", "isPublished", "likes", "metadata", "slug", "status", "summary", "title", "updatedAt", "views" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE TABLE "new_Diff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "changes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromVersionId" TEXT NOT NULL,
    "toVersionId" TEXT NOT NULL,
    CONSTRAINT "Diff_fromVersionId_fkey" FOREIGN KEY ("fromVersionId") REFERENCES "Version" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Diff_toVersionId_fkey" FOREIGN KEY ("toVersionId") REFERENCES "Version" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Diff" ("changes", "createdAt", "fromVersionId", "id", "toVersionId") SELECT "changes", "createdAt", "fromVersionId", "id", "toVersionId" FROM "Diff";
DROP TABLE "Diff";
ALTER TABLE "new_Diff" RENAME TO "Diff";
CREATE INDEX "Diff_fromVersionId_idx" ON "Diff"("fromVersionId");
CREATE INDEX "Diff_toVersionId_idx" ON "Diff"("toVersionId");
CREATE TABLE "new_Edit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "type" TEXT NOT NULL DEFAULT 'content',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "versionId" TEXT,
    CONSTRAINT "Edit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Edit_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Edit_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Edit" ("articleId", "content", "createdAt", "id", "metadata", "summary", "type", "userId", "versionId") SELECT "articleId", "content", "createdAt", "id", "metadata", "summary", "type", "userId", "versionId" FROM "Edit";
DROP TABLE "Edit";
ALTER TABLE "new_Edit" RENAME TO "Edit";
CREATE UNIQUE INDEX "Edit_versionId_key" ON "Edit"("versionId");
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "feedback" TEXT,
    "score" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "checklist" TEXT,
    "metadata" TEXT,
    CONSTRAINT "Review_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("articleId", "assigneeId", "checklist", "completedAt", "createdAt", "feedback", "id", "metadata", "reviewerId", "score", "status", "type", "updatedAt") SELECT "articleId", "assigneeId", "checklist", "completedAt", "createdAt", "feedback", "id", "metadata", "reviewerId", "score", "status", "type", "updatedAt" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_articleId_idx" ON "Review"("articleId");
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");
CREATE INDEX "Review_assigneeId_idx" ON "Review"("assigneeId");
CREATE INDEX "Review_type_idx" ON "Review"("type");
CREATE INDEX "Review_status_idx" ON "Review"("status");
CREATE UNIQUE INDEX "Review_articleId_type_key" ON "Review"("articleId", "type");
CREATE TABLE "new_ReviewState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "currentStage" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    CONSTRAINT "ReviewState_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReviewState" ("articleId", "blockReason", "currentStage", "dueDate", "id", "isBlocked", "lastUpdatedAt", "priority", "startedAt") SELECT "articleId", "blockReason", "currentStage", "dueDate", "id", "isBlocked", "lastUpdatedAt", "priority", "startedAt" FROM "ReviewState";
DROP TABLE "ReviewState";
ALTER TABLE "new_ReviewState" RENAME TO "ReviewState";
CREATE UNIQUE INDEX "ReviewState_articleId_key" ON "ReviewState"("articleId");
CREATE TABLE "new_Version" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT NOT NULL,
    "editId" TEXT,
    "branchId" TEXT,
    CONSTRAINT "Version_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Version_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Version" ("articleId", "branchId", "content", "createdAt", "editId", "id", "number") SELECT "articleId", "branchId", "content", "createdAt", "editId", "id", "number" FROM "Version";
DROP TABLE "Version";
ALTER TABLE "new_Version" RENAME TO "Version";
CREATE UNIQUE INDEX "Version_editId_key" ON "Version"("editId");
CREATE INDEX "Version_articleId_idx" ON "Version"("articleId");
CREATE INDEX "Version_number_articleId_idx" ON "Version"("number", "articleId");
CREATE INDEX "Version_branchId_idx" ON "Version"("branchId");
CREATE UNIQUE INDEX "Version_articleId_number_key" ON "Version"("articleId", "number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Collaboration_articleId_idx" ON "Collaboration"("articleId");

-- CreateIndex
CREATE INDEX "Collaboration_status_idx" ON "Collaboration"("status");

-- CreateIndex
CREATE INDEX "CollaborationContributor_collaborationId_idx" ON "CollaborationContributor"("collaborationId");

-- CreateIndex
CREATE INDEX "CollaborationContributor_userId_idx" ON "CollaborationContributor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CollaborationContributor_collaborationId_userId_key" ON "CollaborationContributor"("collaborationId", "userId");
