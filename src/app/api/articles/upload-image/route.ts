import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new NextResponse("File size must be less than 5MB", { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new NextResponse("File must be an image", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Resize if larger than 800x800
    if ((metadata.width && metadata.width > 800) || (metadata.height && metadata.height > 800)) {
      await image.resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Generate unique filename
    const filename = `${uuidv4()}.${file.name.split(".").pop()}`;
    const uploadDir = join(process.cwd(), "public/uploads");
    const filepath = join(uploadDir, filename);

    // Save processed image
    await image.toFile(filepath);

    // Get final dimensions
    const finalMetadata = await sharp(filepath).metadata();

    return NextResponse.json({ 
      message: "Image uploaded successfully",
      imageUrl: `/uploads/${filename}`,
      width: finalMetadata.width,
      height: finalMetadata.height,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
