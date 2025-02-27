import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Define media types based on file extensions
const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const documentExtensions = [".pdf", ".doc", ".docx", ".txt", ".md"];

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const folder = url.searchParams.get("folder") || "root";
    
    // Determine the directory path
    const baseDir = join(process.cwd(), "public", "uploads");
    const dirPath = folder === "root" ? baseDir : join(baseDir, folder);
    
    // Check if directory exists
    if (!existsSync(dirPath)) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }
    
    // Read directory contents
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    // Process folders
    const folders = await Promise.all(
      entries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith("."))
        .map(async (entry) => {
          const folderPath = join(dirPath, entry.name);
          const folderStat = await stat(folderPath);
          
          return {
            id: entry.name,
            name: entry.name,
            createdAt: folderStat.birthtime.toISOString(),
            path: folder === "root" ? entry.name : `${folder}/${entry.name}`,
          };
        })
    );
    
    // Process files
    const files = await Promise.all(
      entries
        .filter(entry => entry.isFile() && !entry.name.startsWith("thumb_") && !entry.name.startsWith("."))
        .map(async (entry) => {
          const filePath = join(dirPath, entry.name);
          const fileStat = await stat(filePath);
          const extension = entry.name.substring(entry.name.lastIndexOf(".")).toLowerCase();
          
          // Determine file type
          let type = "other";
          if (imageExtensions.includes(extension)) {
            type = "image";
          } else if (documentExtensions.includes(extension)) {
            type = "document";
          }
          
          // Check if thumbnail exists for images
          let thumbnailUrl = null;
          if (type === "image") {
            const thumbName = `thumb_${entry.name}`;
            const thumbPath = join(dirPath, thumbName);
            if (existsSync(thumbPath)) {
              thumbnailUrl = `/uploads/${folder !== "root" ? `${folder}/` : ""}${thumbName}`;
            }
          }
          
          return {
            id: entry.name,
            name: entry.name,
            url: `/uploads/${folder !== "root" ? `${folder}/` : ""}${entry.name}`,
            thumbnailUrl,
            type,
            size: fileStat.size,
            createdAt: fileStat.birthtime.toISOString(),
            folder: folder,
          };
        })
    );
    
    return NextResponse.json({
      folders,
      files,
    });
  } catch (error) {
    console.error("Error listing media:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list media" },
      { status: 500 }
    );
  }
}
