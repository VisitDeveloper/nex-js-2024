'use client'
import React from 'react';
import "./globals.css";
import { ThemeProvider } from "provider/ThemeProvider";
import { dir } from "i18next";
import { AnimatePresence } from "motion/react";
import { DynamicObjectLiterals, MainLayout } from "components";
import { usePathname } from 'next/navigation';
import Head from 'next/head';

export default function RootLayout({
  children,
  // params
}: Readonly<{
  children: React.ReactNode;
  // params: any;
}>) {

  // lang={lng} dir={dir(lng)}
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');
  const isAdminPage = pathname.startsWith('/admin');
  console.log('pathname ', pathname.split('/').filter(Boolean)[0]);
  const routeObjectWithOutLayout: any = {
    auth: '/auth',
    admin: '/admin',
  }

  return (
    <html lang='en' dir='ltr'>
      <Head>
        <title>My Page Title</title>
      </Head>
      <body
        className={`antialiased bg-mainBackground overflow-x-hidden  `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >

          <AnimatePresence mode="popLayout" >

            <MainLayout className='overflow-x-hidden max-h-screen'>
              {!routeObjectWithOutLayout[pathname.split('/').filter(Boolean)[0]] && <DynamicObjectLiterals type='HeaderLayout' />}
              {children}
              {!routeObjectWithOutLayout[pathname.split('/').filter(Boolean)[0]] && <DynamicObjectLiterals type='FooterLayout' />}
            </MainLayout>

          </AnimatePresence>
        </ThemeProvider>
      </body>
    </html>
  );
}
