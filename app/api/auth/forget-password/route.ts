import ConnectToDatabase from "@/lib/database";
import { generateResetToken } from "@/lib/resetToken";
import User from "@/models/User";
import { NextResponse } from "next/server";
import argon2 from "argon2";
import { sendResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email Required." },
        { status: 400 },
      );
    }

    await ConnectToDatabase();
    const user = await User.findOne({ email });

    const username = user?.fullName as string;

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = generateResetToken();
    const tokenHash = await argon2.hash(token);

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendResetEmail(email, username, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 502 },
    );
  }
}
