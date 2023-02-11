import "@/styles/globals.css";

import type { AppProps } from "next/app";

import ContextMenu from "@/components/ContextMenu";
import RouterTransition from "@/components/RouterTransition";

import { Manrope } from "@next/font/google";
import clsx from "clsx";
import { SessionProvider } from "next-auth/react";

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
            <main className={clsx(manrope.variable, "h-full w-full font-sans")}>
                <RouterTransition />
                <Component {...pageProps} />
                <ContextMenu />
            </main>
        </SessionProvider>
    );
}
