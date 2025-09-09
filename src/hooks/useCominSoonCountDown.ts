'use client'
import { useEffect, useState } from "react";

export const useComingSoonCountDown = (initialTime: string) => {
  const savedEndTime = typeof window !== "undefined" ? localStorage.getItem("releaseDate") : null;

  const releaseDate = savedEndTime
    ? parseInt(savedEndTime)
    : new Date(initialTime).getTime();

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!savedEndTime) {
      localStorage.setItem("releaseDate", releaseDate.toString());
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = releaseDate - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [releaseDate]);

  return timeLeft;
};
