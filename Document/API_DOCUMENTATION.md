# API Documentation

The application operates as a **Serverless/BaaS (Backend-as-a-Service) Client Application**, meaning there is no custom Express or Node.js API server for standard routes. 

Instead, the client calls **Supabase** over its PostgREST API seamlessly via the `@supabase/supabase-js` SDK, and connects to **Google Gemini** using its official SDK.

## Supabase Endpoints (Implicit)

- **`supabase.auth.*`**: User signup, sign-in, OAuth, session management.
- **`supabase.from('products').select('*')`**: Fetches the active catalog.
- **`supabase.from('orders').insert([...])`**: Client securely inserts finalized orders. RLS (Row Level Security) ensures typical users can only view their orders.
- **`supabase.from('delivery_locations').upsert([...])`**: Delivery coordinates are pushed iteratively from `navigator.geolocation.watchPosition` to Supabase.

## External APIs

### 1. Google Gemini API (`@google/genai`)
- **Integration**: Used within the `<AIChatDrawer />` Component.
- **Functionality**: Replaces standard customer service by acting as a "Crop Doctor". Users input descriptions of damaged crops (or text), and the AI prescribes solutions out of the local inventory or general best practices.
- **Key Location**: Usually protected or handled purely on the client via `VITE_GEMINI_API_KEY` (note: typical standard requires proxying this, but in strict preview mode this runs in-browser).

### 2. Sentry
- **Integration**: Included via script tag in `index.html`.
- **Functionality**: Real-time error monitoring and crash reporting (`Sentry.init`, `Sentry.captureException`).
