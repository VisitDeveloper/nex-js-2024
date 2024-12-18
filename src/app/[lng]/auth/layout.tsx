import { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full  min-h-svh flex justify-center items-center">
      {children}
    </div>
  );
}
