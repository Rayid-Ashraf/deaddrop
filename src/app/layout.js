import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Updo — Share Files Securely",
  description:
    "Updo lets you send files securely and anonymously. Just upload your file, give it a name, set a key, and share the name and key — or simply send a direct link. It’s that simple.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${poppins.variable}`}>
      <head>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="3aabfa19-c9b7-4e41-95f3-a65817975c25"
        />
      </head>
      <body className="antialiased">
        <Suspense
          fallback={
            <div className="text-white text-center h-screen w-screen flex items-center justify-center bg-black">
              Loading...
            </div>
          }
        >
          <NuqsAdapter>{children}</NuqsAdapter>
        </Suspense>
      </body>
    </html>
  );
}
