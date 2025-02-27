import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { existsSync } from "fs";

// Define allowed file types
const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const allowedDocumentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

// Maximum file size (5MB for images, 10MB for documents)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folder = formData.get("folder") as string || "root";
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads");
    const folderDir = join(uploadDir, folder !== "root" ? folder : "");
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    if (folder !== "root" && !existsSync(folderDir)) {
      await mkdir(folderDir, { recursive: true });
    }

    // Process each file
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        // Validate file type
        if (
          !allowedImageTypes.includes(file.type) &&
          !allowedDocumentTypes.includes(file.type)
        ) {
          throw new Error(`Unsupported file type: ${file.type}`);
        }

        // Validate file size
        const isImage = allowedImageTypes.includes(file.type);
        const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
        
        if (file.size > maxSize) {
          throw new Error(
            `File too large: ${file.name}. Maximum size is ${
              isImage ? "5MB for images" : "10MB for documents"
            }`
          );
        }

        // Generate a unique filename
        const fileExtension = file.name.split(".").pop() || "";
        const fileName = `${uuidv4()}.${fileExtension}`;
        const relativePath = `/uploads/${folder !== "root" ? `${folder}/` : ""}${fileName}`;

        // Process the file
        const buffer = Buffer.from(await file.arrayBuffer());
        
        if (isImage) {
          // Optimize image with sharp
          const optimizedImage = await sharp(buffer)
            .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
            .toBuffer();
          
          // Save the optimized image
          await writeFile(join(process.cwd(), "public", relativePath.slice(1)), optimizedImage);
          
          // Generate thumbnail
          const thumbnailName = `thumb_${fileName}`;
          const thumbnailPath = join(folder !== "root" ? folderDir : uploadDir, thumbnailName);
          const thumbnailRelativePath = `/uploads/${folder !== "root" ? `${folder}/` : ""}${thumbnailName}`;
          
          await sharp(buffer)
            .resize(300, 300, { fit: "cover" })
            .toFile(thumbnailPath);
          
          return {
            name: file.name,
            url: relativePath,
            thumbnailUrl: thumbnailRelativePath,
            type: "image",
            size: file.size,
            createdAt: new Date().toISOString(),
            folder,
          };
        } else {
          // Save document without processing
          await writeFile(join(process.cwd(), "public", relativePath.slice(1)), buffer);
          
          return {
            name: file.name,
            url: relativePath,
            type: "document",
            size: file.size,
            createdAt: new Date().toISOString(),
            folder,
          };
        }
      })
    );

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload files" },
      { status: 500 }
    );
  }
}
