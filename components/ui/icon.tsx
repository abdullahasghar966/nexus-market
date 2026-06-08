import { cn } from "@/lib/utils";
import type { MaterialIcon } from "@/lib/icons";

interface IconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  name: MaterialIcon;
  filled?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  size?: number;
  grade?: number;
}

/** Renders a Material Symbols Outlined glyph with controllable axes. */
export function Icon({
  name,
  filled = false,
  weight = 400,
  size = 24,
  grade = 0,
  className,
  style,
  ...props
}: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined select-none leading-none", className)}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${size}`,
        ...style,
      }}
      {...props}
    >
      {name}
    </span>
  );
}
