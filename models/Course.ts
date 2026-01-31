import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    education: String,
    grade: String,
    price: Number,
    isPublished: Boolean,
    image: String,
    videos: [
      {
        title: String,
        order: Number,
        videoUrl: String,
      },
    ],
    pdfs: [
      {
        title: String,
        order: Number,
        pdfUrl: String,
      },
    ],
    quizzes: [
      {
        title: String,
        questions: [
          {
            question: String,
            options: [String],
            correctAnswer: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
