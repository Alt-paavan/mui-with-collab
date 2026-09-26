import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MasterChef UI 2026 - Pre-Event Campaign",
  description: "Reality is initializing... MasterChef UI 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
