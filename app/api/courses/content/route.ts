// /app/api/courses/content/route.ts
import ConnectToDatabase from "@/lib/database";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await ConnectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();

    const enrollment = await Enrollment.findOne({
      user: session.user.id,
      course: courseId,
      status: "approved",
    });

    if (!enrollment) {
      return NextResponse.json({ success: false, message: "Access denied." }, { status: 403 });
    }

    const courseDoc = await Course.findById(courseId).lean();
    if (!courseDoc) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    // --- TRANSFORMATION LOGIC ---
    // Merge videos, pdfs, and quizzes into a single 'lessons' array
    const lessons = [
      ...(courseDoc.videos || []).map((v: any) => ({
        _id: v._id,
        type: "video",
        title: v.title,
        url: v.videoUrl,
        order: v.order || 0
      })),
      ...(courseDoc.pdfs || []).map((p: any) => ({
        _id: p._id,
        type: "pdf",
        title: p.title,
        url: p.pdfUrl,
        order: p.order || 0
      })),
      ...(courseDoc.quizzes || []).map((q: any) => ({
        _id: q._id,
        type: "quiz",
        title: q.title,
        quiz: q.questions.map((quest: any) => ({
          question: quest.question,
          options: quest.options.map((opt: string, index: number) => ({
            id: index.toString(),
            text: opt,
            correct: opt === quest.correctAnswer
          }))
        })),
        order: 0
      }))
    ].sort((a, b) => a.order - b.order); // Keep them in order

    const course = {
      ...courseDoc,
      lessons
    };

    return NextResponse.json({ success: true, course }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}