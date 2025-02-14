"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  if (!formData) {
    console.error("[PROFILE_UPDATE] No form data received");
    redirect('/profile/edit?error=true');
  }

  try {
    const session = await getCurrentUser();
    
    if (!session) {
      console.error("[PROFILE_UPDATE] No session found");
      redirect('/auth/signin');
    }

    // Extract and validate form data
    const payload = {
      name: formData.get("name")?.toString().trim(),
      bio: formData.get("bio")?.toString().trim(),
      location: formData.get("location")?.toString().trim(),
      website: formData.get("website")?.toString().trim(),
      wecherp: formData.get("wecherp")?.toString().trim(),
      expertise: formData.get("expertise")?.toString().trim(),
      interests: formData.get("interests")?.toString().trim(),
    };

    // Validate required fields
    if (!payload.name) {
      console.error("[PROFILE_UPDATE] Name is required");
      redirect('/profile/edit?error=true&message=name-required');
    }

    // Update user profile
    await prisma.user.update({
      where: { id: session.id },
      data: {
        name: payload.name,
        bio: payload.bio || '',
        location: payload.location || '',
        website: payload.website || '',
        wecherp: payload.wecherp || '',
        expertise: payload.expertise || '',
        interests: payload.interests || '',
        lastActive: new Date(),
      },
    });

    redirect('/profile');
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error);
    redirect('/profile/edit?error=true');
  }
}
