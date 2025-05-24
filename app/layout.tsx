import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";
import { Toaster as Sooner } from "@/components/ui/sonner";
import IdleTimerWrapper from "@/utills/IdleTimerWrapper";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bartech | WMS",
  description: "Bartech WMS",
  icons: "/images/bartech.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <NextTopLoader color="red" />
        <IdleTimerWrapper timeout={10 * 60 * 1000}>
          {" "}
          {/* 10 minutes */}
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Sooner />
            <Toaster />
            {children}
          </ThemeProvider>
        </IdleTimerWrapper>
      </body>
    </html>
  );
}
