import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import ToastNotification from "./components/shared/ToastNotification";

const roboto = Roboto({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - Coinlog",
    default: "Coinlog",
  },
  description: "Create budgets for all your expenses!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.className} h-full antialiased`}>
      <body className="min-h-full">
        <ToastNotification />
        {children}
      </body>
    </html>
  );
}
