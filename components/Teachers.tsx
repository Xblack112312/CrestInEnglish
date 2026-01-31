"use client";
import React from "react";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover";

// Teacher data array
const teachers = [
  {
    name: "Mr. Ahmed Hassan",
    role: "English Teacher",
    img: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
    bio: "10+ years teaching experience in both Azhar and General Education systems.",
  },
  {
    name: "Ms. Sara Ali",
    role: "Azhar Curriculum Specialist",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    bio: "Expert in Azhar curriculum with innovative teaching methods.",
  },
];

const TeacherCard = ({ teacher }: { teacher: typeof teachers[0] }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        aria-label={teacher.name}
        className="w-48 p-4 rounded-xl text-center"
      >
        <div className="relative w-24 h-24 mx-auto mb-3">
          <Image
            src={teacher.img}
            alt={teacher.name}
            fill
            className="rounded-full object-cover"
          />
        </div>

        <h3 className="text-sm font-medium text-zinc-900">{teacher.name}</h3>
        <p className="text-xs text-zinc-600">{teacher.role}</p>
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-60">
      <PopoverHeader>
        <PopoverTitle>{teacher.name}</PopoverTitle>
        <PopoverDescription>{teacher.bio}</PopoverDescription>
      </PopoverHeader>
    </PopoverContent>
  </Popover>
);

const Teachers = () => {
  return (
    <section className="px-12 py-20">
      <h2 className="text-2xl font-medium text-zinc-900">
        Our Expert Teachers
      </h2>

      <div className="mt-6 flex gap-6 flex-wrap">
        {teachers.map((teacher) => (
          <TeacherCard key={teacher.name} teacher={teacher} />
        ))}
      </div>
    </section>
  );
};

export default Teachers;
