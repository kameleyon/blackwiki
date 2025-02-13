import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      name,
      bio,
      location,
      website,
      wecherp,
      expertise,
      interests,
    } = data;

    // Convert expertise and interests arrays to JSON strings for storage
    const expertiseJson = expertise
      ? Array.isArray(expertise)
        ? JSON.stringify(expertise)
        : JSON.stringify(expertise.split(',').map((item: string) => item.trim()))
      : "[]";
    
    const interestsJson = interests
      ? Array.isArray(interests)
        ? JSON.stringify(interests)
        : JSON.stringify(interests.split(',').map((item: string) => item.trim()))
      : "[]";

    // Update user profile
    const updatedUser = await prisma.user.upsert({
      where: { email: session.user.email },
      create: {
        email: session.user.email,
        name: name || "",
        bio: bio || "",
        location: location || "",
        website: website || "",
        wecherp: wecherp || "",
        expertise: expertiseJson,
        interests: interestsJson,
        lastActive: new Date(),
        role: "user",
      },
      update: {
        name: name || undefined,
        bio: bio || undefined,
        location: location || undefined,
        website: website || undefined,
        wecherp: wecherp || undefined,
        expertise: expertiseJson,
        interests: interestsJson,
        lastActive: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        location: true,
        website: true,
        wecherp: true,
        expertise: true,
        interests: true,
        role: true,
        image: true,
      },
    });

    // Parse JSON strings back to arrays for response
    const formattedUser = {
      ...updatedUser,
      expertise: JSON.parse(updatedUser.expertise || "[]"),
      interests: JSON.parse(updatedUser.interests || "[]"),
    };

    return NextResponse.json({
      message: "Profile updated successfully",
      user: formattedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        location: true,
        website: true,
        wecherp: true,
        expertise: true,
        interests: true,
        role: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse JSON strings to arrays
    const formattedUser = {
      ...user,
      expertise: JSON.parse(user.expertise || "[]"),
      interests: JSON.parse(user.interests || "[]"),
    };

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
