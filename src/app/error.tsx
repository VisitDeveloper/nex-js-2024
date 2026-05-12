"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-lg font-semibold text-zinc-900">Something went wrong</p>
      <p className="mt-2 text-sm text-zinc-600 break-words">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-[#19C1B6] px-5 py-2 text-sm font-semibold text-white hover:opacity-95"
      >
        Try again
      </button>
    </div>
  );
}
