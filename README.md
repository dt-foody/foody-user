# 🍜 Foody — Food Ordering App (User Web)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-blue.svg?logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-4-green.svg)
![i18n](https://img.shields.io/badge/i18n-next--intl-purple.svg)

Client‑side UI for **Foody**, a modern food ordering & delivery platform built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Zustand**. This repository focuses on the **customer** experience (browse menu, cart, checkout, account).

> **Status:** Active development. Production‑ready core flows (Cart + Checkout) are implemented.

---

## ✨ Key Features

- **Next.js 14 App Router** — Server/Client Components, layouts, and streaming where appropriate.
- **State Management** — Lightweight global state with **Zustand** (`useCartStore`, `useAuthStore`).
- **Cart & Checkout** — Complete cart sidebar and checkout page with promotion/coupon support.
- **Multi‑language (i18n)** — Locale routing via `[locale]` and JSON messages (EN, VI).
- **Modern UI** — Tailwind CSS + `lucide-react` icons.
- **Auth‑Ready** — Login/Signup pages; `useAuthStore.fetchUser()` reads `/auth/me` with credentials.
- **Clean Architecture** — Clear split: services, components, stores, types, messages.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State:** [Zustand](https://github.com/pmndrs/zustand)
- **Icons:** [lucide-react](https://lucide.dev/)
- **i18n:** [next-intl](https://next-intl.vercel.app/)

---

## 🚀 Getting Started

### 1) Prerequisites
- Node.js **>= 18**
- One of: `pnpm`, `yarn`, or `npm`

### 2) Install
```bash
git clone https://github.com/your-username/foody-user.git
cd foody-user
pnpm install # or yarn install / npm install
```

### 3) Environment Variables
Create `.env.local` from the example and fill in values:
```bash
cp .env.local.example .env.local
```

**Minimum required:**
```env
# Base URL of your backend gateway (used by useAuthStore, services, etc.)
NEXT_PUBLIC_API_URL=https://api.your-foody.com

# Public app URL (for redirects, OAuth callback, etc.)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: default locale for next-intl
NEXT_PUBLIC_DEFAULT_LOCALE=vi
```

> If you previously used `NEXT_PUBLIC_API_ENDPOINT`, align everything to **`NEXT_PUBLIC_API_URL`** for consistency (store & services).

### 4) Run
```bash
pnpm dev # or yarn dev / npm run dev
```
Open **http://localhost:3000**

---

## 📂 Folder Structure

```
src/
├─ app/
│  ├─ [locale]/                 # i18n routing scope (vi, en, ...)
│  │  ├─ (account-pages)/       # Account-related pages/layouts
│  │  ├─ blog/                  # Blog module
│  │  ├─ checkout/              # Checkout page
│  │  ├─ login/                 # Auth pages
│  │  ├─ menu/                  # Menu/catalog
│  │  ├─ layout.tsx             # Root layout per-locale
│  │  └─ page.tsx               # Homepage
│  └─ api/                      # Next.js API routes (if any)
│
├─ components/                  # Reusable UI components
│  ├─ CartSidebar.tsx
│  ├─ ProductCard.tsx
│  └─ ProductOptionsModal.tsx
│
├─ services/                    # API calls (fetch wrappers)
│  ├─ auth.service.ts
│  ├─ product.service.ts
│  └─ coupon.service.ts
│
├─ stores/                      # Zustand stores
│  ├─ useAuthStore.ts
│  └─ useCartStore.ts
│
├─ types/                       # Shared TS types (CartLine, MenuItem, ...)
├─ messages/                    # i18n message JSON (en.json, vi.json)
├─ lib/                         # Utils/helpers
└─ middleware.ts                # i18n + auth middleware
```

---

## 🧩 Core Modules

### Cart
- **ProductCard**: if product has configurable options → open **ProductOptionsModal**; else add directly.
- **CartSidebar**: inline quantity controls, per‑item notes, coupon apply/remove, delivery options.
- **useCartStore**: persists `cartItems` (localStorage) and exposes totals (`subtotal`, `finalTotal`, discounts).

### Checkout
- Prefills shipping info from **useAuthStore.me.addresses** (default address).
- Validates phone format; supports order note; submits to `/api/orders`.
- Includes sticky desktop footer + mobile submit.

### Auth
- `useAuthStore.fetchUser()` calls `GET {NEXT_PUBLIC_API_URL}/auth/me` with `credentials: 'include'`.
- Store holds `user` & `me`; `clearUser()` for logout flows.

---

## 🧪 Scripts

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 🔧 Configuration Notes

- **API base URL** — import from `process.env.NEXT_PUBLIC_API_URL`. Avoid hardcoding (e.g., `"http://localhost:3000/v1"`).
- **Zustand persistence** — cart items persisted via `localStorage` key (e.g., `foody_cart_v5`).
- **i18n** — locale prefixing via `[locale]` + `middleware.ts`. Strings live in `messages/`.

---

## 🗺 Roadmap (User App)

- [ ] Saved payment methods
- [ ] Order history & reorder
- [ ] Realtime order status (SSE/WebSocket)
- [ ] Address book integration on checkout (edit/add inline)
- [ ] SEO polish, structured data

(For the Admin/Restaurant app, see the sibling repository.)

---

## 🤝 Contributing

PRs are welcome. Please follow:
- Conventional commits (e.g., `feat:`, `fix:`, `docs:`)
- Add/adjust types in `src/types/`
- Keep UI changes accessible and responsive

---

## 📜 License

**MIT** — see `LICENSE` for details.

---

## 🙌 Acknowledgements

- Next.js team & community
- pmndrs (Zustand)
- Tailwind Labs
- lucide-react
- next-intl

---

### Screenshots (optional)

> Drop your screenshots/gifs here later for the Store page & README.
> - Home
> - Menu
> - Cart & Options Modal
> - Checkout
