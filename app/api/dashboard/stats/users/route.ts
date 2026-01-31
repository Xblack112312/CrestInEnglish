import ConnectToDatabase from "@/lib/database";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ConnectToDatabase();

    const total = await User.countDocuments({ role: "user" });
    
    // Get users created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = await User.countDocuments({
      role: "user",
      createdAt: { $gte: thirtyDaysAgo },
    });

    return NextResponse.json(
      { success: true, total, recent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
