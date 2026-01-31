import ConnectToDatabase from "@/lib/database";
import Course from "@/models/Course";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        
        await ConnectToDatabase();

        const allcourses = await Course.find({});

        return NextResponse.json({ success: true, allcourses }, { status: 201 })
        
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: "Internal Server Error." }, { status: 502 });
    }
}