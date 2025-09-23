import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { validateRegistrationForm, sanitizeInput, canonicalizeEmail, type RegistrationFormData } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;
    
    // Basic null/undefined checks
    if (!email || !password || !name || !confirmPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Sanitize inputs (preserve passwords exactly)
    const sanitizedData: RegistrationFormData = {
      name: sanitizeInput(name),
      email: canonicalizeEmail(email),
      password: password, // Don't modify passwords
      confirmPassword: confirmPassword // Don't modify passwords
    };
    
    // Comprehensive validation
    const validation = validateRegistrationForm(sanitizedData);
    if (!validation.isValid) {
      const errors = Object.entries(validation.errors)
        .filter(([_, errorArray]) => errorArray.length > 0)
        .reduce((acc, [field, errorArray]) => ({ ...acc, [field]: errorArray }), {});
      
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: errors,
          message: "Please check your input and try again" 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          error: "Email already registered", 
          details: { email: ["This email address is already registered"] },
          message: "Please use a different email address or sign in instead" 
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(sanitizedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        password: hashedPassword,
        role: "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error registering user" },
      { status: 500 }
    );
  }
}
