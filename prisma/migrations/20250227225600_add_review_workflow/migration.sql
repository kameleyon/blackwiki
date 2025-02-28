-- CreateTable
CREATE TABLE "ReviewState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "currentStage" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
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
    FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT,
    FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE RESTRICT
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewState_articleId_key" ON "ReviewState"("articleId");

-- CreateIndex
CREATE INDEX "Review_articleId_idx" ON "Review"("articleId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_assigneeId_idx" ON "Review"("assigneeId");

-- CreateIndex
CREATE INDEX "Review_type_idx" ON "Review"("type");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");
