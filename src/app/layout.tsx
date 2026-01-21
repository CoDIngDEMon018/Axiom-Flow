import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ToastProvider } from "@/components/providers/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Weavy Clone - LLM Workflows",
  description: "Build powerful LLM workflows with a visual canvas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={cn(inter.className, "h-full antialiased")}>
          <ToastProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
