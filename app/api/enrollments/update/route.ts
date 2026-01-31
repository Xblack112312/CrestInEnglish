// /app/api/admin/enrollments/update/route.ts
import ConnectToDatabase from "@/lib/database";
import Enrollment from "@/models/Enrollment";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await ConnectToDatabase();

    const { enrollmentId, status } = await request.json();

    if (!enrollmentId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status value." },
        { status: 400 }
      );
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: "Enrollment not found." },
        { status: 404 }
      );
    }

    enrollment.status = status as "approved" | "rejected";
    await enrollment.save();

    return NextResponse.json(
      { success: true, message: `Enrollment ${status} successfully.` },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
