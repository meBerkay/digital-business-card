import { NextResponse } from "next/server"
import { requireAdmin, getAdminStats } from "@/lib/admin"

export async function GET() {
  try {
    await requireAdmin()
    
    const stats = await getAdminStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}



