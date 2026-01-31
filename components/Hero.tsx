import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <section className="w-full px-6 md:px-12 mt-40">
      <div className="mx-auto max-w-7xl flex flex-col-reverse md:flex-row items-center justify-between gap-12">
        
        {/* Text Content */}
        <div className="flex flex-col items-start max-w-xl">
          <span className="text-sm font-medium text-zinc-600 mb-2">
            #1 English Platform for Egyptian Students
          </span>

          <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-zinc-900">
            Master English. <br /> Ace Your Exams.
          </h1>

          <p className="mt-4 text-base text-zinc-700 leading-relaxed">
            A complete English learning platform designed for school students in Egypt.
            Whether you study in the Azhar or General Education system, our courses are
            fully aligned with your curriculum to help you succeed academically and
            communicate confidently.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <button className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition">
              About Us
            </button>

            <button className="px-6 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-black/80 transition">
              Get Started
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="shrink-0">
          <Image
            src="/images/3SCENE.png"
            width={560}
            height={560}
            priority
            className="drop-shadow-2xl"
            alt="Student learning English online"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
