"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  Video,
  FileText,
  HelpCircle,
  CheckCircle,
  Circle,
  Menu,
  X,
} from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), {
  ssr: false,
  loading: () => <div className="p-10 text-center text-gray-500">Loading PDF...</div>,
});
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

type LessonType = "video" | "pdf" | "quiz";
type QuizOption = { id: string; text: string; correct: boolean };
type Lesson = {
  _id: string;
  type: LessonType;
  title: string;
  url?: string;
  quiz?: { question: string; options: QuizOption[] }[];
};
type Course = { title: string; description: string; lessons: Lesson[] };
type Progress = Record<string, { completed: boolean; videoTime?: number; quizScore?: number }>;

const CourseContentPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfNumPages, setPdfNumPages] = useState(0);
  const [progress, setProgress] = useState<Progress>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // PDF worker setup
  useEffect(() => {
    const setupWorker = async () => {
      const { pdfjs } = await import("react-pdf");
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    };
    setupWorker();
  }, []);

  // Fetch course content
  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/courses/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      if (data.course && Array.isArray(data.course.lessons)) {
        setCourse(data.course);
        if (data.course.lessons.length > 0) setCurrentLesson(data.course.lessons[0]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load course content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchCourseContent(); }, [id]);

  if (loading) return <div className="py-32 text-center text-gray-500">Loading course content...</div>;
  if (!course) return <div className="py-32 text-center text-gray-500">Course not found or not enrolled.</div>;

  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto py-20 px-4 md:px-6 gap-6">
      {/* Mobile Hamburger */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">{course.title}</h2>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-40 w-72 md:w-72 h-full md:h-auto bg-white shadow-xl md:shadow-none
          transform md:translate-x-0 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        `}
      >
        <div className="flex justify-between items-center p-4 border-b md:border-none">
          <h2 className="font-semibold text-lg md:text-base">Lessons</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto h-full">
          {course.lessons.map((lesson) => (
            <button
              key={lesson._id}
              onClick={() => { setCurrentLesson(lesson); setPdfPage(1); setSidebarOpen(false); }}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all
                ${currentLesson?._id === lesson._id ? "bg-blue-600 text-white shadow" : "hover:bg-gray-100"}
              `}
            >
              {lesson.type === "video" && <Video size={18} />}
              {lesson.type === "pdf" && <FileText size={18} />}
              {lesson.type === "quiz" && <HelpCircle size={18} />}
              <span className="truncate text-sm font-medium">{lesson.title}</span>
              {progress[lesson._id]?.completed ? (
                <CheckCircle size={16} className="ml-auto text-green-500" />
              ) : (
                <Circle size={16} className="ml-auto text-gray-300" />
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-8 overflow-hidden">
        <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
        <p className="text-gray-600">{course.description}</p>

        {/* Video */}
        {currentLesson?.type === "video" && currentLesson.url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black border border-gray-200">
            <video
              ref={videoRef}
              src={currentLesson.url}
              controls
              className="w-full h-full object-cover"
              onEnded={() =>
                setProgress((p) => ({
                  ...p,
                  [currentLesson._id]: { ...p[currentLesson._id], completed: true },
                }))
              }
            />
          </div>
        )}

        {/* PDF */}
        {currentLesson?.type === "pdf" && currentLesson.url && (
          <div className="border rounded-xl p-4 bg-gray-50 flex flex-col items-center shadow-inner">
            <div className="max-w-full w-full overflow-x-auto border rounded-lg bg-white shadow-md">
              <Document
                file={currentLesson.url}
                onLoadSuccess={({ numPages }) => setPdfNumPages(numPages)}
              >
                <Page
                  pageNumber={pdfPage}
                  width={Math.min(800, typeof window !== "undefined" ? window.innerWidth - 64 : 750)}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center w-full mt-4 gap-2 sm:gap-0">
              <button
                onClick={() => setPdfPage((p) => Math.max(p - 1, 1))}
                disabled={pdfPage === 1}
                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 w-full sm:w-auto hover:bg-gray-100 transition"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-700">
                Page {pdfPage} of {pdfNumPages}
              </span>
              <button
                onClick={() => setPdfPage((p) => Math.min(p + 1, pdfNumPages))}
                disabled={pdfPage === pdfNumPages}
                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 w-full sm:w-auto hover:bg-gray-100 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Quiz */}
        {currentLesson?.type === "quiz" && currentLesson.quiz && (
          <QuizComponent
            lesson={currentLesson}
            onSubmit={(lessonId: any, answers: any) => {
              toast.success("Quiz submitted!");
              setProgress((p) => ({ ...p, [lessonId]: { ...p[lessonId], completed: true } }));
            }}
          />
        )}
      </main>
    </div>
  );
};

const QuizComponent = ({ lesson, onSubmit }: { lesson: Lesson; onSubmit: any }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold">{lesson.title}</h2>
      {lesson.quiz?.map((q, idx) => (
        <div key={idx} className="space-y-3">
          <p className="font-semibold text-gray-700">{q.question}</p>
          <div className="grid gap-3">
            {q.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition
                  ${answers[q.question] === opt.id ? "bg-blue-50 border-blue-400" : "hover:bg-gray-50"}
                `}
              >
                <input
                  type="radio"
                  name={q.question}
                  checked={answers[q.question] === opt.id}
                  onChange={() => setAnswers((p) => ({ ...p, [q.question]: opt.id }))}
                />
                <span className="text-gray-700 font-medium">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={() => onSubmit(lesson._id, answers)}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </div>
  );
};

export default CourseContentPage;
