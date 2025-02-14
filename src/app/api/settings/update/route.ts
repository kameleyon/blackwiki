import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    const { username, currentPassword, newPassword, confirmPassword } = data

    // Update username if provided
    if (username && username !== user.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: username }
      })
    }

    // Update password if provided
    if (currentPassword && newPassword && confirmPassword) {
      // Verify passwords match
      if (newPassword !== confirmPassword) {
        return new NextResponse('New passwords do not match', { status: 400 })
      }

      // Get current user with password
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true }
      })

      if (!dbUser?.password) {
        return new NextResponse('Cannot update password for OAuth account', { status: 400 })
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, dbUser.password)
      if (!isValid) {
        return new NextResponse('Current password is incorrect', { status: 400 })
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
    }

    return new NextResponse('Settings updated successfully', { status: 200 })
  } catch (error) {
    console.error('Error updating settings:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
