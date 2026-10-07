import type { ImgHTMLAttributes } from "react";
declare global { interface Window { MERO_ASSETS: Record<string,string> } }
type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; fill?: boolean; priority?: boolean; quality?: number; placeholder?: string; blurDataURL?: string };
export default function Image({ src, fill, priority, quality, placeholder, blurDataURL, style, ...props }: Props) {
  const resolved = window.MERO_ASSETS[src] || src;
  const dimensions = fill ? { position: "absolute" as const, inset: 0, width: "100%", height: "100%", objectFit: "cover" as const } : {};
  return <img {...props} src={resolved} loading={priority ? "eager" : props.loading || "lazy"} decoding="async" style={{ ...dimensions, ...style }}/>;
}
