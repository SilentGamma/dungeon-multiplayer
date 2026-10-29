# Larp Dungeon URL and search metadata

The primary game URL is https://larpdungeon.onrender.com . Render assigned the old service a fixed slug; changing its display name did not change that slug. A new free service was created from the same GitHub main branch in the same Oregon region:

- Primary: `srv-dbhn89tg1s2s73agp4f0`, name/slug `larpdungeon`.
- Legacy: `srv-dbgb2k6gekts738diu30`, name/slug `dungeon-multiplayer`.

The legacy home/index, robots and sitemap URLs redirect with HTTP 301 to the primary address. API, socket, asset and health routes are not redirected. New visitors use the new server for all lobby sessions; the deployment remains free. The existing service is retained to keep old links forwarding. No custom domain was purchased.

SEO is ready for the confirmed hostname: publicOrigin selects PUBLIC_SITE_URL, then RENDER_EXTERNAL_URL, then the https://larpdungeon.onrender.com fallback. Only HTTPS origins without credentials are accepted. Canonical URL, Open Graph URL/image, JSON-LD and sitemap are server-rendered from that origin; request Host is never trusted. After verifying a custom domain is live, set PUBLIC_SITE_URL to its origin and deploy. Verify all metadata and sitemap resolve to the same live host.

Added descriptive title/meta description, Open Graph/Twitter preview with 1200×630 PNG, SVG favicon, VideoGame structured data, robots.txt and a root-only sitemap.xml. Transient lobbies are not listed in the sitemap. API/health JSON carries noindex; robots rules are discovery guidance, not access controls. No hidden keyword text, invented ratings or added descriptive menu copy. No guarantee of search ranking or immediate indexing.

The social graphic is a code-drawn brand card. Recreate using scripts/render-social.py (Pillow and DejaVu Sans). Existing character artwork is unchanged.

References: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics ; https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap ; https://schema.org/VideoGame ; https://render.com/docs/custom-domains .
