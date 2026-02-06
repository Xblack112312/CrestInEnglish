"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronRight, LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ================= TYPES ================= */

interface VideoInput {
  title: string;
  file?: File;
  order: number;
}

interface PDFInput {
  title: string;
  file?: File;
  order: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

interface CourseForm {
  title: string;
  description: string;
  teacher: string;
  education: "General" | "Azher";
  grade: "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12";
  price: number;
  isPublished: boolean;
  videos: VideoInput[];
  pdfs: PDFInput[];
  quizzes: Quiz[];
}

interface Teacher {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  teacherName: string;
  education: string;
  grade: string;
  price: number;
}

/* ================= COMPONENT ================= */

export default function Page() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState<CourseForm>({
    title: "",
    description: "",
    teacher: "",
    education: "General",
    grade: "Grade 9",
    price: 0,
    isPublished: false,
    videos: [],
    pdfs: [],
    quizzes: [],
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    getAllTeachers();
    getAllCourses();
  }, []);

  const getAllTeachers = async () => {
    try {
      const res = await fetch("/api/teachers/all");
      const data = await res.json();
      setTeachers(data.allTeachers);
    } catch {
      toast.error("Failed to load teachers");
    }
  };

  const getAllCourses = async () => {
    try {
      const res = await fetch("/api/courses/all");
      const data = await res.json();
      setCourses(data.allcourses);
    } catch {
      toast.error("Failed to load courses");
    }
  };

  /* ================= HELPERS ================= */

  const addVideo = () =>
    setForm((p) => ({
      ...p,
      videos: [...p.videos, { title: "", order: p.videos.length + 1 }],
    }));

  const addPDF = () =>
    setForm((p) => ({
      ...p,
      pdfs: [...p.pdfs, { title: "", order: p.pdfs.length + 1 }],
    }));

  const addQuiz = () =>
    setForm((p) => ({
      ...p,
      quizzes: [...p.quizzes, { title: "", questions: [] }],
    }));

  const addQuestion = (qi: number) =>
    setForm((p) => {
      const quizzes = [...p.quizzes];
      quizzes[qi].questions.push({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      });
      return { ...p, quizzes };
    });

  /* ================= SUBMIT ================= */

