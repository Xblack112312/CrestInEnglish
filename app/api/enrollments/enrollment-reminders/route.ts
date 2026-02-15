import ConnectToDatabase from "@/lib/database";
import Enrollment from "@/models/Enrollment";
import { resend } from "@/lib/email";
import { NextResponse } from "next/server";
import RenewalReminderEmail from "@/emails/RenewalReminderEmail";

// Use your own email template:

export async function POST(req: Request) {
  try {
    // Protect the endpoint (important)
    const auth = req.headers.get("authorization");
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (!auth || auth !== expected) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await ConnectToDatabase();

    const now = new Date();

    // Find all approved enrollments that are due for reminder and not sent yet
    const dueEnrollments = await Enrollment.find({
      status: "approved",
      reminderSent: false,
      nextReminderAt: { $lte: now },
    })
      .populate("user", "email name") // assumes User has email (and maybe name)
      .limit(200);

    let sent = 0;
    let failed = 0;

    for (const enrollment of dueEnrollments) {
      const userEmail = enrollment?.user?.email;
      if (!userEmail) {
        // Avoid infinite retries if user email is missing
        await Enrollment.updateOne(
          { _id: enrollment._id },
          { $set: { reminderSent: true, reminderSentAt: now } },
        );
        continue;
      }

      try {
        const renewUrl = `${process.env.VERCEL_URL ? process.env.VERCEL_URL : "http://localhost:3000"}/courses/${enrollment.course?.toString?.() ?? ""}`;

        // ✅ Send reminder email
        await resend.emails.send({
          from: "CrestSupport <no-reply@crestinenglish.online>",
          to: userEmail,
          subject: "Reminder: Please renew your subscription",
          react: RenewalReminderEmail({
            userName: enrollment.user?.name,
            courseName: enrollment.course?.title,
            renewUrl: renewUrl,
            subscriptionStartDate:
              enrollment.subscriptionStartAt?.toISOString(),
          }),
        });

        // ✅ Mark as sent so it doesn't send again
        await Enrollment.updateOne(
          { _id: enrollment._id },
          { $set: { reminderSent: true, reminderSentAt: now } },
        );

        sent++;
      } catch (e) {
        console.error(
          "Failed sending reminder for enrollment:",
          enrollment._id,
          e,
        );
        failed++;
        // Do NOT mark as sent, so it can retry on next cron run
      }
    }

    return NextResponse.json(
      { success: true, due: dueEnrollments.length, sent, failed },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
