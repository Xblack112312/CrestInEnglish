import ConnectToDatabase from "@/lib/database";
import User from "@/models/User";
import { NextResponse } from "next/server";
import argon2 from "argon2";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Missing Required fields." },
        { status: 400 },
      );
    }

    await ConnectToDatabase();

    const users = await User.find({
      resetPasswordExpires: { $gt: new Date() },
    });

    const user = await Promise.any(
      users.map(async (u) => {
        if (
          u.resetPasswordToken &&
          (await argon2.verify(u.resetPasswordToken, token))
        ) {
          return u;
        }
        throw new Error();
      }),
    ).catch(() => null);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 },
      );
    }

    user.password = await argon2.hash(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error." },
      { status: 502 },
    );
  }
}
