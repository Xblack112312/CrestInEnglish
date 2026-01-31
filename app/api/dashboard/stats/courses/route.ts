import ConnectToDatabase from "@/lib/database";
import Course from "@/models/Course";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ConnectToDatabase();

    const total = await Course.countDocuments({ isPublished: true });
    const totalAll = await Course.countDocuments();

    return NextResponse.json(
      { success: true, total, totalAll },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching course stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
