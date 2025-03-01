-- Fix the missing 'likes' column in the Article table
ALTER TABLE "Article" ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0;

-- Create an index on the likes column for better performance
CREATE INDEX "Article_likes_idx" ON "Article"("likes");
