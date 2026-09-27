import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://a-guide-to-install-malware-on-my-friends-pc.vercel.app"),
  title: "“MUI”hehe - Pre-Event Campaign",
  description: "Reality is initializing... MasterChef UI 2026.",
  icons: {
    icon: "/icon.jpeg",
    shortcut: "/icon.jpeg",
    apple: "/icon.jpeg",
  },
  openGraph: {
    title: "“MUI”hehe - Pre-Event Campaign",
    description: "Reality is initializing... MasterChef UI 2026.",
    images: [
      {
        url: "/icon.jpeg",
        alt: "MUI Event Icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "“MUI”hehe - Pre-Event Campaign",
    description: "Reality is initializing... MasterChef UI 2026.",
    images: ["/icon.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col font-body">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

