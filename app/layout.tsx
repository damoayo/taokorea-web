import LicenseCheck from "@/components/LicenseCheck"; // 추가
import { ThemeProvider } from "@/components/theme-provider";
import "devextreme/dist/css/dx.light.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SellerHub",
  description: "타오바오 상품 관리 & 쇼핑몰",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased`}>
        {/* 라이선스 체크 컴포넌트를 ThemeProvider보다 위에 배치 */}
        <LicenseCheck /> 
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}