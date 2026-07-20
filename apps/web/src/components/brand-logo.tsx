import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, height = 20 }: { className?: string; height?: number }) {
  return (
    <Image
      src="/logo.webp"
      alt="La Vie"
      width={height * (275 / 78)}
      height={height}
      priority
      className={cn("h-auto w-auto object-contain", className)}
      style={{ height }}
    />
  );
}
