"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Shows a poster image, then swaps to an autoplaying video after `delay` ms.
 * Fills its (positioned) parent — set the aspect ratio on the wrapper.
 */
export default function SwapMedia({
  poster,
  video,
  alt,
  delay = 10000,
  sizes,
  imgClass,
  videoClass,
  priority,
}: {
  poster: string;
  video: string;
  alt: string;
  delay?: number;
  sizes?: string;
  imgClass?: string;
  videoClass?: string;
  priority?: boolean;
}) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowVideo(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (showVideo) {
    const type = video.endsWith(".mp4") ? "video/mp4" : "video/webm";
    return (
      <video className={videoClass} autoPlay muted loop playsInline>
        <source src={video} type={type} />
      </video>
    );
  }

  return (
    <Image
      src={poster}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={imgClass}
    />
  );
}
