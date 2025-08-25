import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import type { AppProps } from "next/app";
import { SocketProvider } from "@/socket/SocketProvider";
import Head from "next/head";

const SITE_NAME = "Dabskoi Admin";
const SITE_DESC =
  "Panel admin Dabskoi untuk mengelola lelang, negosiasi, penjualan koi, chat pelanggan, dan data pengguna.";
const THEME_COLOR = "#2563EB"; // blue-600

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SocketProvider>
      <Head>
        {/* Dasar */}
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>{SITE_NAME}</title>
        <meta name="application-name" content={SITE_NAME} />
        <meta name="theme-color" content={THEME_COLOR} />
        <meta name="description" content={SITE_DESC} />
        {/* Karena ini panel admin, cegah index mesin pencari */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="favicon" content="/koi.png" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={SITE_NAME} />
        <meta property="og:description" content={SITE_DESC} />
        <meta property="og:image:alt" content={`${SITE_NAME} preview`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_NAME} />
        <meta name="twitter:description" content={SITE_DESC} />

        {/* Favicon & Manifest (opsional) */}
        <link rel="icon" href="/koi.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/koi.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/koi.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/koi.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>

      <Component {...pageProps} />
      <Toaster />
    </SocketProvider>
  );
}
