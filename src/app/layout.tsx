"use client";

import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.css";

import type { LoadingBarRef } from "react-top-loading-bar";

import { Menu, MenuProvider } from "@/lib/menu";

import clsx from "clsx";
import { Manrope } from "next/font/google";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { useEffect, useRef } from "react";
import { ToastContainer } from "react-toastify";
import LoadingBar from "react-top-loading-bar";

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

const RouterTransition = () => {
    const loadingBarRef = useRef<LoadingBarRef>(null);

    const pathName = usePathname();
    const lastPathName = useRef(pathName);

    useEffect(() => {
        const loadingBar = loadingBarRef.current;
        if (!loadingBar) return;

        if (pathName !== lastPathName.current) {
            loadingBar.complete();
            lastPathName.current = pathName;
        }

        const onAnchorClick = (event: MouseEvent) => {
            const target = event.currentTarget;
            if (!(target instanceof HTMLAnchorElement)) return;

            const href = target.getAttribute("href");

            if (!href) return;

            const cleanHref = href.split("#")[0];

            // check if the href is a relative path and not the current path
            if (cleanHref.startsWith("/") && cleanHref !== pathName) {
                loadingBar.continuousStart();
            }
        };

        // get all anchor tags
        const anchors = document.querySelectorAll("a");

        anchors.forEach((anchor) => {
            anchor.addEventListener("click", onAnchorClick);
        });

        return () => {
            anchors.forEach((anchor) => {
                anchor.removeEventListener("click", onAnchorClick);
            });

            loadingBar.complete();
        };
    }, [pathName]);

    return <LoadingBar ref={loadingBarRef} color="#FFFFFF" shadow />;
};

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
