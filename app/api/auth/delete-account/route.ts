import { authOptions } from "@/lib/auth";
import ConnectToDatabase from "@/lib/database";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import argon2 from "argon2";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Missing Required Fields." },
        { status: 400 },
      );
    }

    await ConnectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session || !session?.user?.id) {
      return NextResponse?.json(
        { success: false, message: "Unauthroized" },
        { status: 401 },
      );
    }

    const user = await User.findById(session?.user?.id);
    if (!user) {
      return NextResponse.json(
        { success: false, messsage: "User Not Found" },
        { status: 404 },
      );
    }

    //verify password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect Password." },
        { status: 403 },
      );
    }

    // OPTIONAL: Delete related data
    // await SomeModel.deleteMany({ userId: user._id });

    await user.deleteOne();

    return NextResponse.json(
      { success: true, message: "Account Deleted Successfully." },
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
