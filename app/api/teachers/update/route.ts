import { authOptions } from "@/lib/auth";
import ConnectToDatabase from "@/lib/database";
import Teacher from "@/models/Teacher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role === "user") {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id, name, jobtitle, description } = await request.json();

    if (!id || !name || !jobtitle || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    await ConnectToDatabase();

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      {
        name,
        job: jobtitle,
        description,
      },
      { new: true }
    );

    if (!updatedTeacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Teacher updated successfully.",
        teacher: updatedTeacher,
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
