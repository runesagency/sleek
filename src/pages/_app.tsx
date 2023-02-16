import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.css";

import type { AppProps } from "next/app";

import RouterTransition from "@/components/RouterTransition";
import { Menu, MenuProvider } from "@/lib/menu";

import { Manrope } from "@next/font/google";
import clsx from "clsx";
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

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session}>
            <MenuProvider>
                <main className={clsx(manrope.variable, "h-full w-full font-sans")}>
                    <RouterTransition />
                    <Menu />

                    <Component {...pageProps} />

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
                </main>
            </MenuProvider>
        </SessionProvider>
    );
}
