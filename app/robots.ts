import type { MetadataRoute } from "next";
import { absoluteUrl, siteOrigin } from "@/lib/seo";
import { BASE_PATH } from "@/lib/utils";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const scope = BASE_PATH || "";

  return {
    rules: [
      {
        userAgent: "*",
        allow: `${scope}/`,
        disallow: [`${scope}/legacy/`],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteOrigin,
  };
}
