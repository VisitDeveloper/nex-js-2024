import { Suspense } from "react";
import AccountSupportClient from "components/specific_elements/account/account-support-client";

export default function AccountSupportPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Support</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Chat with our team — open a conversation to read messages; the list updates when you send or start a
          thread.
        </p>
      </div>
      <Suspense
        fallback={<p className="text-sm text-zinc-500">Loading support…</p>}
      >
        <AccountSupportClient />
      </Suspense>
    </main>
  );
}
