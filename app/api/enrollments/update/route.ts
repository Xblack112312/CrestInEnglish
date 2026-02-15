import ConnectToDatabase from "@/lib/database";
import Enrollment from "@/models/Enrollment";
import { NextResponse } from "next/server";
import { addMonths } from "date-fns";

export async function POST(request: Request) {
  try {
    await ConnectToDatabase();

    const { enrollmentId, status, rejectingreason } = await request.json();

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

    // Prevent double updates
    if (enrollment.status !== "pending") {
      return NextResponse.json(
        { success: false, message: "Enrollment already processed." },
        { status: 409 }
      );
    }

    const now = new Date();

    if (status === "approved") {
      enrollment.status = "approved";
      enrollment.approvedAt = now;
      enrollment.subscriptionStartAt = now;
      enrollment.nextReminderAt = addMonths(now, 1);
      enrollment.reminderSent = false;
      enrollment.reminderSentAt = undefined;
      enrollment.rejectingreason = undefined;
    }

    if (status === "rejected") {
      enrollment.status = "rejected";
      enrollment.rejectingreason = rejectingreason ?? "Rejected by admin";

      // HARD STOP: ensure no reminders ever fire
      enrollment.approvedAt = undefined;
      enrollment.subscriptionStartAt = undefined;
      enrollment.nextReminderAt = undefined;
      enrollment.reminderSent = false;
      enrollment.reminderSentAt = undefined;
    }

    await enrollment.save();

    return NextResponse.json(
      {
        success: true,
        message: `Enrollment ${status} successfully.`,
      },
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
