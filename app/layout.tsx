import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Service Provider Progress Tracker",
  description: "Track progress for all your service provider projects and clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
