# Third Party Services

The infrastructure relies on three core third-party ecosystems.

## 1. Supabase (Database & Auth)
- **Role**: Primary robust BaaS (Backend-as-a-Service).
- **Architecture**: Open source alternative to Firebase housing PostgreSQL, Row-Level-Security, and WebSocket listeners.
- **Dependencies**: `@supabase/supabase-js`.
- **Location**: Instance initialized internally at `src/lib/supabase.ts`.

## 2. Google AI (Gemini)
- **Role**: Natural language processor rendering the "Crop Doctor".
- **Architecture**: LLM interface taking unstructured farmer queries (e.g., "my crops have yellow spots") and matching them with advice, alongside potential local product cross-selling.
- **Dependencies**: `@google/genai`.
- **Location**: Found inside `/context/AIContext.tsx` handling chat iteration calls asynchronously.

## 3. Sentry (Error Tracking)
- **Role**: Crash reporter and remote telemetry.
- **Architecture**: A JS bundle script intercepting critical exceptions thrown inside the browser (DOM bounds) outside standard try-catches.
- **Dependencies**: Bound via direct `<script>` integration in `index.html`.
- **Location**: Sentry is initialized sequentially before React roots via `Sentry.init` inside the `<head>` tag.
