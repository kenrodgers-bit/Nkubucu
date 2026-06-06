import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "School Photo Hub",
    template: "%s | School Photo Hub",
  },
  description:
    "A school photo preview hub that links students to complete cloud albums.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      {
        url: "/brand/schoolphotohub-favicon.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
    apple: [
      {
        url: "/brand/schoolphotohub-icon.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  },
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
