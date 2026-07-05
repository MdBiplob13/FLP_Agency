import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoBangla = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "GHLearning — Master the skills যা career বদলে দেবে",
  description:
    "Project-led online courses for web development, design, marketing, and freelancing. Learn from expert mentors, build a real portfolio, আর job-ready হয়ে উঠুন।",
};

const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('ghl-theme');
    if (t === 'dark' || (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoBangla.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-text">
        <ThemeProvider>
          <Toaster position="top-center" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
