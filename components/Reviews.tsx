import React from "react";
import Image from "next/image";

const reviews = [
  {
    name: "Ahmed Mohamed",
    grade: "Secondary 3 – General Education",
    review:
      "The lessons are very clear and helped me understand grammar better. My exam results improved a lot.",
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
  },
  {
    name: "Sara Hassan",
    grade: "Preparatory – Azhar",
    review:
      "The explanations are simple and match the Azhar curriculum exactly. I finally feel confident in English.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  },
  {
    name: "Omar Ali",
    grade: "Secondary – Azhar",
    review:
      "Very organized platform. I know exactly what to study before exams.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  },
];

const StudentReviews = () => {
  return (
    <section className="px-12 mt-4 py-20 bg-zinc-50">
      <h2 className="text-2xl font-medium text-zinc-900 text-center">
        What Our Students Say
      </h2>

      <div className="mt-10 flex gap-6 flex-wrap justify-center">
        {reviews.map((item) => (
          <div
            key={item.name}
            className="w-80 p-5 rounded-xl bg-white border border-zinc-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-zinc-600">{item.grade}</p>
              </div>
            </div>

            <p className="text-sm text-zinc-700 leading-relaxed">
              “{item.review}”
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StudentReviews;
