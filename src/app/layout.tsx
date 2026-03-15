import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropCart",
  description: "A premium e-commerce experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <Providers>
          <Navbar />
          <PageTransition>
            {children}
          </PageTransition>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

