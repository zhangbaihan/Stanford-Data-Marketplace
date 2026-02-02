import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Data",
  description: "Browse and explore datasets",
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
