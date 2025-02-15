import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/db";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = `${uuidv4()}.${file.name.split(".").pop()}`;
    const uploadDir = join(process.cwd(), "public/uploads");
    const filepath = join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Update user profile with new image URL
    const imageUrl = `/uploads/${filename}`;
    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
    });

    return NextResponse.json({ 
      message: "Image uploaded successfully",
      imageUrl 
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
