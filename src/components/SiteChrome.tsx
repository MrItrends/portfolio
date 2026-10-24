"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import Intro from "./Intro";
import AmbientSound from "./AmbientSound";
import CookieConsent from "./CookieConsent";
import ChatWidget from "./ChatWidget";

const GA_ID = "G-RE14FKKR6L";

/**
 * Everything that wraps the public portfolio — preloader, ambient sound,
 * cookie banner, the digital-Joshua chat and analytics. The private /admin
 * app opts out of all of it.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <Intro>{children}</Intro>
      <AmbientSound />
      <CookieConsent />
      <ChatWidget />

      {/* Google Analytics (gtag.js) — loads on every public route. */}
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
    </>
  );
}
