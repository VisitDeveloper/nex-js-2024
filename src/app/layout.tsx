'use client'
import React from 'react';
import "./globals.css";
import { ThemeProvider } from "provider/ThemeProvider";
import { dir } from "i18next";
import { AnimatePresence } from "motion/react";
import { DynamicObjectLiterals, MainLayout } from "components";
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
  // params: { lng },
}: Readonly<{
  children: React.ReactNode;
  // params: {
  //   lng: string
  // }
}>) {

  // lang={lng} dir={dir(lng)}
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <html lang='en' dir='ltr'>
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
            {/* <motion.div key={pathname}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
              }}

              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5
              }}
              className="bg-mainBackground"> */}
            {/* </motion.div> */}
            <MainLayout className='overflow-x-hidden max-h-screen'>
              {!isAuthPage && <DynamicObjectLiterals type='HeaderLayout' />}
              {children}
              {!isAuthPage && <DynamicObjectLiterals type='FooterLayout' />}
            </MainLayout>
            {/* <motion.div key={pathname}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
              }}

              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5
              }}
              className="bg-mainBackground"> */}
            {/* </motion.div> */}
          </AnimatePresence>
        </ThemeProvider>
      </body>
    </html>
  );
}
