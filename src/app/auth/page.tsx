"use client";

import React, { Suspense, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/pure-elements/form/index";
import Input from "components/pure-elements/input";
import Button from "components/pure-elements/button";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "lib/utils";
import { AuthSplitCard } from "components/auth/auth-split-card";
import { HcaptchaWidget } from "components/auth/hcaptcha-widget";

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(4, { message: "Password must be at least 4 characters." }),
});

const signupSchema = z.object({
  userName: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email("Invalid email address."),
  password: z.string().min(4, { message: "Password must be at least 4 characters." }),
});

function safePostAuthPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/account";
  return raw;
}

function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [serverError, setServerError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginCaptchaRequired = mode === "login" && Boolean(HCAPTCHA_SITE_KEY);

  const schema = useMemo(() => (mode === "login" ? loginSchema : signupSchema), [mode]);

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError("");
    try {
      if (loginCaptchaRequired && !hcaptchaToken) {
        throw new Error("Please complete the captcha.");
      }

      const endpoint = mode === "login" ? "/api/login" : "/api/register";
      const payload =
        mode === "login"
          ? {
              email: data.email,
              password: data.password,
              ...(HCAPTCHA_SITE_KEY ? { hcaptchaToken } : {}),
            }
          : data;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Authentication failed");
      }

      const next = safePostAuthPath(searchParams.get("callbackUrl"));
      router.push(next);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Authentication failed");
      if (loginCaptchaRequired) {
        setHcaptchaToken(null);
        setCaptchaResetKey((k) => k + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-12 rounded-2xl border border-zinc-200/90 bg-white px-4 shadow-sm transition-shadow placeholder:text-zinc-400 focus-visible:border-[#19C1B6]/50 focus-visible:ring-2 focus-visible:ring-[#19C1B6]/20 dark:border-zinc-700 dark:bg-zinc-900/80";

  return (
    <div className="flex w-full items-center justify-center">
      <AuthSplitCard
        brandTitle="BrainWave"
        brandSubtitle="Education • Academy"
        leftFooter={
          <div className="inline-flex rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/[0.04] backdrop-blur-sm dark:bg-zinc-800/70 dark:ring-white/10">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cn(
                "h-10 rounded-full px-5 text-sm font-semibold transition-all",
                mode === "login"
                  ? "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
              )}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={cn(
                "h-10 rounded-full px-5 text-sm font-semibold transition-all",
                mode === "signup"
                  ? "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
              )}
            >
              Sign up
            </button>
          </div>
        }
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#19C1B6]">
            {mode === "login" ? "Welcome back" : "Join us"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {mode === "login"
              ? "Access your courses, orders, and saved progress in one place."
              : "Start learning with BrainWave — track orders and checkout faster."}
          </p>
        </div>

        <div className="mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {mode === "signup" ? (
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-red-600" />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</FormLabel>
                    <FormControl>
                      <Input className={inputClass} placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</FormLabel>
                    <FormControl>
                      <Input type="password" className={inputClass} placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />

              {mode === "login" && HCAPTCHA_SITE_KEY ? (
                <HcaptchaWidget
                  siteKey={HCAPTCHA_SITE_KEY}
                  onToken={setHcaptchaToken}
                  resetKey={captchaResetKey}
                />
              ) : null}

              {serverError ? <div className="text-sm font-medium text-red-600">{serverError}</div> : null}

              <Button
                type="submit"
                disabled={loading || (loginCaptchaRequired && !hcaptchaToken)}
                className="h-12 w-full rounded-2xl bg-[#FEA439] text-base font-semibold text-zinc-900 shadow-lg shadow-[#FEA439]/25 transition hover:bg-[#ffb04d] disabled:opacity-60"
              >
                {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </Button>

              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="text-sm font-medium text-[#19C1B6] hover:underline"
                >
                  Forgot password?
                </button>
              ) : null}
            </form>
          </Form>
        </div>
      </AuthSplitCard>
    </div>
  );
}

export default function Auth() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] w-full items-center justify-center text-sm text-zinc-500">
          Loading…
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
