import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import SiteHeader from "./(client-components)/(Header)/SiteHeader";
import ClientCommons from "./ClientCommons";
import "./globals.css";
import "@/fonts/line-awesome-1.3.0/css/line-awesome.css";
import "@/styles/index.scss";
import "rc-slider/assets/index.css";
import Footer from "@/components/Footer";
import FooterNav from "@/components/FooterNav";

const poppins = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const messages = (await import(`../../../messages/${params.locale}.json`)).default;

  return {
    title: messages.metadata.siteTitle,
    description: messages.metadata.siteDescription,
    keywords: messages.metadata.keywords,
    openGraph: {
      title: messages.metadata.siteTitle,
      description: messages.metadata.siteDescription,
      locale: params.locale === "ar" ? "ar_AR" : "en_US",
      url: `https://user-booking.vercel.app//${params.locale}`,
      images: [
        {
          url: "https://user-booking.vercel.app/images/logo.png",
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
      images: ["https://user-booking.vercel.app/images/logo.png"],
    },
    verification: {
      "google": "vYA8i7hLQd5Ovyo-6HxZMEMUkxD5S22Psf_9e79p_wk",
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
  const messages = (await import(`../../../messages/${params.locale}.json`)).default;
  const dir = params.locale === "ar" ? "rtl" : "ltr";
  // const dir = "ltr";

  return (
    <html lang={params.locale} className={poppins.className} dir={dir}>
      <body className="bg-white text-base dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <ClientCommons />
          <SiteHeader />
          {children}
          <FooterNav />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
