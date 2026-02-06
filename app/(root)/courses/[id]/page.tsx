"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  GraduationCap,
  School,
  FileText,
  HelpCircle,
  ShieldCheck,
  UploadCloud,
  X,
  Phone,
  CreditCard,
  ArrowRight,
  PlayCircle,
  Clock,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Course = {
  _id?: string;
  title: string;
  description?: string;
  image?: string;
  grade?: string;
  education?: string;
  price: number;
  pdfs?: any[];
  quizzes?: any[];
};

type EnrollmentCheckResponse =
  | {
      success: true;
      enrolled: boolean;
      pending?: boolean;
      shouldEnroll?: boolean;
      status?: string;
      message?: string;
    }
  | { success: false; message: string };

const CourseDetailsWithEnrollBtnPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);

  // enrollment state
  const [checkingEnroll, setCheckingEnroll] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [open, setOpen] = useState(false);
  const [proof, setProof] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const VODAFONE_CASH_NUMBER = "01090768049";

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

  /* =========================
      Check Enrollment
      (expects your API returns: enrolled/pending)
  ========================== */
  const checkEnrollment = async () => {
    try {
      setCheckingEnroll(true);

      // ✅ Change this endpoint to your actual check route:
      // e.g. "/api/enrollments/check"
      const res = await fetch("/api/enrollments/isenrolled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: String(id) }),
      });

      const data = (await res.json()) as EnrollmentCheckResponse;

      if (!data?.success) {
        // If not logged in, you might want to keep enroll visible and let it redirect to login
        // so we don't hard-fail UI.
        setIsEnrolled(false);
        setIsPending(false);
        return;
      }

      setIsEnrolled(Boolean(data.enrolled));
      setIsPending(Boolean(data.pending));
    } catch (error) {
      console.error(error);
      setIsEnrolled(false);
      setIsPending(false);
    } finally {
      setCheckingEnroll(false);
    }
  };

  useEffect(() => {
    if (id) {
      getSingleCourse();
      checkEnrollment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* =========================
      Cleanup preview URL
  ========================== */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* =========================
      File Handling
  ========================== */
  const handleProofChange = (file: File | null) => {
    setProof(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const removeProof = () => {
    setProof(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* =========================
      Helpers
  ========================== */
  const normalizedPhone = useMemo(() => phone.replace(/\s+/g, ""), [phone]);

  const isPhoneValid = useMemo(() => {
    const p = normalizedPhone;
    if (!p) return false;
    if (p.startsWith("01")) return p.length === 11;
    return p.length >= 8;
  }, [normalizedPhone]);

  const canSubmit = useMemo(
    () => !!proof && isPhoneValid && !submitting,
    [proof, isPhoneValid, submitting]
  );

  const copyVodafoneNumber = async () => {
    try {
      await navigator.clipboard.writeText(VODAFONE_CASH_NUMBER);
      toast.success("Vodafone Cash number copied");
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  };

  /* =========================
      Submit Enrollment
  ========================== */
  const SubmitEnroll = async () => {
    if (!proof || !normalizedPhone) {
      toast.error("Please enter phone number and upload proof");
      return;
    }
    if (!isPhoneValid) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("courseId", String(id));
      formData.append("phone", normalizedPhone);
      formData.append("paymentProof", proof);

      const res = await fetch("/api/enrollments/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data?.success) {
        toast.error(data?.message || "Failed to submit enrollment");
        return;
      }

      toast.success("Enrollment submitted successfully");

      setOpen(false);
      removeProof();
      setPhone("");

      // After submitting, typically becomes pending
      await checkEnrollment();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
      Primary CTA behavior
  ========================== */
  const onPrimaryCta = () => {
    if (isEnrolled) {
      // ✅ Change this to where the user watches the course in your app
      router.push(`/courses/${id}/content`);
      return;
    }

    if (isPending) {
      toast.message("Your enrollment is pending approval.");
      return;
    }

    setOpen(true);
  };

  /* =========================
      UI States
  ========================== */
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="h-5 w-64 animate-pulse rounded bg-neutral-200" />
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-neutral-200" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-10/12 animate-pulse rounded bg-neutral-200" />
              <div className="mt-6 h-12 w-44 animate-pulse rounded-xl bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[70vh] bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <p className="text-lg font-semibold text-neutral-900">
              Course not found
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              The course may have been removed or the link is incorrect.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
              >
                Back to Home
              </button>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pdfCount = course?.pdfs?.length || 0;
  const quizCount = course?.quizzes?.length || 0;

  const ctaLabel = isEnrolled
    ? "Watch course"
    : isPending
    ? "Pending approval"
    : "Enroll now";

  const ctaIcon = isEnrolled ? (
    <PlayCircle className="h-4 w-4" />
  ) : isPending ? (
    <Clock className="h-4 w-4" />
  ) : (
    <ArrowRight className="h-4 w-4" />
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* =======================
          ENROLL DIALOG
      ======================== */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          // don't allow opening when already enrolled/pending
          if (v && (isEnrolled || isPending)) return;
          setOpen(v);
        }}
      >
        <DialogContent className="max-w-lg p-0">
        <ScrollArea className="h-[500px]">
          {/* Header */}
          <div className="border-b bg-white p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Complete enrollment
              </DialogTitle>
              <DialogDescription className="text-sm">
                Transfer the course fee via Vodafone Cash, then upload proof of
                payment.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="bg-white p-6">
            <div className="space-y-5">
              {/* Payment summary */}
              <div className="rounded-2xl border bg-neutral-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-neutral-900 text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-900">
                      Vodafone Cash payment
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      Send the exact amount and then attach a screenshot.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border bg-white p-3">
                    <p className="text-xs font-medium text-neutral-500">
                      Vodafone Cash Number
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-900">
                        {VODAFONE_CASH_NUMBER}
                      </p>
                      <button
                        onClick={copyVodafoneNumber}
                        className="rounded-lg border bg-white px-2 py-1 text-xs font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-white p-3">
                    <p className="text-xs font-medium text-neutral-500">
                      Amount to Pay
                    </p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900">
                      EGP {Number(course.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-neutral-600">
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    Your payment proof is used only to verify enrollment.
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-900">
                  Your Vodafone Cash number
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    inputMode="tel"
                    className="w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                  />
                </div>
                {!phone ? (
                  <p className="text-xs text-neutral-500">
                    Enter the number you used to send the payment.
                  </p>
                ) : !isPhoneValid ? (
                  <p className="text-xs text-red-600">
                    Phone number looks incomplete.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-700">Looks good.</p>
                )}
              </div>

              {/* Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-neutral-900">
                    Payment proof
                  </label>
                  {preview && (
                    <button
                      onClick={removeProof}
                      className="inline-flex items-center gap-1 rounded-lg border bg-white px-2 py-1 text-xs font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  id="proof-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleProofChange(e.target.files?.[0] || null)
                  }
                  className="hidden"
                />

                {!preview ? (
                  <label
                    htmlFor="proof-upload"
                    className="group flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-neutral-50 p-6 text-center hover:bg-neutral-100"
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-sm">
                      <UploadCloud className="h-5 w-5 text-neutral-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        Upload screenshot
                      </p>
                      <p className="mt-1 text-xs text-neutral-600">
                        JPG, PNG — make sure the transaction details are
                        visible.
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="overflow-hidden rounded-2xl border bg-white">
                    <div className="border-b bg-neutral-50 px-4 py-2">
                      <p className="text-xs font-medium text-neutral-600">
                        Preview
                      </p>
                    </div>
                    <div className="p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt="Payment proof"
                        className="h-56 w-full rounded-xl object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={SubmitEnroll}
                disabled={!canSubmit}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit & request enrollment"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* =======================
          PAGE CONTENT
      ======================== */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[18rem] truncate sm:max-w-none">
                {course.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          {/* Media */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div className="relative aspect-[16/10] w-full bg-neutral-100">
                {course.image ? (
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <div className="text-sm font-medium text-neutral-500">
                      No image
                    </div>
                  </div>
                )}
              </div>

              {/* Mini meta strip */}
              <div className="border-t bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {course.grade && (
                    <Pill
                      icon={<GraduationCap className="h-4 w-4" />}
                      label={course.grade}
                    />
                  )}
                  {course.education && (
                    <Pill
                      icon={<School className="h-4 w-4" />}
                      label={course.education}
                    />
                  )}
                  <Pill
                    icon={<FileText className="h-4 w-4" />}
                    label={`${pdfCount} PDFs`}
                  />
                  <Pill
                    icon={<HelpCircle className="h-4 w-4" />}
                    label={`${quizCount} Quizzes`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">
                {course.title}
              </h1>

              {course.description ? (
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {course.description}
                </p>
              ) : (
                <p className="mt-3 text-sm text-neutral-500">
                  No description provided.
                </p>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoCard
                  title="Materials"
                  value={`${pdfCount} PDFs`}
                  icon={<FileText className="h-4 w-4" />}
                />
                <InfoCard
                  title="Practice"
                  value={`${quizCount} Quizzes`}
                  icon={<HelpCircle className="h-4 w-4" />}
                />
              </div>

              <div className="mt-6 rounded-2xl border bg-neutral-50 p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-neutral-500">
                      Course price
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-neutral-900">
                      EGP {Number(course.price).toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">
                      One-time payment via Vodafone Cash.
                    </p>
                  </div>

                  <button
                    onClick={onPrimaryCta}
                    disabled={checkingEnroll || isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {checkingEnroll ? "Checking..." : ctaLabel}
                    {!checkingEnroll && ctaIcon}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-neutral-600">
                <ShieldCheck className="mt-0.5 h-4 w-4" />
                <p>
                  {isEnrolled
                    ? "You’re enrolled. Start learning right away."
                    : isPending
                    ? "Your enrollment is pending review. You’ll get access once approved."
                    : "After submitting proof, your enrollment will be reviewed. You’ll get access once it’s approved."}
                </p>
              </div>
            </div>

            {/* Optional: secondary card for trust/help */}
            <div className="mt-4 rounded-3xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-neutral-900">
                Need help?
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                If you paid but have issues uploading proof, take a clear
                screenshot showing the transaction ID and amount.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={copyVodafoneNumber}
                  className="rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50"
                >
                  Copy payment number
                </button>
                <button
                  onClick={onPrimaryCta}
                  disabled={checkingEnroll || isPending}
                  className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkingEnroll ? "Checking..." : isEnrolled ? "Watch course" : "Upload proof"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lower section */}
        <div className="mt-10 rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900">
            What you’ll get
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Access to all course materials and quizzes included in this course.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Benefit
              title="PDF materials"
              desc="Download and study anytime."
              icon={<FileText className="h-5 w-5" />}
            />
            <Benefit
              title="Quizzes"
              desc="Practice with quick checks."
              icon={<HelpCircle className="h-5 w-5" />}
            />
            <Benefit
              title="Grade-ready"
              desc="Aligned with your level."
              icon={<GraduationCap className="h-5 w-5" />}
            />
            <Benefit
              title="Simple payment"
              desc="Vodafone Cash supported."
              icon={<CreditCard className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsWithEnrollBtnPage;

/* =========================
    Small UI Helpers
========================= */

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm">
      <span className="text-neutral-700">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}

function InfoCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
        <span className="text-neutral-600">{icon}</span>
        <span>{title}</span>
      </div>
      <div className="mt-2 text-base font-semibold text-neutral-900">
        {value}
      </div>
    </div>
  );
}

function Benefit({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-neutral-50 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-sm">
        <span className="text-neutral-800">{icon}</span>
      </div>
      <div className="mt-3 text-sm font-semibold text-neutral-900">{title}</div>
      <div className="mt-1 text-sm text-neutral-600">{desc}</div>
    </div>
  );
}
