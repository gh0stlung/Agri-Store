# Deployment Guide

The application is deployed on a Serverless Edge environment (e.g., Vercel or Google Cloud Run).

## Build Process

1. **Compilation**: The Vite builder evaluates `vite.config.ts`, bundling the React application into the `/dist` directory.
2. **Environment File Mapping**: During the build, all standard Variables inside `.env` referencing `VITE_*` are compiled and hardcoded into the output JS. 
3. **Artifact Generation**: Contains an optimized `index.html` referencing CSS chunks, JS chunks, and raw assets.

## CI/CD and Commands

- **Local Dev Server**: `npm run dev` starts the Node.js preview server.
- **Linter**: `npm run lint` strictly validates TS compilation without emitting using `tsc --noEmit`.
- **Builder**: `npm run build` runs `vite build`.

## Vercel Specifications
A `vercel.json` file is situated in the root to accommodate single page client-side routing on static endpoints:
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This forces Vercel to route all deep links (e.g. `domain.com/catalog`) down into React to be dynamically handled, preventing `404` fatal errors.
