import { NextResponse } from "next/server";
import ConnectToDatabase from "@/lib/database";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    await ConnectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Upgrade logic: user -> teacher -> admin
    if (user.role === "user") user.role = "teacher";
    else if (user.role === "teacher") user.role = "admin";
    else if (user.role = "admin") user.role = "user"; // if already admin, stays admin

    await user.save();

    return NextResponse.json({
      success: true,
      message: `User role upgraded to ${user.role}`,
      user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
