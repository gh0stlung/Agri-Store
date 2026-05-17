# Frontend Guidelines

## Core Philosophy
The UI is strictly **Mobile-First** considering its primary user base (farmers, local customers, and delivery staff). 

## Styling System
- **Tailwind CSS**: Used exclusively for all styling. No external `.css` files are used for component scopes.
- **Custom Config**: Custom colors (`bg-main`, `text-primary`, `primary-btn`) and shadows (`shadow-premium`) are injected via `@layer theme` inside a `<style>` block in `index.html`.
- **Dark Mode**: Managed by `<ThemeContext>` which toggles the `.dark` class on the `<html>` root.
- **Typography**: 
  - **Merriweather**: For Headings (H1-H6) to provide a premium, grounded agricultural feel.
  - **Plus Jakarta Sans**: For UI elements and body text to maintain modern legibility.

## Animation & Motion
- **Framer Motion**: The `motion` component (`import { motion } from 'framer-motion'`) is heavily utilized for route transitions (e.g., page swipe-ins), modal drop-ins, and button presses.
- **CSS Animations**: Basic keyframes like `.animate-slide-up` and `.animate-fade-in` are included in the base CSS for lightweight skeleton loading or simple DOM mounts.

## Navigation paradigm
- **Client-Side Routing**: The app leverages `react-router-dom` exclusively.
- **Custom Hook**: `useNavigation` (a light wrapper around `useNavigate`) is universally used instead of `window.location.href`, guaranteeing SPA stability, particularly on external hosts (preventing 404s on Vercel).
