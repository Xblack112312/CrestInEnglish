import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ConnectToDatabase from "@/lib/database";
import Enrollment from "@/models/Enrollment";

export async function GET() {
  try {
    await ConnectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const enrollments = await Enrollment.find()
      .populate("user", "fullName email")
      .populate("course", "title price")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        enrollments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin enrollments error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
