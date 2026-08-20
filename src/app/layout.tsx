import type { Metadata } from "next";
import Script from "next/script";
import Intro from "@/components/Intro";
import AmbientSound from "@/components/AmbientSound";
import CursorFace from "@/components/CursorFace";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const GA_ID = "G-RE14FKKR6L";

export const metadata: Metadata = {
  title: "Joshua Jumbo — Selected Work",
  description: "Selected work and design stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/PPMori-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PPMori-SemiBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Intro>{children}</Intro>
        <AmbientSound />
        <CursorFace />
        <CookieConsent />

        {/* Google Analytics (gtag.js) — loads on every route. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
// Consent Mode v2 — deny by default until the visitor accepts (see CookieConsent).
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('config', '${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
