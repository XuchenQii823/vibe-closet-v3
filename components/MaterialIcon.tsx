import { CSSProperties } from "react";

// Material Symbols 图标封装：与原型一致用 <span class="material-symbols-outlined">。
interface Props {
  name: string;
  className?: string;
  filled?: boolean;
  style?: CSSProperties;
}

export default function MaterialIcon({ name, className = "", filled, style }: Props) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1", ...style } : style}
    >
      {name}
    </span>
  );
}
