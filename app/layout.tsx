// import { Clarity } from "@/components/Clarity";
import { Toaster } from "@/components/ui/toaster";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Screen Share - Share Your Screen Instantly",
    description: "Share your screen instantly with anyone using a simple room code. No downloads or sign-ups required.",
    keywords: "screen sharing, webrtc, online screen share, browser screen sharing, free screen sharing"
} satisfies Metadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                {/* <Clarity /> */}
                <Toaster />
            </body>
        </html>
    );
}
