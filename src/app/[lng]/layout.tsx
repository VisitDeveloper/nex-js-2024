import type { Metadata } from "next";
import "./../globals.css";
import { ThemeProvider } from "provider/ThemeProvider";
import { dir } from "i18next";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

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
        className={` antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
