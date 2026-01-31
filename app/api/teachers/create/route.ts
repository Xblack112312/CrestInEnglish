import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import ConnectToDatabase from "@/lib/database";
import Teacher from "@/models/Teacher";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string;
    const jobtitle = formData.get("jobtitle") as string;
    const description = formData.get("description") as string;

    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role === "user") {
      return NextResponse.json({
        success: false,
        message: "Unauthroized."
      }, {
        status: 401
      })
    }

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 },
      );
    }

    if (!name || !jobtitle || !description) {
      return NextResponse.json(
        { success: false, message: "Missing Required Fields." },
        { status: 400 },
      );
    }

    await ConnectToDatabase();

    // convert file > buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // upload using stream (cloudinary)
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "uploads",
            resource_type: "image",
          },
          (error, results) => {
            if (error) reject(error);
            else resolve(results);
          },
        )
        .end(buffer);
    });

    await Teacher.create({
      name,
      avatar: uploadResult.secure_url,
      job: jobtitle,
      description: description,
    });

    return NextResponse.json(
      { success: true, message: "Teacher Added Successfully." },
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
