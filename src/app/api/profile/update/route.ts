import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    
    // Validate the data
    const { name, bio, location, website, wecherp, expertise, interests } = data;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        name: name || null,
        bio: bio || null,
        location: location || null,
        website: website || null,
        wecherp: wecherp || null,
        expertise: expertise || null,
        interests: interests || null,
        lastActive: new Date(),
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        location: updatedUser.location,
        website: updatedUser.website,
        wecherp: updatedUser.wecherp,
        expertise: updatedUser.expertise,
        interests: updatedUser.interests,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
