import { authOptions } from "@/lib/auth";
import ConnectToDatabase from "@/lib/database";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(reuqest: Request) {
    try {
        
        const session = await getServerSession(authOptions);

        if (!session || session?.user?.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthroized" }, { status: 401 })
        }

        await ConnectToDatabase();

        const users = await User.find({}).select("-password");

        if (!users) {
            return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
        };

        return NextResponse.json({ success: true, users }, { status: 201 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 502 })
    }
}