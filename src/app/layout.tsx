"use client";

import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.css";

import RouterTransition from "@/components/RouterTransition";
import { Menu, MenuProvider } from "@/lib/menu";

import clsx from "clsx";
import { Manrope } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";

const manrope = Manrope({
    variable: "--font-manrope",
    preload: true,
    adjustFontFallback: true,
    display: "swap",
    fallback: ["sans-serif"],
    weight: ["400", "500", "600", "700"],
    style: ["normal"],
    subsets: ["latin", "latin-ext"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={clsx(manrope.variable, "h-full w-full font-sans")}>
                <SessionProvider>
                    <MenuProvider>
                        <RouterTransition />
                        <Menu />

                        {children}

                        <ToastContainer
                            position="top-right" //
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="dark"
                            limit={5}
                        />
                    </MenuProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
