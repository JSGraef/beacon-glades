import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Work_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "600", "700", "800"],
});

const work = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Beacon Glades Disc Golf",
  description: "A storied championship course carved through the whispers of an abandoned mountain summer camp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", "font-sans", geist.variable)}>
      <body className={`${jakarta.variable} ${work.variable} font-body antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
