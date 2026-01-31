import ConnectToDatabase from "@/lib/database";
import Course from "@/models/Course";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing Required Fields." },
        { status: 400 },
      );
    }

    await ConnectToDatabase();

    const course = await Course.findById(id).select("-videos");

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course Not found, Please try again" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, course }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 502 },
    );
  }
}
