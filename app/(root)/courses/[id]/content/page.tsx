"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Video,
  FileText,
  HelpCircle,
  CheckCircle,
  Circle,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Check,
  ExternalLink,
  Download,
} from "lucide-react";

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

type Progress = Record<
  string,
  { completed: boolean; videoTime?: number; quizScore?: number }
>;

type QuizResult = {
  total: number;
  correct: number;
  percent: number;
  details: {
    question: string;
    selectedOptionId?: string;
    correctOptionId: string;
    isCorrect: boolean;
    options: { id: string; text: string }[];
  }[];
};

const CourseContentPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  // progress
  const [progress, setProgress] = useState<Progress>({});

  // UI
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quiz results per lesson
  const [quizResults, setQuizResults] = useState<Record<string, QuizResult>>(
    {},
  );
  const [showQuizResult, setShowQuizResult] = useState(false);

  // PDF (native)
  const [pdfPage, setPdfPage] = useState(1);

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
        if (data.course.lessons.length > 0) {
          setCurrentLesson(data.course.lessons[0]);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load course content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCourseContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Derived
  const lessonIndex = useMemo(() => {
    if (!course || !currentLesson) return -1;
    return course.lessons.findIndex((l) => l._id === currentLesson._id);
  }, [course, currentLesson]);

  const totalLessons = course?.lessons?.length || 0;

  const completedCount = useMemo(() => {
    if (!course) return 0;
    return course.lessons.reduce(
      (acc, l) => acc + (progress[l._id]?.completed ? 1 : 0),
      0,
    );
  }, [course, progress]);

  const completionPercent = useMemo(() => {
    if (!totalLessons) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  }, [completedCount, totalLessons]);

  const goToLessonByOffset = (offset: number) => {
    if (!course || lessonIndex === -1) return;
    const next = course.lessons[lessonIndex + offset];
    if (!next) return;
    setShowQuizResult(false);
    setCurrentLesson(next);
    setPdfPage(1);
    setSidebarOpen(false);
  };

  const onSelectLesson = (lesson: Lesson) => {
    setShowQuizResult(false);
    setCurrentLesson(lesson);
    setPdfPage(1);
    setSidebarOpen(false);
  };

  const markCompleted = () => {
    if (!currentLesson) return;
    setProgress((p) => ({
      ...p,
      [currentLesson._id]: { ...p[currentLesson._id], completed: true },
    }));
    toast.success("Marked as completed");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="h-6 w-56 animate-pulse rounded bg-neutral-200" />
          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="h-[520px] animate-pulse rounded-3xl border bg-neutral-100" />
            </div>
            <div className="lg:col-span-8 space-y-4">
              <div className="h-10 w-3/4 animate-pulse rounded bg-neutral-200" />
              <div className="h-5 w-full animate-pulse rounded bg-neutral-200" />
              <div className="h-5 w-11/12 animate-pulse rounded bg-neutral-200" />
              <div className="h-[360px] animate-pulse rounded-3xl border bg-neutral-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-[70vh] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 md:px-6">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <p className="text-lg font-semibold text-neutral-900">
              Course not found or not enrolled
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              You may need to enroll to access the content.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => router.back()}
                className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
              >
                Go back
              </button>
              <button
                onClick={() => router.push(`/courses/${id}`)}
                className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                View course details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const IconForLesson = ({ type }: { type: LessonType }) => {
    if (type === "video") return <Video className="h-4 w-4" />;
    if (type === "pdf") return <FileText className="h-4 w-4" />;
    return <HelpCircle className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm hover:bg-neutral-50"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                  Course
                </span>
                <span className="truncate">{course.title}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold text-neutral-900">
                  {currentLesson.title}
                </h1>
                <span className="hidden text-xs text-neutral-500 sm:inline">
                  • Lesson {lessonIndex + 1} / {totalLessons}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* progress */}
            <div className="hidden items-center gap-3 rounded-2xl border bg-white px-3 py-2 shadow-sm sm:flex">
              <div className="text-xs font-medium text-neutral-600">
                {completionPercent}% complete
              </div>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-neutral-900"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            {/* mobile menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm hover:bg-neutral-50 md:hidden"
              aria-label="Open lessons"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:col-span-4 lg:block">
            <LessonsPanel
              course={course}
              currentLessonId={currentLesson._id}
              progress={progress}
              quizResults={quizResults}
              onSelect={onSelectLesson}
            />
          </aside>

          {/* Main */}
          <main className="lg:col-span-8 space-y-6">
            {/* Mobile quick progress */}
            <div className="sm:hidden rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-neutral-900">
                  Progress
                </div>
                <div className="text-xs font-medium text-neutral-600">
                  {completedCount}/{totalLessons}
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-neutral-900"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            {/* Lesson header card */}
            <section className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                    <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 shadow-sm">
                      <IconForLesson type={currentLesson.type} />
                      <span className="capitalize">{currentLesson.type}</span>
                    </span>

                    {progress[currentLesson._id]?.completed ? (
                      <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold text-neutral-900">
                        <Check className="h-3.5 w-3.5" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold text-neutral-600">
                        <Circle className="h-3.5 w-3.5" />
                        Not completed
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 truncate text-2xl font-semibold text-neutral-900">
                    {currentLesson.title}
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {course.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => goToLessonByOffset(-1)}
                    disabled={lessonIndex <= 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => goToLessonByOffset(1)}
                    disabled={lessonIndex >= totalLessons - 1}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Lesson content */}
            <section className="rounded-3xl border bg-white p-5 shadow-sm">
              {currentLesson.type === "video" && currentLesson.url && (
                <CustomVideoPlayer
                  src={currentLesson.url}
                  title={currentLesson.title}
                  onEnded={() =>
                    setProgress((p) => ({
                      ...p,
                      [currentLesson._id]: {
                        ...p[currentLesson._id],
                        completed: true,
                      },
                    }))
                  }
                  onTimeUpdate={(t) =>
                    setProgress((p) => ({
                      ...p,
                      [currentLesson._id]: {
                        ...p[currentLesson._id],
                        videoTime: t,
                      },
                    }))
                  }
                />
              )}

              {currentLesson.type === "pdf" && currentLesson.url && (
                <NativePdfViewer
                  url={currentLesson.url}
                  page={pdfPage}
                  setPage={setPdfPage}
                  onMarkDone={() =>
                    setProgress((p) => ({
                      ...p,
                      [currentLesson._id]: {
                        ...p[currentLesson._id],
                        completed: true,
                      },
                    }))
                  }
                />
              )}

              {currentLesson.type === "quiz" && currentLesson.quiz && (
                <div className="space-y-4">
                  {!showQuizResult ? (
                    <QuizRunner
                      lesson={currentLesson}
                      onFinish={(result) => {
                        setQuizResults((r) => ({
                          ...r,
                          [currentLesson._id]: result,
                        }));
                        setShowQuizResult(true);

                        setProgress((p) => ({
                          ...p,
                          [currentLesson._id]: {
                            ...p[currentLesson._id],
                            completed: true,
                            quizScore: result.percent,
                          },
                        }));
                        toast.success("Quiz submitted!");
                      }}
                    />
                  ) : (
                    <QuizResultView
                      lessonTitle={currentLesson.title}
                      result={quizResults[currentLesson._id]}
                      onRetry={() => setShowQuizResult(false)}
                    />
                  )}
                </div>
              )}

              {/* Manual complete (useful for PDFs) */}
              {!progress[currentLesson._id]?.completed && (
                <div className="mt-6">
                  <button
                    onClick={markCompleted}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark lesson as completed
                  </button>
                  <p className="mt-2 text-center text-xs text-neutral-500">
                    Tip: For PDFs we can’t detect the last page without PDF
                    libraries, so this button keeps it simple.
                  </p>
                </div>
              )}
            </section>

            {/* Bottom navigation */}
            <section className="rounded-3xl border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border bg-white shadow-sm">
                    <IconForLesson type={currentLesson.type} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-neutral-600">
                      Lesson {lessonIndex + 1} of {totalLessons}
                    </div>
                    <div className="truncate text-sm font-semibold text-neutral-900">
                      {currentLesson.title}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => goToLessonByOffset(-1)}
                    disabled={lessonIndex <= 0}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => goToLessonByOffset(1)}
                    disabled={lessonIndex >= totalLessons - 1}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[86%] max-w-sm border-r bg-white shadow-2xl lg:hidden">
            <div className="flex items-center justify-between border-b p-4">
              <div className="text-sm font-semibold text-neutral-900">
                Lessons
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm hover:bg-neutral-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <LessonsPanel
                course={course}
                currentLessonId={currentLesson._id}
                progress={progress}
                quizResults={quizResults}
                onSelect={onSelectLesson}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CourseContentPage;

