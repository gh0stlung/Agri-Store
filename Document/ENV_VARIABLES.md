# Environment Variables

This project requires certain keys populated securely in the hosting environment (and mirrored in `.env` for local testing).

## Required Variables

- `VITE_SUPABASE_URL`: The core routing URL for the Supabase Instance (e.g., `https://xyz.supabase.co`).
- `VITE_SUPABASE_ANON_KEY`: The public anonymous key. It grants access governed strictly by Row Level Security (RLS) rules established inside the SQL structure.
- `VITE_GEMINI_API_KEY`: Maps connection to Google's Generative AI endpoint. Utilized primarily in `AIContext.tsx` to drive the Crop Doctor feature.

## `.env.example` Mapping
Ensure you duplicate `.env.example` to `.env` during local bootstrapping. 
*(Note: Exposing `VITE_GEMINI_API_KEY` directly to standard clients implies the absence of a proxy server, meaning the key is visually exposed to the browser. As a beta preview structure, this is currently accepted, but stands as a point of refinement for strict production).*
