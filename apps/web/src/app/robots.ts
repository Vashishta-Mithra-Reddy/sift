import type { MetadataRoute } from "next";

const siteUrl = "https://sift.v19.tech";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/policies", "/policies/privacy", "/policies/terms"],
        disallow: [
          "/api/",
          "/ai",
          "/dashboard",
          "/echoes",
          "/learn",
          "/login",
          "/settings",
          "/sift/",
          "/sifts",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
