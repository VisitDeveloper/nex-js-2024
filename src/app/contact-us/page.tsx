"use client";

import { LeftHalfContact, RightHalfContact } from "components";

import React from "react";
import { cn } from "lib/utils";

export default function ContactUs() {
  return (
    <div className="px-5 2xl:px-0 mx-auto max-w-screen-2xl my-16 space-y-8">
      <h3 className="w-full text-center text-3xl font-bold text-[#1DC1B6]">
        Contact Us
      </h3>
      <div
        className={cn(
          "flex flex-col justify-center items-center gap-8 text-white",
          "bg-[#26BEB3]/90 w-full rounded-2xl p-8 relative overflow-hidden",
          "p-5 flex flex-col md:flex-row items-start justify-between gap-4",
          "before:content-[''] before:absolute before:-z-10 before:bg-[url('/bg-newsletter.png')] before:bg-cover before:w-full before:h-full before:inset-0"
        )}
      >
        <LeftHalfContact />
        <RightHalfContact />
      </div>
    </div>
  );
}
