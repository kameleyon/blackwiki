import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name")?.toString() || '';
    const bio = formData.get("bio")?.toString() || '';
    const location = formData.get("location")?.toString() || '';
    const website = formData.get("website")?.toString() || '';
    const wecherp = formData.get("wecherp")?.toString() || '';
    const expertise = formData.get("expertise")?.toString() || '';
    const interests = formData.get("interests")?.toString() || '';

    await prisma.user.update({
      where: { id: session.id },
      data: {
        name,
        bio,
        location,
        website,
        wecherp,
        expertise,
        interests,
        lastActive: new Date(),
      },
    });

    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/profile`);
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error);
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/profile/edit?error=true`);
  }
}
