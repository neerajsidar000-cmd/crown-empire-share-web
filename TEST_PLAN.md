# Crown Empire share-link verification plan

A live public product is currently present in Supabase, so this exact test URL should resolve after the share host is deployed:

`https://link.crownempire.publicvm.com/p/ac5e037f-dfe6-4054-a4f0-8d50cabfe10a`

Expected product data from the current production database:
- Title: Dragon Power Graphic Tee
- Price: ₹599
- MRP: ₹999
- Image URL: public Supabase Storage URL

Expected checks:

1. HTTP GET returns 200 HTML for the product URL.
2. HTML contains canonical URL on `link.crownempire.publicvm.com`.
3. HTML contains `og:title`, `og:description`, `og:image`, and `og:url`.
4. Browser renders product image/title/price.
5. Android 12+ with a release-signed installed app opens ProductDetailsActivity directly after App Link verification.
6. Android without the app stays on the web page.
7. Old Supabase function links continue to render as a backward-compatible fallback.
8. Invalid UUIDs return HTTP 404 without querying the database.
