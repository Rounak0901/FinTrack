import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FinTrack",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          {/* Header */}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          {/* Footer */}
          <footer className="bg-blue-50 py-12">
            <div className="conatiner mx-auto px-4 text-center text-gray-600">
              <p>Made with love by Rounak</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
