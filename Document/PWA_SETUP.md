# PWA Setup

The application behaves as a Progressive Web Application (PWA).

## 1. `manifest.json`
Located in `/public` (and built at the root folder). Highlights structural metadata mapping to allow Chrome, Safari, and other OS browsers to detect and offer "Add to Home Screen" behaviors.
- `start_url`: Set to `/`.
- `display`: Defines it as `standalone` (hiding the standard URL bar wrapper).
- Houses references to logo assets (e.g. 192x192, 512x512).

## 2. Bootstrapping Intercepts (`index.html`)
The application requires specific logic natively applied before React mounts to determine behavior for specific locked sessions (mainly Delivery users).

```javascript
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    if (!sessionStorage.getItem('pwa_launched')) {
        sessionStorage.setItem('pwa_launched', 'true');
    }
}
```
*(Historically used for routing overrides, now reduced to tracking boot states, defaulting specific hard-locking logical tasks to `App.tsx` and `Admin/DeliveryProtectedRoute.tsx`)*.

## 3. Mobile OS Tagging
Embedded metadata enforces specific OS aesthetic bounds:
- `<meta name="mobile-web-app-capable" content="yes">`
- `<meta name="geo.position" content="enabled">` ensures Android permissions for Delivery Dashboard tracking trigger correctly.
- Background status bars are tagged to `black-translucent` format across specific Apple iOS environments.
