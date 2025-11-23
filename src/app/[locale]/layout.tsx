import { Nunito } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import SiteHeader from "./(client-components)/(Header)/SiteHeader";
import ClientCommons from "./ClientCommons";
import "./globals.css";
import "@/fonts/line-awesome-1.3.0/css/line-awesome.css";
import "@/styles/index.scss";
import "rc-slider/assets/index.css";
import FooterNav from "@/components/FooterNav";
import CartSidebar from "@/components/CartSidebar";
import ProductOptionsModal from "@/components/ProductOptionsModal";
import ComboSelectionModal from "@/components/ComboSelectionModal";
import { CartStoreInitializer } from "@/stores/useCartStore";
import { Toaster } from "sonner";
import { serverApiFetch } from "@/lib/serverApi";
import { GetMeResponse } from "@/types";

const poppins = Nunito({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const messages = (await import(`../../../messages/${params.locale}.json`))
    .default;

  return {
    title: messages.metadata.siteTitle,
    description: messages.metadata.siteDescription,
    keywords: messages.metadata.keywords,
    icons: {
      icon: "/favicon.ico", // Hoặc .png, .svg...
    },
    openGraph: {
      title: messages.metadata.siteTitle,
      description: messages.metadata.siteDescription,
      locale: params.locale === "ar" ? "ar_AR" : "en_US",
      url: `https://foody-user.vercel.app/${params.locale}`,
      images: [
        {
          url: "https://foody-user.vercel.app/images/logo.png",
          width: 1200,
          height: 630,
          alt: messages.metadata.siteTitle,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: messages.metadata.siteTitle,
      description: messages.metadata.siteDescription,
      images: ["https://foody-user.vercel.app/images/logo.png"],
    },
    verification: {
      google: "tNXgCsyw3HWELlE_scnMxLvRfx1WQ8dIkjJU4gDrjGE",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 🟢 Load file dịch theo locale
  const messages = (await import(`../../../messages/${params.locale}.json`))
    .default;
  const dir = params.locale === "ar" ? "rtl" : "ltr";

  let data;
  try {
    data = await serverApiFetch<GetMeResponse>("/auth/me");
  } catch (err) {
    console.log("ERROR", err);
  }

  return (
    <html lang={params.locale} className={poppins.className} dir={dir}>
      <body className="bg-neutral-50 text-base dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <Toaster position="top-right" richColors /> {/* 💡 2. THÊM VÀO ĐÂY */}
          <CartStoreInitializer /> {/* ⚡ MỚI: Thêm vào đây */}
          <ClientCommons />
          <SiteHeader ssrUser={data ? data.user : null} />
          {children}
          {/* <FooterNav /> */}
          <CartSidebar />
          <ProductOptionsModal />
          <ComboSelectionModal />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
