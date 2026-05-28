# House of Chops — Website

Premium lamb chop brand site. Built with Next.js 14 (App Router) + Framer Motion.

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Edit content
All copy, menu items, prices, links and contact info live in **`lib/data.js`**.
Replace the `talabatUrl`, `instagram`, and `phone` placeholders with your real values.

## Add your photos
Drop images into **`public/images/`** using the filenames referenced in `lib/data.js`
(e.g. `signature-rack.jpg`) plus `hero.jpg` and `story.jpg`. The placeholders show the
expected filename in each slot until you add the real file.

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Framework auto-detects as Next.js. Click Deploy. Done.

Or via CLI:
```bash
npm i -g vercel
vercel
```