  const DeleteCourse = async (id: string) => {
    try {
      const response = await fetch("/api/courses/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response?.json();

      if (data?.success) {
        toast.success("Course Deleted Successfully.");
        return;
      } else {
        toast.error(data?.message);
        return;
      }
    } catch (error) {
      console.log(error);
      toast.error(String(error));
      return;
    }
  };

  const handleSubmit = async () => {
    if (!image) return toast.error("Course image required");
    if (!form.teacher) return toast.error("Select a teacher");

    try {
      setFormLoading(true);

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("teacher", form.teacher);
      fd.append("education", form.education);
      fd.append("grade", form.grade);
      fd.append("price", String(form.price));
      fd.append("isPublished", String(form.isPublished));
      fd.append("image", image);

      form.videos.forEach((v, i) => {
        fd.append(`videos[${i}][title]`, v.title);
        fd.append(`videos[${i}][order]`, String(v.order));
        if (v.file) fd.append(`videos[${i}][file]`, v.file);
      });

      form.pdfs.forEach((p, i) => {
        fd.append(`pdfs[${i}][title]`, p.title);
        fd.append(`pdfs[${i}][order]`, String(p.order));
        if (p.file) fd.append(`pdfs[${i}][file]`, p.file);
      });

      fd.append("quizzes", JSON.stringify(form.quizzes));

      const res = await fetch("/api/courses/create", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Course created");
      setOpen(false);
      setImage(null);
      setForm({
        title: "",
        description: "",
        teacher: "",
        education: "General",
        grade: "Grade 9",
        price: 0,
        isPublished: false,
        videos: [],
        pdfs: [],
        quizzes: [],
      });

      getAllCourses();
    } catch {
      toast.error("Failed to create course");
    } finally {
      setFormLoading(false);
    }
  };

  const [ExpandBasic, setExpandBasic] = useState(true);
  const [ExpandContent, setExpandContent] = useState(false);

  /* ================= UI ================= */

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Courses
        </h1>
        <Button
          onClick={() => setOpen(true)}
          className="bg-black text-white hover:bg-gray-900"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Course
        </Button>
      </div>

      {/* ===== COURSES TABLE ===== */}
      <div className="border rounded-lg overflow-hidden">
        <ScrollArea>
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3 hidden md:table-cell">Teacher</th>
                <th className="p-3 hidden md:table-cell">Education</th>
                <th className="p-3">Grade</th>
                <th className="p-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr
                  key={c._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">{c.title}</td>
                  <td className="p-3 hidden md:table-cell">{c.teacherName}</td>
                  <td className="p-3 hidden md:table-cell">{c.education}</td>
                  <td className="p-3">{c.grade}</td>
                  <td className="p-3 text-right">EGP {c.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* ===== CREATE COURSE MODAL ===== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Create Course
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[75vh]">
            <div className="px-6 py-6 space-y-10">
              {/* ===== BASIC INFO ===== */}
              <section className="space-y-4">
                <button
                  onClick={() => setExpandBasic(!ExpandBasic)}
                  className="flex cursor-pointer items-center gap-2 text-lg font-semibold"
                >
                  Basic Information
                  {ExpandBasic ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>

                {ExpandBasic && (
                  <div className="space-y-4">
                    <input
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Course title"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />

                    <textarea
                      className="w-full border rounded-md px-3 py-2 min-h-25"
                      placeholder="Course description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />

                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={form.teacher}
                      onChange={(e) =>
                        setForm({ ...form, teacher: e.target.value })
                      }
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="number"
                        className="border rounded-md px-3 py-2"
                        placeholder="Price"
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: Number(e.target.value) })
                        }
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                )}
              </section>

              <button
                onClick={() => setExpandContent(!ExpandContent)}
                className="flex cursor-pointer items-center gap-2 text-lg font-semibold"
              >
                Add Content
                {ExpandContent ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </button>

              {ExpandContent ? (
                <div className="flex items-start flex-col gap-y-4 w-full">
                  <section className="space-y-4 w-full">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">Videos</h2>
                      <Button variant="outline" onClick={addVideo}>
                        + Add Video
                      </Button>
                    </div>

                    {form.videos.map((v, i) => (
                      <div key={i} className="border rounded-md p-4 space-y-3">
                        <input
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="Video title"
                          value={v.title}
                          onChange={(e) => {
                            const vids = [...form.videos];
                            vids[i].title = e.target.value;
                            setForm({ ...form, videos: vids });
                          }}
                        />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const vids = [...form.videos];
                            vids[i].file = e.target.files?.[0];
                            setForm({ ...form, videos: vids });
                          }}
                        />
                      </div>
                    ))}
                  </section>

                  {/* ===== PDFs ===== */}
                  <section className="space-y-4 w-full">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">PDFs</h2>
                      <Button variant="outline" onClick={addPDF}>
                        + Add PDF
                      </Button>
                    </div>

                    {form.pdfs.map((p, i) => (
                      <div key={i} className="border rounded-md p-4 space-y-3">
                        <input
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="PDF title"
                          value={p.title}
                          onChange={(e) => {
                            const pdfs = [...form.pdfs];
                            pdfs[i].title = e.target.value;
                            setForm({ ...form, pdfs });
                          }}
                        />
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            const pdfs = [...form.pdfs];
                            pdfs[i].file = e.target.files?.[0];
                            setForm({ ...form, pdfs });
                          }}
                        />
                      </div>
                    ))}
                  </section>

                  {/* ===== QUIZZES ===== */}
                  <section className="space-y-4 w-full">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold">Quizzes</h2>
                      <Button variant="outline" onClick={addQuiz}>
                        + Add Quiz
                      </Button>
                    </div>

                    {form.quizzes.map((q, qi) => (
                      <div key={qi} className="border rounded-md p-4 space-y-4">
                        <input
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="Quiz title"
                          value={q.title}
                          onChange={(e) => {
                            const quizzes = [...form.quizzes];
                            quizzes[qi].title = e.target.value;
                            setForm({ ...form, quizzes });
                          }}
                        />

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addQuestion(qi)}
                        >
                          + Add Question
                        </Button>
                      </div>
                    ))}
                  </section>
                </div>
              ) : null}
              {/* ===== VIDEOS ===== */}
            </div>
          </ScrollArea>

          {/* ===== STICKY FOOTER ===== */}
          <div className="border-t px-6 py-4 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={formLoading}
              className="bg-black text-white hover:bg-gray-900"
            >
              {formLoading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