/* =========================
   Lessons Panel
========================= */

function LessonsPanel({
  course,
  currentLessonId,
  progress,
  quizResults,
  onSelect,
}: {
  course: Course;
  currentLessonId: string;
  progress: Progress;
  quizResults: Record<string, QuizResult>;
  onSelect: (lesson: Lesson) => void;
}) {
  return (
    <div className="rounded-3xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <div className="text-sm font-semibold text-neutral-900">Lessons</div>
        <div className="mt-1 text-xs text-neutral-600">
          Pick where you want to continue.
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto p-3">
        {course.lessons.map((lesson, idx) => {
          const isActive = lesson._id === currentLessonId;
          const done = Boolean(progress[lesson._id]?.completed);
          const score = quizResults[lesson._id]?.percent;

          return (
            <button
              key={lesson._id}
              onClick={() => onSelect(lesson)}
              className={[
                "w-full rounded-2xl border px-3 py-3 text-left transition",
                isActive
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-white hover:bg-neutral-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "grid h-9 w-9 place-items-center rounded-2xl border",
                    isActive
                      ? "border-white/20 bg-white/10"
                      : "border-neutral-200 bg-white",
                  ].join(" ")}
                >
                  {lesson.type === "video" && <Video className="h-4 w-4" />}
                  {lesson.type === "pdf" && <FileText className="h-4 w-4" />}
                  {lesson.type === "quiz" && <HelpCircle className="h-4 w-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={[
                      "text-xs font-medium",
                      isActive ? "text-white/70" : "text-neutral-600",
                    ].join(" ")}
                  >
                    Lesson {idx + 1} • {lesson.type.toUpperCase()}
                  </div>
                  <div className="truncate text-sm font-semibold">
                    {lesson.title}
                  </div>

                  {lesson.type === "quiz" && score != null && (
                    <div
                      className={[
                        "mt-1 text-xs",
                        isActive ? "text-white/70" : "text-neutral-600",
                      ].join(" ")}
                    >
                      Score: <span className="font-semibold">{score}%</span>
                    </div>
                  )}
                </div>

                <div className="ml-2">
                  {done ? (
                    <CheckCircle
                      className={[
                        "h-5 w-5",
                        isActive ? "text-white" : "text-neutral-900",
                      ].join(" ")}
                    />
                  ) : (
                    <Circle className="h-5 w-5 text-neutral-300" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================
   Native PDF Viewer (NO PACKAGES)
   Uses browser PDF renderer via iframe.
   Page navigation via #page= (best-effort).
========================= */

function NativePdfViewer({
  url,
  page,
  setPage,
  onMarkDone,
}: {
  url: string;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onMarkDone: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const srcWithPage = useMemo(() => {
    // best-effort navigation for Chromium viewers
    const hash = `#page=${page}&view=FitH`;
    return `${url}${url.includes("#") ? "" : hash}`;
  }, [url, page]);

  const openNewTab = () => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-900">
            PDF reader
          </div>
          <div className="text-xs text-neutral-600">
            Page controls are best-effort without PDF libraries.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
          >
            Next
          </button>

          <button
            onClick={openNewTab}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </button>

          <a
            href={url}
            download
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
          >
            <Download className="h-4 w-4" />
            Download
          </a>

          <button
            onClick={onMarkDone}
            className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
          >
            <CheckCircle className="h-4 w-4" />
            Mark done
          </button>
        </div>
      </div>

      <div className="rounded-3xl border bg-neutral-50 p-3">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <div className="text-xs font-medium text-neutral-600">
              Viewing:{" "}
              <span className="font-semibold text-neutral-900">
                Page {page}
              </span>
            </div>
            <button
              onClick={() => {
                // re-render iframe (sometimes helps if browser PDF viewer stuck)
                if (!iframeRef.current) return;
                iframeRef.current.src = srcWithPage;
              }}
              className="rounded-lg border bg-white px-2 py-1 text-xs font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              Refresh
            </button>
          </div>

          <iframe
            ref={iframeRef}
            title="PDF Viewer"
            src={srcWithPage}
            className="h-[70vh] w-full"
          />
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          If page navigation doesn’t work on a device/browser, use{" "}
          <span className="font-semibold">Open</span> and the built-in PDF
          viewer controls.
        </p>
      </div>
    </div>
  );
}

/* =========================
   Custom Video Player (no packages)
========================= */

function CustomVideoPlayer({
  src,
  title,
  onEnded,
  onTimeUpdate,
}: {
  src: string;
  title: string;
  onEnded?: () => void;
  onTimeUpdate?: (t: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);

  const hideTimer = useRef<number | null>(null);

  const formatTime = (sec: number) => {
    if (!Number.isFinite(sec)) return "0:00";
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const syncTime = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrent(v.currentTime || 0);
    onTimeUpdate?.(v.currentTime || 0);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const setVol = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    const clamped = Math.max(0, Math.min(1, val));
    v.volume = clamped;
    setVolume(clamped);
    if (clamped === 0) {
      v.muted = true;
      setMuted(true);
    } else {
      v.muted = false;
      setMuted(false);
    }
  };

  const seekTo = (time: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(duration) || duration <= 0) return;
    v.currentTime = Math.max(0, Math.min(duration, time));
    setCurrent(v.currentTime);
  };

  const rewind10 = () => seekTo(current - 10);

  const onProgressPointer = (clientX: number) => {
    const bar = document.getElementById("video-progress-bar");
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    seekTo(ratio * duration);
  };

  const requestFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onFsChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === " " || e.key === "k") {
      e.preventDefault();
      togglePlay();
    }
    if (e.key === "m") toggleMute();
    if (e.key === "f") requestFullscreen();
    if (e.key === "ArrowLeft") seekTo(current - 5);
    if (e.key === "ArrowRight") seekTo(current + 5);
  };

  const bumpControls = () => {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!scrubbing && playing) setShowControls(false);
    }, 1800);
  };

  useEffect(() => {
    bumpControls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-neutral-900">Video</div>
          <div className="truncate text-xs text-neutral-600">{title}</div>
        </div>
        <div className="text-xs font-medium text-neutral-600">
          {formatTime(current)} / {formatTime(duration)}
        </div>
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseMove={bumpControls}
        onMouseEnter={bumpControls}
        className="group relative overflow-hidden rounded-3xl border bg-black shadow-sm outline-none"
        aria-label="Video player"
      >
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full"
          onLoadedMetadata={() => {
            const v = videoRef.current;
            if (!v) return;
            setDuration(v.duration || 0);
            setReady(true);
            v.volume = volume;
            v.muted = muted;
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={syncTime}
          onEnded={() => {
            setPlaying(false);
            setShowControls(true);
            onEnded?.();
          }}
          controls={false}
        />

        {!playing && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 grid place-items-center"
            aria-label="Play"
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/20 transition group-hover:scale-105">
              <Play className="h-7 w-7 text-white" />
            </div>
          </button>
        )}

        <div
          className={[
            "absolute inset-x-0 bottom-0 p-3 transition-opacity",
            showControls ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          <div className="rounded-2xl bg-black/50 backdrop-blur-sm ring-1 ring-white/10">
            <div className="px-3 pt-3">
              <div
                id="video-progress-bar"
                className="relative h-2 w-full cursor-pointer rounded-full bg-white/20"
                onMouseDown={(e) => {
                  setScrubbing(true);
                  onProgressPointer(e.clientX);
                }}
                onMouseMove={(e) => {
                  if (!scrubbing) return;
                  onProgressPointer(e.clientX);
                }}
                onMouseUp={() => setScrubbing(false)}
                onMouseLeave={() => setScrubbing(false)}
                onTouchStart={(e) => {
                  setScrubbing(true);
                  onProgressPointer(e.touches[0].clientX);
                }}
                onTouchMove={(e) => {
                  if (!scrubbing) return;
                  onProgressPointer(e.touches[0].clientX);
                }}
                onTouchEnd={() => setScrubbing(false)}
              >
                <div
                  className="absolute left-0 top-0 h-2 rounded-full bg-white"
                  style={{
                    width:
                      duration > 0
                        ? `${Math.min(100, (current / duration) * 100)}%`
                        : "0%",
                  }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow"
                  style={{
                    left:
                      duration > 0
                        ? `calc(${Math.min(100, (current / duration) * 100)}% - 6px)`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/15"
                  aria-label={playing ? "Pause" : "Play"}
                  disabled={!ready}
                >
                  {playing ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={rewind10}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/15"
                  aria-label="Rewind 10 seconds"
                  disabled={!ready}
                >
                  <RotateCcw className="h-5 w-5" />
                </button>

                <button
                  onClick={toggleMute}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/15"
                  aria-label={muted ? "Unmute" : "Mute"}
                  disabled={!ready}
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={(e) => setVol(Number(e.target.value))}
                  className="h-2 w-28 cursor-pointer accent-white"
                  aria-label="Volume"
                  disabled={!ready}
                />
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="text-xs font-medium text-white/80">
                  <span className="hidden sm:inline">Shortcuts:</span>{" "}
                  <span className="font-semibold">Space</span> play,{" "}
                  <span className="font-semibold">F</span> fullscreen
                </div>

                <button
                  onClick={requestFullscreen}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/15"
                  aria-label="Fullscreen"
                  disabled={!ready}
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {!ready && (
          <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/10">
            Loading…
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================
   Quiz Runner + Result Page
========================= */

function QuizRunner({
  lesson,
  onFinish,
}: {
  lesson: Lesson;
  onFinish: (result: QuizResult) => void;
}) {
  const questions = lesson.quiz || [];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);

  useEffect(() => {
    setAnswers({});
    setStep(0);
  }, [lesson._id]);

  const current = questions[step];
  const total = questions.length;
  const progressPct = total ? Math.round(((step + 1) / total) * 100) : 0;

  const selected = current ? answers[current.question] : undefined;

  const setAnswer = (question: string, optionId: string) => {
    setAnswers((p) => ({ ...p, [question]: optionId }));
  };

  const computeResult = (): QuizResult => {
    const details = questions.map((q) => {
      const correctOpt = q.options.find((o) => o.correct);
      const correctOptionId = correctOpt?.id || "";
      const selectedOptionId = answers[q.question];
      const isCorrect =
        selectedOptionId && selectedOptionId === correctOptionId;

      return {
        question: q.question,
        selectedOptionId,
        correctOptionId,
        isCorrect: Boolean(isCorrect),
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
      };
    });

    const correct = details.reduce((acc, d) => acc + (d.isCorrect ? 1 : 0), 0);
    const percent = total ? Math.round((correct / total) * 100) : 0;

    return { total, correct, percent, details };
  };

  if (!questions.length) {
    return (
      <div className="rounded-3xl border bg-white p-6">
        <div className="text-sm font-semibold text-neutral-900">Quiz</div>
        <div className="mt-1 text-sm text-neutral-600">No questions found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-900">Quiz</div>
            <div className="mt-1 text-xs text-neutral-600">
              Question {step + 1} of {total}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-neutral-900">
              {progressPct}%
            </div>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-neutral-900"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="text-xs font-medium text-neutral-600">
          Select one answer
        </div>
        <h3 className="mt-2 text-xl font-semibold text-neutral-900">
          {current.question}
        </h3>

        <div className="mt-5 grid gap-3">
          {current.options.map((opt, i) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAnswer(current.question, opt.id)}
                className={[
                  "w-full rounded-2xl border px-4 py-4 text-left transition",
                  isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white hover:bg-neutral-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "grid h-7 w-7 place-items-center rounded-full border",
                      isSelected
                        ? "border-white/30 bg-white/10"
                        : "border-neutral-300 bg-white",
                    ].join(" ")}
                  >
                    {isSelected ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-semibold text-neutral-500">
                        {String.fromCharCode(65 + i)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold">{opt.text}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {step < total - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              disabled={!selected}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => onFinish(computeResult())}
              disabled={!selected}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit quiz
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-5">
        <div className="text-sm font-semibold text-neutral-900">Overview</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const answered = Boolean(answers[q.question]);
            const isCurrent = idx === step;
            return (
              <button
                key={q.question}
                onClick={() => setStep(idx)}
                className={[
                  "h-9 w-9 rounded-xl border text-xs font-semibold transition",
                  isCurrent
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : answered
                      ? "border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50"
                      : "border-neutral-200 bg-white text-neutral-400 hover:bg-neutral-50",
                ].join(" ")}
                aria-label={`Go to question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-neutral-600">
          Answered{" "}
          <span className="font-semibold text-neutral-900">
            {Object.keys(answers).length}
          </span>{" "}
          / {total}
        </div>
      </div>
    </div>
  );
}

function QuizResultView({
  lessonTitle,
  result,
  onRetry,
}: {
  lessonTitle: string;
  result?: QuizResult;
  onRetry: () => void;
}) {
  if (!result) {
    return (
      <div className="rounded-3xl border bg-white p-6">
        <div className="text-sm font-semibold text-neutral-900">Results</div>
        <div className="mt-1 text-sm text-neutral-600">No result found.</div>
      </div>
    );
  }

  const rating =
    result.percent >= 85
      ? "Excellent"
      : result.percent >= 65
        ? "Good"
        : "Keep going";

  const subtitle =
    result.percent >= 85
      ? "You’re doing great — keep the momentum."
      : result.percent >= 65
        ? "Nice work. Review the missed questions to improve."
        : "Review the explanations and try again.";

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-medium text-neutral-600">
              Quiz results
            </div>
            <div className="mt-1 truncate text-xl font-semibold text-neutral-900">
              {lessonTitle}
            </div>
            <div className="mt-2 text-sm text-neutral-600">{subtitle}</div>
          </div>

          <div className="rounded-3xl border bg-neutral-50 p-4">
            <div className="text-xs font-medium text-neutral-600">Score</div>
            <div className="mt-1 text-3xl font-semibold text-neutral-900">
              {result.percent}%
            </div>
            <div className="mt-1 text-sm font-semibold text-neutral-900">
              {rating}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label="Correct" value={`${result.correct}`} />
          <Stat label="Total" value={`${result.total}`} />
          <Stat
            label="Accuracy"
            value={`${result.total ? Math.round((result.correct / result.total) * 100) : 0}%`}
          />
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
          >
            Retry quiz
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-neutral-900">Review</div>
        <div className="mt-1 text-xs text-neutral-600">
          See what you chose vs the correct answer.
        </div>

        <div className="mt-5 space-y-4">
          {result.details.map((d, idx) => {
            const selectedText = d.selectedOptionId
              ? d.options.find((o) => o.id === d.selectedOptionId)?.text
              : undefined;
            const correctText = d.options.find(
              (o) => o.id === d.correctOptionId,
            )?.text;

            return (
              <div
                key={idx}
                className={[
                  "rounded-2xl border p-4",
                  d.isCorrect
                    ? "border-neutral-900 bg-white"
                    : "border-neutral-200 bg-neutral-50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-neutral-600">
                      Question {idx + 1}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-neutral-900">
                      {d.question}
                    </div>
                  </div>
                  <div
                    know-nothing=""
                    className={[
                      "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold",
                      d.isCorrect
                        ? "border-neutral-900 text-neutral-900"
                        : "border-neutral-300 text-neutral-700",
                    ].join(" ")}
                  >
                    {d.isCorrect ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Correct
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        Incorrect
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <div className="rounded-xl border bg-white p-3">
                    <div className="text-xs font-medium text-neutral-600">
                      Your answer
                    </div>
                    <div className="mt-1 text-sm font-semibold text-neutral-900">
                      {selectedText || "No answer"}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-white p-3">
                    <div className="text-xs font-medium text-neutral-600">
                      Correct answer
                    </div>
                    <div className="mt-1 text-sm font-semibold text-neutral-900">
                      {correctText || "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs font-medium text-neutral-600">{label}</div>
      <div className="mt-1 text-xl font-semibold text-neutral-900">{value}</div>
    </div>
  );
}
