import { authOptions } from "@/lib/auth";
import ConnectToDatabase from "@/lib/database";
import Enrollment from "@/models/Enrollment";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthroized." },
        { status: 401 },
      );
    }

    await ConnectToDatabase();

    const { courseId } = await request?.json();

    if (!courseId || !Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, message: "Missing Required Fields." },
        { status: 400 },
      );
    }

    const userId = (session?.user as any).id || (session.user as any)._id;
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user session" },
        { status: 400 },
      );
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    }).select("status createdAt");

    // Not enrolled -> UI should show enroll CTA
    if (!enrollment) {
      return NextResponse.json(
        {
          success: true,
          enrolled: false,
          pending: false,
          shouldEnroll: true,
          message: "User is not enrolled in this course",
        },
        { status: 200 },
      );
    }

    const status = enrollment?.status || "pending";
    const isApproved = status === "approved" || status === "active";
    const isPending = status === "pending";

    return NextResponse.json(
      {
        success: true,
        enrolled: isApproved,
        pending: isPending,
        shouldEnroll: !isApproved, // pending users should not re-enroll; just wait
        status,
        enrollmentId: String(enrollment._id),
        createdAt: enrollment.createdAt,
        message: isApproved
          ? "User is enrolled."
          : isPending
            ? "Enrollment is pending approval."
            : "Enrollment exists but is not active.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 502 },
    );
  }
}
