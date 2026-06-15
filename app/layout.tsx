import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "Focusly – Smart Study Timer & Pomodoro App for Students",
  description: "Boost your productivity with Focusly. Track study sessions, use Pomodoro timers, build streaks, monitor subjects, and stay focused with a beautiful distraction-free study dashboard.",
  keywords: "study timer, pomodoro timer, focus timer, student productivity app, study tracker, study planner, focus app, pomodoro app, exam preparation tool, study dashboard, student focus tool, study streak tracker, online study timer, productivity app for students, focusly",
  metadataBase: new URL("https://focusly.app"),
  
  // Open Graph metadata
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://focusly.app",
    title: "Focusly – Smart Study Timer & Pomodoro App for Students",
    description: "Boost your productivity with Focusly. Track study sessions, use Pomodoro timers, build streaks, monitor subjects, and stay focused with a beautiful distraction-free study dashboard.",
    siteName: "Focusly",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Focusly - Study Timer & Productivity App",
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Focusly | Study Timer, Pomodoro & Focus Tracker",
    description: "Boost your productivity with Focusly. Track study sessions, use Pomodoro timers, build streaks, monitor subjects, and stay focused with a beautiful distraction-free study dashboard.",
    images: ["/og-image.jpg"],
    creator: "@martin745943021",
  },

  // Additional metadata
  authors: [{ name: "Shubh" }],
  creator: "Shubh",
  applicationName: "Focusly",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/fav.png",
    apple: "/fav.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Focusly",
  },
  formatDetection: {
    telephone: false,
  },
  category: "Productivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/fav.png" type="image/png" />
        <link rel="shortcut icon" href="/fav.png" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
