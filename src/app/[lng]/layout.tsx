'use client'
import "./../globals.css";
import { ThemeProvider } from "provider/ThemeProvider";
import { dir } from "i18next";
import { AnimatePresence } from "motion/react";
import { DynamicObjectLiterals } from "components";

export default function RootLayout({
  children,
  params: { lng },
}: Readonly<{
  children: React.ReactNode;
  params: {
    lng: string
  }
}>) {

  return (
    <html lang={lng} dir={dir(lng)}>
      <body
        className={`antialiased bg-mainBackground overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DynamicObjectLiterals type='HeaderLayout' />
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
              {children}
          </AnimatePresence>
          <DynamicObjectLiterals type='FooterLayout' />
        </ThemeProvider>
      </body>
    </html>
  );
}
