# Nisja Studio — website

The website for **Nisja Studio**: modern websites and logos for businesses.
Plain HTML, CSS and JavaScript, so there's no build step. Open `index.html` in a browser to see it.

## Files

```
index.html          the whole page (Albanian text is written here)
css/style.css       all styling (brand colours are at the top)
js/main.js          language switch (AL/EN), mobile menu, scroll progress
js/hero-build.js    the hero animation: code typing + website assembling
js/effects.js       dot field, headline decode, reveals, cursor, tilt,
                    process line, footer arrow, contact form terminal
assets/             favicon, app icon, social share image
assets/logo/        logo files (SVG + PNG) and the profile picture
assets/work/        project screenshots (tall images, they scroll on hover)
```

All animations switch off automatically for visitors who turn on "reduce motion" in their system settings.

## Hero animation

The example businesses typed out in the hero (Bella Pizza, Barber 21, Iron Gym) are listed at the top of `js/hero-build.js` in `PROJECTS`. Change names, colours, texts or prices there, or add another one.

## Common edits

- **Change text:** Albanian text is in `index.html`. English text is in `js/main.js`, in the `EN` list, matched by the same `data-i18n` key.
- **Add a project:** copy one `<article class="work-card tilt">` block in `index.html`, change the links, text and image. Use a tall screenshot (a few screens stitched top to bottom) so the hover-scroll effect has something to scroll through.
- **Change prices:** look for `€300`, `€550`, `€900` in `index.html` (and the matching options in the contact form).

## Contact form

The form sends messages to **nisjastudio@gmail.com** through [FormSubmit](https://formsubmit.co) (free, no account).
The **first** time someone submits the form, FormSubmit emails that inbox an activation link. Click it once, and every message after that arrives normally.
Send yourself a test message right after the site goes live.

## SEO

Already set up: page title and description, social-share preview (`assets/og-image.png`), structured business data for Google (the `application/ld+json` block in `index.html`), `robots.txt`, `sitemap.xml` and `site.webmanifest`.

All of these point to `https://nisja.vercel.app/`. When you buy your own domain, search for that address and replace it everywhere in `index.html`, `robots.txt` and `sitemap.xml`.

After the site is live, add it to [Google Search Console](https://search.google.com/search-console) and submit `sitemap.xml`, so Google finds it faster. Creating a free Google Business Profile for Nisja Studio helps local search too.

## Hosting

The site is live at **https://nisja.vercel.app/**, deployed by Vercel from this GitHub repository. Every push to `main` redeploys it automatically within a minute.

A custom domain (e.g. `nisjastudio.com`) can be added in the Vercel project under **Settings → Domains**. Then update the URLs as described in the SEO section.

## Security

`vercel.json` sends strict security headers on every page (Content-Security-Policy, HSTS, no framing by other sites, no MIME sniffing, a privacy-friendly referrer policy, and camera/mic/location switched off).
Because of the Content-Security-Policy:

- **No inline JavaScript.** Put scripts in a `.js` file and load it with `<script src="...">`. `<script>` blocks with code inside, and `onclick=`/`onerror=` attributes, are blocked by the browser. (`application/ld+json` blocks are fine: they are data, not code.)
- **Everything loads from this site.** Fonts are self-hosted in `assets/fonts/`. To use another outside service (analytics, maps embed, another form service), add its address to the matching line in `vercel.json` first.
- The contact form may only send to `formsubmit.co`.

`/.well-known/security.txt` tells people how to report a security problem. Renew its `Expires` date before November 2027.
