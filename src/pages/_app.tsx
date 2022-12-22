import "../styles/globals.css";
import type { AppProps } from "next/app";

import { Manrope } from "@next/font/google";

const manrope = Manrope({
    variable: "--font-manrope",
    weight: ["400", "500", "600", "700"],
    style: ["normal"],
    subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <main className={`${manrope.variable} font-sans`}>
            <Component {...pageProps} />
        </main>
    );
}
