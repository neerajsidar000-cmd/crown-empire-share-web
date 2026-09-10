// Crown Empire branded product share page.
// Route: /p/<product UUID>
//
// Server-rendered so link crawlers (WhatsApp, Telegram,
// Facebook, etc.) receive Open Graph metadata without executing JS.

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
}

const DEFAULT_SUPABASE_URL =
  "https://oafmjizyndfnhvjpvlgv.supabase.co";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function absoluteImageUrl(requestUrl: URL, raw: unknown): string {
  const candidate = String(raw ?? "").trim();

  if (!candidate) return "";

  try {
    const parsed = new URL(candidate, requestUrl.origin);

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

function htmlPage(args: {
  title: string;
  description: string;
  priceLine: string;
  imageUrl: string;
  canonicalUrl: string;
  productId?: string;
  available: boolean;
}): string {
  const imageMeta = args.imageUrl
    ? `<meta property="og:image" content="${escapeHtml(args.imageUrl)}" />
<meta name="twitter:image" content="${escapeHtml(args.imageUrl)}" />`
    : "";

  const appIntent = args.available
    ? `intent://product?id=${encodeURIComponent(
        args.productId ?? ""
      )}#Intent;scheme=crownempire;package=com.crownempire.app;S.browser_fallback_url=${encodeURIComponent(
        args.canonicalUrl
      )};end`
    : "";

  const cta = args.available
    ? `<a class="cta" href="${escapeHtml(
        appIntent
      )}">Open in Crown Empire App</a>
<p class="hint">If the app is not installed, this page remains available in your browser.</p>`
    : `<p class="unavailable">This product is no longer available.</p>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<title>${escapeHtml(args.title)} — Crown Empire</title>

<link rel="canonical" href="${escapeHtml(args.canonicalUrl)}" />

<meta
  name="description"
  content="${escapeHtml(args.description)}"
/>

<meta property="og:type" content="product" />
<meta property="og:site_name" content="Crown Empire" />
<meta property="og:title" content="${escapeHtml(args.title)}" />
<meta
  property="og:description"
  content="${escapeHtml(args.description)}"
/>
<meta property="og:url" content="${escapeHtml(args.canonicalUrl)}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(args.title)}" />
<meta
  name="twitter:description"
  content="${escapeHtml(args.description)}"
/>

${imageMeta}

<style>
:root {
  color-scheme: dark;
}

body {
  margin: 0;
  background: #080808;
  color: #f4f4f4;
  font-family: Inter, Roboto, Arial, sans-serif;
}

main {
  max-width: 560px;
  margin: auto;
  padding: 28px 20px 48px;
}

.brand {
  font-size: 12px;
  letter-spacing: .18em;
  color: #d9af48;
  font-weight: 700;
  margin-bottom: 18px;
}

.card {
  background: #111;
  border: 1px solid #252525;
  border-radius: 18px;
  overflow: hidden;
}

.product-image {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  background: #171717;
}

.body {
  padding: 20px;
}

h1 {
  font-size: 26px;
  line-height: 1.15;
  margin: 0 0 10px;
}

.price {
  font-size: 20px;
  color: #d9af48;
  font-weight: 800;
  margin-bottom: 12px;
}

p {
  line-height: 1.55;
  color: #bdbdbd;
}

.cta {
  display: block;
  margin-top: 22px;
  text-align: center;
  background: #d9af48;
  color: #080808;
  text-decoration: none;
  font-weight: 800;
  padding: 15px 16px;
  border-radius: 12px;
}

.hint {
  font-size: 12px;
  text-align: center;
  margin: 12px 0 0;
  color: #777;
}

.unavailable {
  text-align: center;
  color: #d77;
}
</style>

</head>

<body>

<main>

<div class="brand">CROWN EMPIRE</div>

<section class="card">

${
  args.imageUrl
    ? `<img
        class="product-image"
        src="${escapeHtml(args.imageUrl)}"
        alt="${escapeHtml(args.title)}"
      />`
    : ""
}

<div class="body">

<h1>${escapeHtml(args.title)}</h1>

<div class="price">
${escapeHtml(args.priceLine)}
</div>

<p>
${escapeHtml(args.description)}
</p>

${cta}

</div>

</section>

</main>

</body>
</html>`;
}

async function loadProduct(
  env: Env,
  id: string
): Promise<any | null> {
  const supabaseUrl = (
    env.SUPABASE_URL || DEFAULT_SUPABASE_URL
  ).replace(/\/$/, "");

  const key = env.SUPABASE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error(
      "Missing SUPABASE_PUBLISHABLE_KEY environment variable"
    );
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/rpc/get_public_product`,
    {
      method: "POST",

      headers: {
        "content-type": "application/json",
        "apikey": key,
        "authorization": `Bearer ${key}`,
      },

      body: JSON.stringify({
        p_product_id: id,
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return Array.isArray(data)
    ? data[0] ?? null
    : data ?? null;
}

export async function onRequestGet(
  context: {
    request: Request;
    params: Record<string, string>;
    env: Env;
  }
): Promise<Response> {
  const requestUrl = new URL(context.request.url);

  const productId = String(
    context.params.id || ""
  ).trim();

  if (!isUuid(productId)) {
    return new Response("Not found", {
      status: 404,
    });
  }

  try {
    const product = await loadProduct(
      context.env,
      productId
    );

    if (!product) {
      const canonicalUrl =
        `https://${requestUrl.host}/p/${productId}`;

      return new Response(
        htmlPage({
          title: "Product unavailable",

          description:
            "This product is no longer available on Crown Empire.",

          priceLine: "",

          imageUrl: "",

          canonicalUrl,

          available: false,
        }),
        {
          status: 404,

          headers: {
            "content-type":
              "text/html; charset=utf-8",

            "cache-control":
              "public, max-age=60",
          },
        }
      );
    }

    const canonicalUrl =
      `https://${requestUrl.host}/p/${productId}`;

    const imageUrl =
      absoluteImageUrl(
        requestUrl,
        product.image_url
      );

    const price = Number(product.price);

    const mrp = Number(product.mrp);

    const priceLine =
      Number.isFinite(mrp) && mrp > price
        ? `₹${Math.round(price).toLocaleString(
            "en-IN"
          )}  •  was ₹${Math.round(mrp).toLocaleString(
            "en-IN"
          )}`
        : `₹${Math.round(price).toLocaleString(
            "en-IN"
          )}`;

    return new Response(
      htmlPage({
        title: String(product.title),

        description: String(
          product.description ||
            "Premium product from Crown Empire."
        ),

        priceLine,

        imageUrl,

        canonicalUrl,

        productId,

        available: true,
      }),
      {
        status: 200,

        headers: {
          "content-type":
            "text/html; charset=utf-8",

          "cache-control":
            "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",

          "x-content-type-options":
            "nosniff",

          "referrer-policy":
            "strict-origin-when-cross-origin",
        },
      }
    );
  } catch {
    return new Response(
      "Crown Empire share service temporarily unavailable",
      {
        status: 503,

        headers: {
          "content-type":
            "text/plain; charset=utf-8",

          "retry-after": "30",
        },
      }
    );
  }
}
