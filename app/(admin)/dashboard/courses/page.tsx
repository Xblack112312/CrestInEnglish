"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoaderCircle, Plus } from "lucide-react";
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

  /* ================= UI ================= */

  return (
    <div className="w-full">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              <input
                className="border p-2 w-full"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <textarea
                className="border p-2 w-full"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <select
                className="border p-2 w-full"
                value={form.teacher}
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              >
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />

              <input
                type="number"
                className="border p-2 w-full"
                placeholder="Price"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />

              {/* ===== BUTTONS ===== */}
              <Button type="button" onClick={addVideo} variant="outline">
                + Video
              </Button>

              {form.videos.map((v, i) => (
                <div key={i} className="border p-2">
                  <input
                    className="border p-2 w-full mb-2"
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

              <Button type="button" onClick={addPDF} variant="outline">
                + PDF
              </Button>

              {form.pdfs.map((p, i) => (
                <div key={i} className="border p-2">
                  <input
                    className="border p-2 w-full mb-2"
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

              <Button type="button" onClick={addQuiz} variant="outline">
                + Quiz
              </Button>

              {form.quizzes.map((q, qi) => (
                <div key={qi} className="border p-3">
                  <input
                    className="border p-2 w-full mb-2"
                    placeholder="Quiz title"
                    value={q.title}
                    onChange={(e) => {
                      const qs = [...form.quizzes];
                      qs[qi].title = e.target.value;
                      setForm({ ...form, quizzes: qs });
                    }}
                  />

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addQuestion(qi)}
                  >
                    + Question
                  </Button>
                </div>
              ))}

              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={formLoading}
              >
                {formLoading && (
                  <LoaderCircle size={18} className="animate-spin mr-2" />
                )}
                Submit
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">All Courses</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus size={18} className="mr-2" /> Course
        </Button>
      </div>

      <ScrollArea className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b">Title</th>
              <th className="p-3 border-b">Teacher</th>
              <th className="p-3 border-b">Education</th>
              <th className="p-3 border-b">Grade</th>
              <th className="p-3 border-b">Price</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id}>
                <td className="p-3 border-b">{c.title}</td>
                <td className="p-3 border-b">{c.teacherName}</td>
                <td className="p-3 border-b">{c.education}</td>
                <td className="p-3 border-b">{c.grade}</td>
                <td className="p-3 border-b">EGP {c.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
