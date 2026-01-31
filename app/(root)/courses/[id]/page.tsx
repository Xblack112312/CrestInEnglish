"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Image from "next/image";
import { GraduationCap, School, FileText, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CourseDetailsWithEnrollBtnPage = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<any>(null);

  const [open, setOpen] = useState(false);
  const [proof, setProof] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* =========================
      Fetch Course
  ========================== */
  const getSingleCourse = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/courses/one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data?.success) {
        setCourse(data.course);
      } else {
        toast.error(data?.message || "Failed to load course");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getSingleCourse();
  }, [id]);

  /* =========================
      File Handling
  ========================== */
  const handleProofChange = (file: File | null) => {
    setProof(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  /* =========================
      Submit Enrollment
  ========================== */
  const SubmitEnroll = async () => {
    if (!proof || !phone) {
      toast.error("Please enter phone number and upload proof");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("courseId", String(id));
      formData.append("phone", phone.replace(/\s+/g, ""));
      formData.append("paymentProof", proof);

      const res = await fetch("/api/enrollments/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data?.success) {
        toast.error(data?.message);
        return;
    }

      toast.success("Enrollment submitted successfully");

      setOpen(false);
      setProof(null);
      setPreview(null);
      setPhone("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-32 text-center text-lg">Loading course...</div>;
  }

  if (!course) {
    return <div className="py-32 text-center">Course not found</div>;
  }

  return (
    <div className="w-full py-20">
      {/* =======================
          ENROLL DIALOG
      ======================== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Enrollment</DialogTitle>
            <DialogDescription>
              Transfer the course fee via Vodafone Cash, then upload proof of
              payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div className="rounded-lg border p-4 bg-gray-50 space-y-2">
              <p className="text-sm text-gray-600">Vodafone Cash Number</p>
              <p className="text-lg font-semibold">01090768049</p>

              <p className="text-sm text-gray-600 mt-3">Amount to Pay</p>
              <p className="text-lg font-semibold">
                EGP {course.price.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2 mt-3">
              <label className="text-sm font-medium">
                Your Vodafone Cash Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="space-y-3 mt-3">
              <input
                id="proof-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleProofChange(e.target.files?.[0] || null)}
                className="hidden"
              />

              <label
                htmlFor="proof-upload"
                className="inline-flex w-full justify-center px-4 py-3 rounded-lg bg-black text-white text-sm font-medium cursor-pointer hover:bg-black/80"
              >
                {preview ? "Change Image" : "Upload Payment Proof"}
              </label>

              {preview && (
                <div className="border rounded-lg p-2">
                  <img
                    src={preview}
                    alt="Payment proof"
                    className="w-full h-48 object-contain rounded-md"
                  />
                </div>
              )}
            </div>

            <button
              onClick={SubmitEnroll}
              disabled={!proof || !phone || submitting}
              className="w-full mt-3 bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Proof"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* =======================
          PAGE CONTENT
      ======================== */}
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <section className="flex flex-col md:flex-row gap-10 mt-6">
          {course.image && (
            <Image
              src={course.image}
              alt={course.title}
              width={500}
              height={500}
              className="rounded-md"
            />
          )}

          <div className="space-y-5">
            <h1 className="text-3xl font-semibold">{course.title}</h1>
            <p className="text-sm text-black/70">{course.description}</p>

            {/* ===== Course Content ===== */}
            <div className=" mt-4 rounded-lg space-y-3 ">
              <h3 className="font-medium text-sm text-gray-700">
                Course Content
              </h3>

              <div className="flex items-center gap-2 text-sm">
                <FileText size={16} />
                <span>{course?.pdfs?.length || 0} PDFs</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <HelpCircle size={16} />
                <span>{course?.quizzes?.length || 0} Quizzes</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <GraduationCap />
                <p>{course.grade}</p>
              </div>
              <div className="flex items-center gap-2">
                <School />
                <p>{course.education}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-lg font-medium">
                EGP {course.price.toFixed(2)}
              </p>
              <button
                onClick={() => setOpen(true)}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-black/80"
              >
                Enroll Now
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CourseDetailsWithEnrollBtnPage;
