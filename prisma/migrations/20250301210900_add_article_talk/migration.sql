-- CreateTable
CREATE TABLE "ArticleTalk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'general',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "articleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "ArticleTalk_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArticleTalk_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ArticleTalk_articleId_idx" ON "ArticleTalk"("articleId");

-- CreateIndex
CREATE INDEX "ArticleTalk_authorId_idx" ON "ArticleTalk"("authorId");

-- CreateIndex
CREATE INDEX "ArticleTalk_section_idx" ON "ArticleTalk"("section");
