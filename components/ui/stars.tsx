import { cn } from "@/lib/utils";

interface StarsProps {
  /** Rating from 0–5; values render full / half / empty Material stars. */
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  count?: number;
}

/** Display-only star rating using Material Symbols (amber accent). */
export function Stars({
  rating,
  size = 16,
  className,
  showValue = false,
  count,
}: StarsProps) {
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const half = clamped - full >= 0.5;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="flex items-center text-accent"
        role="img"
        aria-label={`Rated ${clamped.toFixed(1)} out of 5`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const icon =
            i < full ? "star" : i === full && half ? "star_half" : "star_border";
          const filled = icon !== "star_border";
          return (
            <span
              key={i}
              className="material-symbols-outlined"
              style={{
                fontSize: `${size}px`,
                fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'opsz' ${size}`,
              }}
            >
              {icon}
            </span>
          );
        })}
      </span>
      {showValue && (
        <span className="text-label-sm font-medium text-on-surface-variant">
          {clamped.toFixed(1)}
          {typeof count === "number" && ` (${count})`}
        </span>
      )}
    </span>
  );
}
