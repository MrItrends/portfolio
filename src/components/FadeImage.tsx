"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * next/image that fades in once it has actually loaded (styled via
 * [data-loaded]). Handles images that finished loading before hydration.
 */
export default function FadeImage(props: ImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <Image
      {...props}
      alt={props.alt}
      ref={ref}
      onLoad={(e) => {
        setLoaded(true);
        props.onLoad?.(e);
      }}
      data-loaded={loaded ? "" : undefined}
    />
  );
}
