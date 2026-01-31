import { authOptions } from "@/lib/auth";
import ConnectToDatabase from "@/lib/database";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import argon2 from "argon2";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const { newName, password } = await request?.json();

    if (!newName || !password) {
      return NextResponse.json(
        { success: false, message: "Missing Required Fields." },
        { status: 403 },
      );
    }

    await ConnectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthroized." },
        { status: 401 },
      );
    }

    const userDetails = await User.findById(session?.user?.id);

    if (!userDetails) {
      return NextResponse.json(
        { success: false, message: "User Not Found." },
        { status: 404 },
      );
    }

    const isPasswordValid = await argon2.verify(
      userDetails?.password,
      password,
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect Password" },
        { status: 403 },
      );
    }

    // update name
    userDetails.fullName = newName;
    await userDetails.save();

    // send success response
    return NextResponse.json(
      { success: true, message: "Name Updated." },
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
