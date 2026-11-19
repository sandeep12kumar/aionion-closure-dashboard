# Aionion Capital – Account Closure Dashboard (UI)

React + Vite + Tailwind back-office UI (Dashboard, Maker & Checker, admin logs).

- `npm ci && npm run dev` - local dev on http://localhost:5174 (proxies `/api` to the API on :5100, see `vite.config.js`)
- `npm run build` - production build in `dist/`

## AWS Amplify

Amplify builds with `amplify.yml`. In **Hosting → Rewrites and redirects** add the rules from `amplify-rewrites.json`
(replace the API Gateway URL): `/api/<*>` is proxied to the dashboard API (Lambda), so the `SameSite=Strict` session cookie works,
and every other path falls back to `index.html`.
