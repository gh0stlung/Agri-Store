# Feature Roadmap

## Short-Term Objectives
- **Product Variants Expansion**: Fully support size (e.g. 1kg, 5kg, 50kg bag) and dynamic pricing structures on the `Admin.tsx` item creation panel.
- **Offline PWA Capabilities**: Integrate a robust `ServiceWorker` to intercept failing HTTP requests if a user is in a low-signal farm area, queuing checkout POST requests.
- **WakeLock API**: Add native WakeLock usage to `DeliveryDashboard.tsx` to stop the phone from sleeping whilst tracking GPS.

## Medium-Term Objectives
- **Live Maps Integration**: Migrate the existing `delivery_locations` raw numbers to an active, visual embedded map (Google Maps API) shown actively inside `TrackOrder.tsx`.
- **Payment Gateway**: Evolve beyond 'Cash on Delivery'; insert Stripe integration for upfront online payment logic inside the `/order` summary page.
- **Native Push Notifications**: Shift from merely opening the app to seeing 'Store Updates' to utilizing true Push capabilities (via FCM/Firebase Cloud Messaging bridged to Supabase).

## Long-Term Vision
- **Agronomy Knowledge Base Expansion**: Upgrade the Gemini 'Crop Doctor' to accept photos processed via Google Vision logic (if applicable) for robust disease profiling directly in the mobile app.
