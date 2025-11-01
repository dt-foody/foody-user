# 🍜 Foody - Food Ordering App (User Version)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-blue.svg?logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-4-green.svg)

This is the repository for the client-side user interface of the Foody project, a food ordering and delivery platform built with Next.js and Tailwind CSS.

## ✨ Key Features

* **Next.js 14 App Router:** Utilizes the latest Next.js architecture with Server and Client Components.
* **State Management:** Uses **Zustand** for lightweight global state management (e.g., `useCartStore`, `useAuthStore`).
* **Cart & Checkout:** Complete cart (`CartSidebar.tsx`) and checkout (`checkout/page.tsx`) flow.
* **Multi-language (i18n):** Supports multiple locales (e.g., Vietnamese, English) via `[locale]` routing and `messages/`.
* **Modern UI:** Built with **Tailwind CSS** and icons from `lucide-react`.
* **Clean Architecture:** Clear separation of API logic (`src/services`), components (`src/components`), and state (`src/stores`).
* **User Authentication:** Includes login and registration pages (`login`, `signup`).
* **Blog Integration:** Features a blog module (`src/app/[locale]/blog/...`).

## 🛠 Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) 14+ (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)
* **Icons:** [Lucide React](https://lucide.dev/)
* **i18n:** [next-intl](https://next-intl.vercel.app/) (inferred from `[locale]` structure and `middleware.ts`)

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (version 18.x or higher)
* `pnpm`, `yarn`, or `npm`

### 2. Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/foody-user.git](https://github.com/your-username/foody-user.git)
    cd foody-user
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### 3. Configure Environment Variables

1.  Create a `.env.local` file from the example:
    ```bash
    cp .env.local.example .env.local
    ```

2.  Open the `.env.local` file and fill in the values. These are crucial for connecting to the backend API.
    ```.env
    NEXT_PUBLIC_API_ENDPOINT=[http://your-backend-api-url.com](http://your-backend-api-url.com)
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    
    # (Add any other variables present in your .env.local.example file)
    ```

### 4. Run the Project

Run the development server: npm run dev

Open http://localhost:3000 (or the specified port) in your browser to see the application.

📂 Folder Structure
Here is an overview of the key directories in the project:
src/
├── app/
│   ├── [locale]/                   # Handles multi-locale (i18n) routing
│   │   ├── (account-pages)/      # Layout and pages for user accounts
│   │   ├── blog/                 # Blog-related pages
│   │   ├── checkout/             # Checkout page
│   │   ├── login/                # Login page
│   │   ├── menu/                 # Menu page
│   │   ├── layout.tsx            # Main layout
│   │   └── page.tsx              # Homepage
│   └── api/                      # API routes (if any)
│
├── components/                   # Reusable components (UI)
│   ├── CartSidebar.tsx           # Cart component
│   ├── ProductCard.tsx           # Product card component
│   └── ...
│
├── services/                     # API service layer
│   ├── auth.service.ts
│   ├── product.service.ts
│   └── ...
│
├── stores/                       # State management (Zustand)
│   ├── useAuthStore.ts
│   └── useCartStore.ts
│
├── lib/                          # Helper functions, utils
├── types/                        # Type definitions (TypeScript)
├── messages/                     # JSON files for i18n
│   ├── en.json
│   └── vi.json
│
└── middleware.ts                 # Middleware for i18n and auth
npm run dev
# or
yarn dev
