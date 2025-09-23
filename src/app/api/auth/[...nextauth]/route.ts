import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { validateLoginForm, canonicalizeEmail, type LoginFormData } from "@/lib/validation";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }
        
        // Validate and canonicalize credentials
        const loginData: LoginFormData = {
          email: canonicalizeEmail(credentials.email),
          password: credentials.password // Don't modify password
        };
        
        const validation = validateLoginForm(loginData);
        if (!validation.isValid) {
          throw new Error("Invalid email or password format");
        }

        const user = await prisma.user.findUnique({
          where: { email: loginData.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            bio: true,
            location: true,
            website: true,
            wecherp: true,
            expertise: true,
            interests: true,
            joinedAt: true,
            lastActive: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          ...user,
          password: undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        try {
          // Canonicalize email for consistent lookups
          const canonicalEmail = canonicalizeEmail(token.email || "");
          
          // Check if user exists in our database
          const dbUser = await prisma.user.findUnique({
            where: { email: canonicalEmail },
            select: {
              id: true,
              role: true,
              bio: true,
              location: true,
              website: true,
              wecherp: true,
              expertise: true,
              interests: true,
              joinedAt: true,
              lastActive: true,
            },
          });

          if (dbUser) {
            Object.assign(token, dbUser);
          } else {
            // Create new user if they don't exist
            const newUser = await prisma.user.create({
              data: {
                email: canonicalEmail,
                name: token.name || "",
                image: token.picture,
                role: "user", // Default role
              },
              select: {
                id: true,
                role: true,
                bio: true,
                location: true,
                website: true,
                wecherp: true,
                expertise: true,
                interests: true,
                joinedAt: true,
                lastActive: true,
              },
            });
            Object.assign(token, newUser);
          }
        } catch (error) {
          console.error("Error handling auth:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        Object.assign(session.user, token);
      }
      return session;
    },
    async redirect({ url }) {
      try {
        const { config } = await import('@/lib/config');
        const { getBaseUrl } = config;
        const baseUrl = getBaseUrl();
        
        // Handle error pages
        if (url?.includes('/auth/error')) {
          return `${baseUrl}/auth/error`;
        }
        // Handle successful sign-in
        if (url?.startsWith('/')) {
          return `${baseUrl}${url}`;
        }
        // Default to dashboard
        return `${baseUrl}/dashboard`;
      } catch (error) {
        console.error("Error importing config:", error);
        return "/auth/error";
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt'
  }
});

export { handler as GET, handler as POST };
