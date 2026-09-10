# Crown Empire — Branded Product Share Host

This is the public web layer for product links:

`https://link.crownempire.publicvm.com/p/<product-uuid>`

The site uses a Cloudflare Pages Function to render server-side HTML with
Open Graph/Twitter metadata, while Supabase remains the authoritative
product backend. Cloudflare Pages supports dynamic file-based routes such
as `functions/p/[id].ts`.

## Required deployment setup

1. Create a Cloudflare Pages project from this directory.
2. Deploy the project.
3. Add the custom domain `link.crownempire.publicvm.com` in the Pages
   project's **Custom domains** section.
4. In DNSExit, create the CNAME record:

   `link.crownempire.publicvm.com` -> `<your-project>.pages.dev`

5. Replace the placeholders in
   `public/.well-known/assetlinks.json` with the SHA-256 fingerprints for
   the Android signing certificate(s) that you actually use.

The Android App Link cannot become verified until the assetlinks fingerprint
exactly matches the installed APK/AAB signing certificate.

## Local smoke test

Run a local Pages-compatible preview with Wrangler after installing it:

```bash
npx wrangler pages dev .
```

Then open `/p/<real-product-uuid>` locally.
