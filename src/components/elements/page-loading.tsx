import React from "react";

import { cn } from "lib/utils";

type PageLoadingProps = {
  message?: string;
  className?: string;
};

function WaveMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn("h-14 w-14 shrink-0 opacity-90", className)}
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 36c8-12 20-12 24-4s16 8 24-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M12 44c6-8 14-8 20 0s14-8 20 0"
        opacity="0.65"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M16 28c4-6 12-6 16 0s12-6 16 0"
        opacity="0.45"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function PageLoading({
  message = "Loading…",
  className,
}: PageLoadingProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "relative flex min-h-[calc(100dvh-12rem)] w-full flex-col items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-[#FEF6EC] to-[#EDFEFC]",
        "before:pointer-events-none before:absolute before:left-0 before:top-8 before:z-[1] before:h-6 before:w-full before:bg-[url('/pattern-wave.png')] before:bg-left before:bg-repeat-x before:content-['']",
        className
      )}
      role="status"
    >
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <WaveMark className="text-[#1DC1B6]" />

        <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#1DC1B6]/20 motion-safe:animate-ping" />
          <span className="relative h-11 w-11 rounded-full border-[3px] border-[#1DC1B6]/30 border-t-[#1DC1B6] motion-safe:animate-[spin_0.85s_linear_infinite]" />
          <span className="absolute h-2.5 w-2.5 rounded-full bg-[#FEA439]" />
        </div>

        <div className="max-w-sm space-y-1">
          <p className="text-lg font-semibold text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">
            Getting things ready for you
          </p>
        </div>

        <div aria-hidden className="flex gap-2">
          <span className="h-2 w-2 rounded-full bg-[#1DC1B6] motion-safe:animate-bounce" />
          <span
            className="h-2 w-2 rounded-full bg-[#FEA439] motion-safe:animate-bounce motion-safe:[animation-delay:150ms]"
          />
          <span
            className="h-2 w-2 rounded-full bg-[#1DC1B6] motion-safe:animate-bounce motion-safe:[animation-delay:300ms]"
          />
        </div>
      </div>
    </div>
  );
}
