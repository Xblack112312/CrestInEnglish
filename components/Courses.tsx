"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { BookOpen, Play, GraduationCap, School } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { motion, type Variants, cubicBezier } from "framer-motion";

interface Course {
  _id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  teacher: {
    _id: string;
    name: string;
    avatar: string;
    job: string;
  };
  grade: string;
  education: string;
  videos: any[];
  isPublished: boolean;
}

const easeOut = cubicBezier(0.22, 1, 0.36, 1);

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

const Courses = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses/all", { cache: "no-store" });
      const data = await response.json();

      if (data?.success) {
        setCourses(Array.isArray(data?.allcourses) ? data.allcourses : []);
      } else {
        console.error("Failed to fetch courses:", data?.message);
        setCourses([]);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <section className="flex px-6 md:px-12 py-12 flex-col items-start w-full">
      <div className="flex items-center justify-between w-full mb-8">
        <motion.h3
          className="text-2xl font-medium text-black"
          variants={titleVariants}
          initial="hidden"
          animate="show"
        >
          {t("englishcourse")}
        </motion.h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full overflow-hidden rounded-xl bg-neutral-50 animate-pulse"
            >
              <div className="relative h-48 w-full bg-gray-200" />
              <div className="flex flex-col gap-3 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="w-full text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t("ncay")}</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {courses.map((course) => (
            <motion.article
              key={course._id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2, ease: easeOut }}
              className="w-full overflow-hidden rounded-xl bg-white border shadow-sm cursor-pointer transition hover:shadow-md"
              onClick={() => router.push(`/courses/${course._id}`)}
            >
              {/* Course Image */}
              <div className="relative h-48 w-full">
                {course.image ? (
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 p-4">
                <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-sm text-neutral-600 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <GraduationCap className="h-3 w-3" />
                  <span>{course.grade}</span>
                  <School className="h-3 w-3 ml-2" />
                  <span>{course.education}</span>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t">
                  {course.teacher?.avatar && (
                    <Image
                      src={course.teacher.avatar}
                      alt={course.teacher.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {course.teacher?.name || "Instructor"}
                    </p>
                    <p className="text-xs text-neutral-600 truncate">
                      {course.teacher?.job || "Course Instructor"}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-neutral-900">
                    {course.price} EGP
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/courses/${course._id}`);
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  View Course
                </Button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  );
};

export default Courses;
