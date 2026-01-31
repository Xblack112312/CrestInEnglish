import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ConnectToDatabase from "@/lib/database";
import User from "@/models/User";
import argon2 from "argon2";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) 
      return NextResponse.json({ success: false, message: "Required fields missing" }, { status: 400 });

    await ConnectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) 
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user = await User.findById(session.user.id);
    if (!user) 
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const valid = await argon2.verify(user.password, currentPassword);
    if (!valid) 
      return NextResponse.json({ success: false, message: "Incorrect current password" }, { status: 403 });

    // Update password
    user.password = await argon2.hash(newPassword); // must await
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
