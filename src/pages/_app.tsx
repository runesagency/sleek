import "@/styles/globals.css";
import type { AppProps } from "next/app";

import RouterTransition from "@/components/RouterTransition";

import { Manrope } from "@next/font/google";
// eslint-disable-next-line import/named
import { MantineProvider } from "@mantine/core";

const manrope = Manrope({
    variable: "--font-manrope",
    weight: ["400", "500", "600", "700"],
    style: ["normal"],
    subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <MantineProvider withCSSVariables withGlobalStyles withNormalizeCSS>
            <main className={`${manrope.variable} font-sans`}>
                <RouterTransition />
                <Component {...pageProps} />
            </main>
        </MantineProvider>
    );
}
