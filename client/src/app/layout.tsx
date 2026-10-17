import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EnChat | Real-Time Messaging",
  description: "Connect, chat, and build together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}