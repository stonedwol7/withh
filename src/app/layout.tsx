import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AiInit } from "@/components/shared/ai-init";
import { PWARegister } from "@/components/shared/pwa-register";
import { AccessibilityProvider } from "@/lib/accessibility-context";
import { I18nProvider } from "@/lib/i18n-context";
import { OnboardingTour } from "@/components/shared/onboarding-tour";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WITHH - When you can't go alone, we'll go with you.",
  description: "Trusted human accompaniment platform. Nobody should have to face important moments alone.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WITHH",
  },
  icons: {
    icon: [
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/logo-primary.png",
  },
  openGraph: {
    title: "WITHH - When you can't go alone, we'll go with you.",
    description: "Trusted human accompaniment platform.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background">
        <AccessibilityProvider>
          <I18nProvider>
            <AiInit />
            <PWARegister />
            <OnboardingTour />
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:text-sm focus:font-medium"
            >
              Skip to content
            </a>
            <div id="main-content" className="flex-1 flex flex-col">
              {children}
            </div>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                  borderRadius: "var(--radius-xl)",
                  fontSize: "14px",
                },
              }}
            />
          </I18nProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
