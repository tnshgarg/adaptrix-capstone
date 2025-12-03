import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      return NextResponse.json({
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          username: session.user.username,
          image: session.user.image
        }
      })
    }

    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    )
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    )
  }
}