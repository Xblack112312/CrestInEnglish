import { NextResponse } from "next/server";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary";
import ConnectToDatabase from "@/lib/database";
import Course from "@/models/Course";

export const runtime = "nodejs"; // Use Node runtime to avoid serverless timeout
export const maxDuration = 120; // max 2 minutes

/* ========== HELPER: CLOUDINARY UPLOAD ========== */
const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resource_type: "image" | "video" | "raw",
) => {
  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};

/* ========== POST CREATE COURSE ========== */
export async function POST(req: Request) {
  try {
    await ConnectToDatabase();

    const formData = await req.formData();

    /* ===== BASIC FIELDS ===== */
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const teacherId = formData.get("teacher") as string; // MUST be ObjectId
    const education = formData.get("education") as "General" | "Azher";
    const grade = formData.get("grade") as
      | "Grade 9"
      | "Grade 10"
      | "Grade 11"
      | "Grade 12";
    const price = Number(formData.get("price"));
    const isPublished = formData.get("isPublished") === "true";

    if (!title || !description || !teacherId || !price) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    /* ===== IMAGE ===== */
    const imageFile = formData.get("image") as File;
    if (!imageFile) {
      return NextResponse.json({ message: "Image required" }, { status: 400 });
    }
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const imageUpload = await uploadToCloudinary(
      imageBuffer,
      "courses/images",
      "image",
    );

    /* ===== VIDEOS ===== */
    const videos: any[] = [];
    let videoIndex = 0;
    while (formData.get(`videos[${videoIndex}][title]`)) {
      const title = formData.get(`videos[${videoIndex}][title]`) as string;
      const order = Number(formData.get(`videos[${videoIndex}][order]`));
      const file = formData.get(`videos[${videoIndex}][file]`) as File | null;

      let videoUrl = "";
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const upload = await uploadToCloudinary(
          buffer,
          "courses/videos",
          "video",
        );
        videoUrl = upload.secure_url;
      }

      videos.push({ title, order, videoUrl });
      videoIndex++;
    }

    /* ===== PDFs ===== */
    const pdfs: any[] = [];
    let pdfIndex = 0;
    while (formData.get(`pdfs[${pdfIndex}][title]`)) {
      const title = formData.get(`pdfs[${pdfIndex}][title]`) as string;
      const order = Number(formData.get(`pdfs[${pdfIndex}][order]`));
      const file = formData.get(`pdfs[${pdfIndex}][file]`) as File | null;

      let pdfUrl = "";
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const upload = await uploadToCloudinary(buffer, "courses/pdfs", "raw");
        pdfUrl = upload.secure_url;
      }

      pdfs.push({ title, order, pdfUrl });
      pdfIndex++;
    }

    /* ===== QUIZZES ===== */
    const quizzes = JSON.parse((formData.get("quizzes") as string) || "[]");

    /* ===== SAVE COURSE ===== */
    const course = await Course.create({
      title,
      description,
      teacher: new mongoose.Types.ObjectId(teacherId), // convert to ObjectId
      education,
      grade,
      price,
      isPublished,
      image: imageUpload.secure_url,
      videos,
      pdfs,
      quizzes,
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as any).message },
      { status: 500 },
    );
  }
}
