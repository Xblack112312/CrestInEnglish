import ConnectToDatabase from "@/lib/database";
import User from "@/models/User";
import { NextResponse } from "next/server";
import argon2 from "argon2";

export async function POST(request: Request) {
  try {
    const { fullName, email, password, grade, education } =
      await request.json();

    if (!fullName || !email || !password || !grade || !education) {
      return NextResponse.json(
        { success: false, message: "Missing Required Fields." },
        { status: 402 },
      );
    }

    await ConnectToDatabase();

    const UserExist = await User.findOne({ email: email });
    if (UserExist) {
      return NextResponse.json(
        { success: false, message: "Account is Already Exists" },
        { status: 422 },
      );
    }

    const hashedPassword = await argon2.hash(password);

    await User.create({
      fullName: fullName,
      email,
      password: hashedPassword,
      grade,
      education,
      role: "user",
    });

    return NextResponse.json(
      { success: true, message: "Account Created." },
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
