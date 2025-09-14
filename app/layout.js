"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { DoctorsSidebar } from "@/components/doctors-sidebar";
import { InteractiveFooter } from "@/components/footer";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
          <title>AARAGYA - Doctors Appointment Platform</title>
          <meta name="description" content="Connect with doctors anytime, anywhere" />
        </head>
        <body className={`${inter.className} overflow-x-hidden`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {isAuthPage ? (
              <main className="min-h-screen w-full">{children}</main>
            ) : (
              <DoctorsSidebar>
                <main className="min-h-screen w-full">{children}</main>
              </DoctorsSidebar>
            )}
            <Toaster richColors />
            <InteractiveFooter />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
