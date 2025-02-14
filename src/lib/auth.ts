import { getServerSession } from "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      bio?: string | null;
      location?: string | null;
      website?: string | null;
      wecherp?: string | null;
      expertise?: string | null;
      interests?: string | null;
      joinedAt: Date;
      lastActive: Date;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    wecherp?: string | null;
    expertise?: string | null;
    interests?: string | null;
    joinedAt: Date;
    lastActive: Date;
  }
}

export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user;
}

export function isEditor(user: { role: string } | undefined) {
  return user?.role === "editor" || user?.role === "admin";
}

export function isAdmin(user: { role: string } | undefined) {
  return user?.role === "admin";
}
