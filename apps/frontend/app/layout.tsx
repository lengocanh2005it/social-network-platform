import AppProviders from "@/app/wrappers";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppinsFont = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Social Network Platform",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppinsFont.variable} antialiased`}>
        <AppProviders>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
            }}
          />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
