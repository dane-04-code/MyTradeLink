import { cn } from "@/lib/utils";

/**
 * The official Mytradelink wordmark: MY.TRADE.LINK rendered in the display
 * font with brand-orange separator dots. The container controls the size
 * (text-base, text-xl, etc.) and colour for the letters; the dots are
 * always brand orange.
 *
 * Single source of truth — change here and every header/footer updates.
 */
export function Wordmark({
  className,
  as: Tag = "span",
}: {
  className?: string;
  as?: "span" | "div" | "h1" | "h2";
}) {
  return (
    <Tag className={cn("font-display tracking-tight", className)}>
      MY<span className="text-brand">.</span>TRADE<span className="text-brand">.</span>LINK
    </Tag>
  );
}
