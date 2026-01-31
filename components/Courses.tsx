"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { BookOpen, Play, GraduationCap, School } from "lucide-react";

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

const Courses = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses/all");
      const data = await response.json();

      if (data?.success) {
        setCourses(data?.allcourses || []);
      } else {
        console.error("Failed to fetch courses:", data.message);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    fetchCourses();
  }, []);

    useEffect(() => {
      console.log(courses);
    }, [courses])

  return (
    <section className="flex px-6 md:px-12 py-12 flex-col items-start w-full">
      <div className="flex items-center justify-between w-full mb-8">
        <h3 className="text-2xl font-medium text-black">English Courses</h3>
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
          <p className="text-gray-500">No courses available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {courses.map((course) => (
            <article
              key={course._id}
              className="w-full overflow-hidden rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 p-4">
                <h3 className="text-lg font-semibold leading-snug text-neutral-900 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {course.description}
                </p>

                {/* Course Info */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <GraduationCap className="h-3 w-3" />
                  <span>{course.grade}</span>
                  <School className="h-3 w-3 ml-2" />
                  <span>{course.education}</span>
                </div>

                {/* Instructor */}
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
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">
                      {course.price} EGP
                    </p>
                  </div>
                </div>

                {/* View Button */}
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
            </article>
          ))}
        </div>
      )}

      {/* View All Button for Mobile */}
      {courses.length > 0 && (
        <Button
          variant="outline"
          onClick={() => router.push("/courses")}
          className="w-full sm:hidden mt-6"
        >
          View All Courses
        </Button>
      )}
    </section>
  );
};

export default Courses;
