import "./globals.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "WealthPath — Retirement Planning Simulator",
  description:
    "See your retirement before you get there. A 2,371-formula simulation engine with 38 financial moves.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} ${inter.className}`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
