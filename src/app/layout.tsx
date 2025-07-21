import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "ブログビューア - モダンなブログ管理",
  description: "モダンなデザインとシームレスな統合によるエレガントなブログ管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
