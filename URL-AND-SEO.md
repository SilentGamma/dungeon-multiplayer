# Larp Dungeon URL and search metadata

The hosting address has NOT been changed by this source update. Render access is required to inspect/rename the existing service and verify the actual assigned hostname. Prefer the shortest available branded Render slug, such as larp or larp-dungeon. Do not create a second paid service or purchase a domain. larp.play requires ownership and DNS configuration; it is not registered or claimed here. Do not rename render.yaml speculatively because that can identify a different Blueprint service.

SEO is ready for the confirmed hostname: publicOrigin selects PUBLIC_SITE_URL, then RENDER_EXTERNAL_URL, then the existing https://dungeon-multiplayer.onrender.com fallback. Only HTTPS origins without credentials are accepted. Canonical URL, Open Graph URL/image, JSON-LD and sitemap are server-rendered from that origin; request Host is never trusted. After verifying a custom domain is live, set PUBLIC_SITE_URL to its origin and deploy. Verify all metadata and sitemap resolve to the same live host.

Added descriptive title/meta description, Open Graph/Twitter preview with 1200×630 PNG, SVG favicon, VideoGame structured data, robots.txt and a root-only sitemap.xml. Transient lobbies are not listed in the sitemap. API/health JSON carries noindex; robots rules are discovery guidance, not access controls. No hidden keyword text, invented ratings or added descriptive menu copy. No guarantee of search ranking or immediate indexing.

The social graphic is a code-drawn brand card. Recreate using scripts/render-social.py (Pillow and DejaVu Sans). Existing character artwork is unchanged.

References: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics ; https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap ; https://schema.org/VideoGame ; https://render.com/docs/custom-domains .
