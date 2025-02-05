import React from 'react';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // back-login
    <div className="w-full   min-h-svh flex justify-center items-center">
      {children}
    </div>
  );
}
