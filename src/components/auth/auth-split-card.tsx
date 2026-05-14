'use client';

import Image from "next/image";
import { ArrowLeft3 } from "iconsax-react";
import { useRouter } from "next/navigation";
import SwitchSimpleTheme from "components/pure-elements/switch";

type AuthSplitCardProps = {
  brandTitle: string;
  brandSubtitle: string;
  leftFooter: React.ReactNode;
  children: React.ReactNode;
};

export function AuthSplitCard({ brandTitle, brandSubtitle, leftFooter, children }: AuthSplitCardProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-[980px] mx-auto">
      <div
        className="grid overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white shadow-[0_24px_80px_-12px_rgba(255,138,102,0.18),0_12px_40px_-16px_rgba(25,193,182,0.12)] dark:border-white/10 dark:bg-zinc-900/95 dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.45)] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]"
      >
        <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden p-7 sm:p-9 lg:min-h-[520px] lg:p-10">
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#FFF3ED] via-[#E8FAF7] to-[#FFF9E8] dark:from-[#2a1810]/90 dark:via-[#0f2420]/90 dark:to-[#2a2210]/90"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#FF8A66]/35 blur-3xl dark:bg-[#FF8A66]/20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#19C1B6]/30 blur-3xl dark:bg-[#19C1B6]/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/3 top-1/4 h-40 w-40 rounded-full bg-[#FEA439]/25 blur-2xl dark:bg-[#FEA439]/10"
            aria-hidden
          />

          <div className="relative z-10 flex items-center justify-between text-zinc-800 dark:text-white">
            <button
              type="button"
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[#19C1B6]"
            >
              <ArrowLeft3 size={22} className="text-[#19C1B6] transition-transform group-hover:-translate-x-0.5" />
              Back
            </button>
            {/* <SwitchSimpleTheme /> */}
          </div>

          <div className="relative z-10 mt-6 flex flex-1 flex-col justify-center gap-8 lg:mt-0">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-md shadow-[#19C1B6]/10 ring-1 ring-white/60 dark:bg-white/10 dark:ring-white/10">
                <Image src="/logo.png" width={44} height={44} alt="BrainWave" />
              </div>
              <div className="">
                <div className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
                  {brandTitle}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{brandSubtitle}</div>
              </div>
            </div>

            <div className="relative hidden md:block -z-10">
              <div className="absolute -right-2 top-1/2 z-10 w-[min(92%,280px)] -translate-y-1/2 rotate-[-3deg]">
                <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-xl shadow-[#19C1B6]/8 backdrop-blur-sm dark:border-white/15 dark:bg-zinc-800/80">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FEA439]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF8A66]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#19C1B6]/70" />
                    <div className="ml-auto h-2 w-16 rounded-full bg-zinc-200/80 dark:bg-zinc-600/50" />
                  </div>
                  <div className="mb-3 flex gap-2">
                    <div className="h-20 w-14 shrink-0 rounded-xl bg-gradient-to-b from-[#19C1B6]/15 to-[#19C1B6]/5 dark:from-[#19C1B6]/25 dark:to-transparent" />
                    <div className="flex flex-1 flex-col justify-end rounded-xl bg-gradient-to-br from-[#FF8A66]/12 via-[#FEA439]/8 to-[#19C1B6]/10 px-2 pb-2 dark:from-[#FF8A66]/20">
                      <div className="flex h-[72px] items-end gap-1">
                        {[38, 62, 44, 78, 52, 68, 48].map((pct, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-md bg-[#19C1B6]/75 dark:bg-[#19C1B6]/60"
                            style={{ height: `${pct}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-[#FEA439]/12 px-3 py-2.5 dark:bg-[#FEA439]/20">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Progress
                      </div>
                      <div className="text-sm font-bold text-[#c96d1a] dark:text-[#FEA439]">+32%</div>
                    </div>
                    <div className="rounded-xl bg-[#19C1B6]/12 px-3 py-2.5 dark:bg-[#19C1B6]/20">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Active
                      </div>
                      <div className="text-sm font-bold text-[#0f8a7a] dark:text-[#5ee0d3]">1.2k</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="relative z-10 mt-8 lg:mt-0">{leftFooter}</div> */}
        </div>

        <div className="flex flex-col justify-center border-t border-black/[0.06] bg-miniBackground p-7 sm:p-9 lg:border-l lg:border-t-0 lg:p-11 dark:border-white/10 dark:bg-zinc-950/50">
          {children}
        </div>
      </div>
    </div>
  );
}
