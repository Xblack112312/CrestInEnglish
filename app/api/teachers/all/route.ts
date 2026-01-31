import { authOptions } from "@/lib/auth";
import ConnectToDatabase from "@/lib/database";
import Teacher from "@/models/Teacher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ConnectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role === "user") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const allTeachers = await Teacher.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        message: "All Teachers",
        allTeachers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
