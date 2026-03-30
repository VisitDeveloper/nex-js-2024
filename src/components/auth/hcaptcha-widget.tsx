"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string | number;
      reset: (widgetId?: string | number) => void;
      remove: (widgetId: string | number) => void;
    };
  }
}

let hcaptchaScriptPromise: Promise<void> | null = null;

function loadHcaptchaScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.hcaptcha) return Promise.resolve();
  if (hcaptchaScriptPromise) return hcaptchaScriptPromise;

  hcaptchaScriptPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (window.hcaptcha) resolve();
      else reject(new Error("hCaptcha unavailable"));
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="js.hcaptcha.com/1/api.js"]'
    );
    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("hCaptcha script failed")), {
        once: true,
      });
      if (window.hcaptcha) finish();
      return;
    }

    const s = document.createElement("script");
    s.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => finish();
    s.onerror = () => reject(new Error("hCaptcha script failed"));
    document.head.appendChild(s);
  });
  return hcaptchaScriptPromise;
}

type HcaptchaWidgetProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
  /** Increment after a failed login to obtain a fresh challenge. */
  resetKey?: number;
};

export function HcaptchaWidget({ siteKey, onToken, resetKey = 0 }: HcaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | number | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const el = containerRef.current;
      if (!el || !siteKey) return;

      try {
        await loadHcaptchaScript();
      } catch {
        onTokenRef.current(null);
        return;
      }

      const mountEl = containerRef.current;
      if (cancelled || !mountEl || !window.hcaptcha) return;

      if (widgetIdRef.current != null) {
        try {
          window.hcaptcha.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
        widgetIdRef.current = null;
      }

      mountEl.innerHTML = "";
      widgetIdRef.current = window.hcaptcha.render(mountEl, {
        sitekey: siteKey,
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
      });
    };

    void run();

    return () => {
      cancelled = true;
      if (widgetIdRef.current != null && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, resetKey]);

  return <div ref={containerRef} className="min-h-[78px]" />;
}

