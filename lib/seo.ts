import { site } from "@/lib/data/site";
import { BASE_PATH } from "@/lib/utils";

/** Canonical origin, without the GitHub Pages sub-path. */
export const siteOrigin = site.siteUrl.replace(/\/+$/, "");

/** Build an absolute URL that includes the configured base path. */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin}${BASE_PATH}${normalized}`;
}
