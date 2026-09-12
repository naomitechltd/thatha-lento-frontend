# Thatha Lento — frontend

A Vite + React project wired up to the `thatha-lento-backend` API. This is
the real, deployable version of the storefront (the earlier in-chat preview
used fake in-browser storage; this one talks to your actual server).

## 1. Local setup

Make sure the backend is running first (see its own README), then:

```bash
cd thatha-lento-frontend
npm install
cp .env.example .env
```

Edit `.env` if your backend isn't on the default local port:
```
VITE_API_URL=http://localhost:4000
```

Then run it:
```bash
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`) — open that
in a browser.

## 2. Trying it out

- **Shop** as a guest, add items to your bag.
- **Checkout** will ask you to sign up / log in first — this hits the real
  `/auth/signup` and `/auth/login` endpoints, with passwords hashed on the
  server.
- **Admin** (top nav) — sign in with an email plus one of the codes set in
  the backend's `.env` (`ADMIN_FULL_CODE` / `ADMIN_BUGS_ONLY_CODE`). The
  code is checked only on the server; nothing about admin access lives in
  this frontend code.

## 3. Before you deploy: update `CORS_ORIGIN`

Once this frontend has a live URL (see below), go back to your backend's
environment variables (in Render/Railway's dashboard) and set
`CORS_ORIGIN` to that exact URL — otherwise the deployed frontend won't be
allowed to call the API.

## 4. Deploying

**Vercel**
1. Push this folder to its own GitHub repo.
2. [vercel.com](https://vercel.com) → New Project → import that repo.
3. Framework preset: Vite (usually auto-detected).
4. Add an environment variable: `VITE_API_URL` = your live backend URL
   (e.g. `https://thatha-lento-backend.onrender.com`).
5. Deploy — you'll get a URL like `https://thatha-lento.vercel.app`.

**Netlify** works the same way: build command `npm run build`, publish
directory `dist`, same `VITE_API_URL` environment variable.

## 5. Connecting your own domain

Once both are deployed and working on their default URLs:
1. Buy a domain (Namecheap, Cloudflare, etc.).
2. In Vercel/Netlify, add your domain to the frontend project and follow
   their DNS instructions.
3. Optionally point a subdomain (e.g. `api.yourdomain.com`) at the backend
   the same way, and update `VITE_API_URL` + `CORS_ORIGIN` to match.

## What's still a placeholder

- `WHATSAPP_NUMBER` and `PAY_DETAILS` near the top of `src/App.jsx` — update
  with your real number and bank details before going live.
- Product photos — every item currently shows a text placeholder where an
  image would go. Adding real images means storing them somewhere (e.g.
  Cloudflare R2 or S3) and adding an `imageUrl` field to products, both in
  the backend schema and this UI — say the word if you want that added.
