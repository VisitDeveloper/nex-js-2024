'use client';

import React, { useState } from "react";
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
import { useRouter } from "next/navigation";
import { cn } from "lib/utils";
import { canAccessPortalAdmin } from "lib/portal-roles";
import { AuthSplitCard } from "components/auth/auth-split-card";
import { HcaptchaWidget } from "components/auth/hcaptcha-widget";

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

const FormSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(4, { message: "Password must be at least 4 characters." }),
});

export default function Auth() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const captchaRequired = Boolean(HCAPTCHA_SITE_KEY);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    setServerError("");
    try {
      if (captchaRequired && !hcaptchaToken) {
        throw new Error("Please complete the captcha.");
      }

      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...(HCAPTCHA_SITE_KEY ? { hcaptchaToken } : {}),
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || "Login failed");
      }

      if (!canAccessPortalAdmin(json?.user?.role)) {
        throw new Error("You are not allowed to access the admin portal.");
      }

      router.push("/portal/admin");
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Login failed");
      if (captchaRequired) {
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
        brandTitle="Admin Portal"
        brandSubtitle="BrainWave • Store Ops"
        leftFooter={
          <div
            className={cn(
              "max-w-md rounded-2xl border border-white/60 bg-white/50 p-4 text-sm leading-relaxed text-zinc-700 backdrop-blur-sm dark:border-white/15 dark:bg-zinc-800/50 dark:text-zinc-300"
            )}
          >
            Sign in with an authorized admin account to open <span className="font-semibold">/portal/admin</span>.
          </div>
        }
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FEA439]">Staff only</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Admin sign in
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Manage catalog, orders, users, and site content.
          </p>
        </div>

        <div className="mt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</FormLabel>
                    <FormControl>
                      <Input className={inputClass} placeholder="admin@example.com" {...field} />
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

              {HCAPTCHA_SITE_KEY ? (
                <HcaptchaWidget
                  siteKey={HCAPTCHA_SITE_KEY}
                  onToken={setHcaptchaToken}
                  resetKey={captchaResetKey}
                />
              ) : null}

              {serverError ? <div className="text-sm font-medium text-red-600">{serverError}</div> : null}

              <Button
                type="submit"
                disabled={loading || (captchaRequired && !hcaptchaToken)}
                className="h-12 w-full rounded-2xl bg-[#FEA439] text-base font-semibold text-zinc-900 shadow-lg shadow-[#FEA439]/25 transition hover:bg-[#ffb04d] disabled:opacity-60"
              >
                {loading ? "Please wait…" : "Sign in to dashboard"}
              </Button>
            </form>
          </Form>
        </div>
      </AuthSplitCard>
    </div>
  );
}
