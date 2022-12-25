import "@/styles/globals.css";
import type { AppProps } from "next/app";

import RouterTransition from "@/components/RouterTransition";
import ContextMenu from "@/components/ContextMenu";

// eslint-disable-next-line import/named
import { MantineProvider } from "@mantine/core";
import { Manrope } from "@next/font/google";

const manrope = Manrope({
    variable: "--font-manrope",
    weight: ["400", "500", "600", "700"],
    style: ["normal"],
    subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <MantineProvider
            withCSSVariables
            theme={{
                colorScheme: "dark",
                fontFamily: "Manrope, sans-serif",
            }}
        >
            <main className={`${manrope.variable} max-h-screen w-screen overflow-auto font-sans`}>
                <RouterTransition />
                <Component {...pageProps} />
                <ContextMenu />
            </main>
        </MantineProvider>
    );
}
