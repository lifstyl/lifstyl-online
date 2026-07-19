import Image from "next/image";
import logo from "@/public/lifstyl-logo.png";

/**
 * The Lifstyl "lifstyl / real estate" wordmark (white, transparent PNG).
 * Designed to sit inside a navy badge, matching limitlesslifstyl.com.
 * `height` controls the rendered size; width scales to the logo's aspect ratio.
 */
export function Logo({
  height = 34,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src={logo}
      alt="Lifstyl Real Estate"
      height={height}
      priority
      className={`w-auto ${className}`}
      style={{ height, width: "auto" }}
    />
  );
}
