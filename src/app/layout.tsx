import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://scholarships.smccl.ca";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "UVic Scholarships — Search 1,300+ University of Victoria Awards",
    template: "%s | UVic Scholarships",
  },
  description:
    "Search and filter 1,300+ University of Victoria scholarships, bursaries, and awards. Find UVic entrance scholarships, in-course awards, and graduate funding.",
  keywords: [
    "UVic scholarships",
    "University of Victoria scholarships",
    "UVic awards",
    "UVic bursaries",
    "UVic entrance scholarships",
    "UVic graduate funding",
    "UVic financial aid",
    "Victoria BC scholarships",
  ],
  openGraph: {
    title: "UVic Scholarships — Search 1,300+ University of Victoria Awards",
    description:
      "Search and filter 1,300+ University of Victoria scholarships, bursaries, and awards. Find UVic entrance scholarships, in-course awards, and graduate funding.",
    url: BASE_URL,
    siteName: "UVic Scholarships",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UVic Scholarships — Search 1,300+ University of Victoria Awards",
    description:
      "Search and filter 1,300+ University of Victoria scholarships, bursaries, and awards.",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
		<Analytics />
      </body>
    </html>
  );
}
