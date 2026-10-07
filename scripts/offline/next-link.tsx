import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { navigate } from "./navigation";
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; prefetch?: boolean; scroll?: boolean; replace?: boolean };
export default function Link({ href, onClick, prefetch, scroll, replace, ...props }: Props) {
  const internal = href.startsWith("/");
  function click(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (internal && !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && props.target !== "_blank") { event.preventDefault(); navigate(href); }
  }
  return <a {...props} href={internal ? `#${href}` : href} onClick={click}/>;
}
