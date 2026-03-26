import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "devextreme/dist/css/dx.light.css";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SellerHub",
  description: "타오바오 상품 관리 & 쇼핑몰",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
