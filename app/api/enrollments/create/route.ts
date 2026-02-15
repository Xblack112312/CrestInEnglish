import LinearLoginCodeEmail from "@/emails/NewPhurase";
import NikeReceiptEmail from "@/emails/ReceiptEmail";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import ConnectToDatabase from "@/lib/database";
import { resend } from "@/lib/email";
import Enrollment from "@/models/Enrollment";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await ConnectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthroized." },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    const file = formData.get("paymentProof") as File | null;
    const courseId = formData.get("courseId") as string;
    const phone = formData.get("phone") as string;

    if (!file || !courseId || !phone) {
      return NextResponse.json(
        { success: false, message: "Missing Required fields." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // upload in cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "payment-proofs" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    const email = session?.user?.email as string;

    const enrollment = await Enrollment.create({
      user: session?.user?.id,
      course: courseId,
      phone,
      paymentProof: uploadResult.secure_url,
      status: "pending",
      userId: session?.user?.id,
    });

    const randomText = Math.random();

    const orderId = enrollment?._id
      ? enrollment._id.toString()
      : String(randomText);
    const orderdate = enrollment?.createdAt
      ? new Date(enrollment.createdAt).toISOString()
      : new Date().toISOString();

    await resend.emails.send({
      from: "CrestSupport <no-reply@crestinenglish.online>",
      to: email,
      subject: "Thank you for your enrollation from crest in english.",
      react: NikeReceiptEmail({
        orderId, // string
        orderdate, // string
      }),
    });

    await resend.emails.send({
      from: "CrestSupport <no-reply@crestinenglish.online>",
      to: ["moabedd05@gmail.com"],
      subject: "[#] New Enrollment from crest in english, Please Take Action.",
      react: LinearLoginCodeEmail({
        validationCode: orderId, // string (NOT ObjectId)
      }),
    });

    return NextResponse.json(
      {
        success: true,
        enrollment,
        message: "Enrollment submitted for verification.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 502 },
    );
  }
}
