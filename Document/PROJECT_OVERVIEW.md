# Project Overview

## New Nikhil Khad Bhandar

**New Nikhil Khad Bhandar** is a premium, full-stack e-commerce web application tailored for an agricultural store. It provides a complete digital storefront for selling agriculture products, seeds, fertilizers, and pesticides, serving farmers and customers with a modern, mobile-first experience.

## Key Features

*   **Comprehensive E-commerce Flow:** Browse the product catalog, add items to the cart, and securely place orders.
*   **Multi-Role Authentication System:** Distinct login areas and protected routes for different user types:
    *   **Users/Customers:** Standard login for browsing, ordering, and tracking personal orders.
    *   **Administrators:** Dedicated Admin login and dashboard for managing store inventory, processing orders, and overseeing business operations.
    *   **Delivery Personnel:** A specialized Delivery Login and Dashboard. Features a persistent PIN-locked session (preventing accidental navigation away from the dashboard) and active GPS location tracking to ensure accurate delivery routing.
*   **Progressive Web App (PWA):** Designed to act like a native app. Users and delivery staff can install the app to their device home screen. Includes logic to seamlessly boot delivery personnel directly into their dashboard if their session is locked.
*   **AI Integration (Crop Doctor):** Features an interactive AI Chat Drawer powered by Google's GenAI to help diagnose crop issues and provide agricultural advice.
*   **Robust Order Tracking:** Customers can view the status of their orders in real-time.
*   **Modern, Responsive UI:** Built with a mobile-first approach, featuring smooth animations, a curated typography system (Merriweather and Plus Jakarta Sans), and dark mode support.

## Tech Stack

*   **Frontend Library:** React 19
*   **Build Tool:** Vite
*   **Routing:** React Router v7
*   **Styling & Design:** Tailwind CSS
*   **Animations:** Motion (Framer Motion)
*   **Backend & Authentication:** Supabase (PostgreSQL, Auth)
*   **AI Integration:** `@google/genai`

## Folder Structure

*   **/components:** Reusable UI elements, protected route wrappers (`AdminProtectedRoute`, `DeliveryProtectedRoute`, `ProtectedRoute`), and global interface components like `AIChatDrawer`, `Header`, and `GlobalBottomNav`.
*   **/context:** React Context providers handling global application state, including `AuthContext`, `CartContext`, `AIContext`, `ThemeContext`, and `NavigationContext`.
*   **/pages:** The main view components representing individual routes (e.g., `Home`, `Catalog`, `Cart`, `Admin`, `DeliveryDashboard`, `Profile`, `Order`, `TrackOrder`).
*   **/supabase:** Configuration and utilities for interacting with the Supabase backend.
*   **Root Files:** Key configuration files including `App.tsx` (routing and global setup), `index.html` (entry point and PWA scripts), `manifest.json` (PWA configuration), and `vite.config.ts`.
