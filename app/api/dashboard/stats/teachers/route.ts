import ConnectToDatabase from "@/lib/database";
import Teacher from "@/models/Teacher";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ConnectToDatabase();

    const total = await Teacher.countDocuments();

    return NextResponse.json(
      { success: true, total },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
