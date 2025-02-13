import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import path from "path";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Create articles uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public/uploads/articles");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }

    // Generate unique filename
    const fileName = `${uuidv4()}${path.extname(file.name)}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process and optimize image
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Resize if width is greater than 800px while maintaining aspect ratio
    if (metadata.width && metadata.width > 800) {
      await image
        .resize(800, undefined, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFile(filePath);
    } else {
      await image.toFile(filePath);
    }

    // Get final image dimensions
    const finalMetadata = await sharp(filePath).metadata();

    return NextResponse.json({
      message: "Image uploaded successfully",
      image: `/uploads/articles/${fileName}`,
      width: finalMetadata.width,
      height: finalMetadata.height,
    });
  } catch (error) {
    console.error("Article image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
