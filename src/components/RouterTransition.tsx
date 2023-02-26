"use client";

import type { LoadingBarRef } from "react-top-loading-bar";

import { usePathname } from "next/navigation";
import { memo, useEffect, useRef } from "react";
import LoadingBar from "react-top-loading-bar";

const RouterTransition = () => {
    const loadingBarRef = useRef<LoadingBarRef>(null);

    const pathName = usePathname();
    const lastPathName = useRef(pathName);

    useEffect(() => {
        const loadingBar = loadingBarRef.current;
        if (!loadingBar) return;

        if (pathName !== lastPathName.current) {
            loadingBarRef.current?.complete();
            lastPathName.current = pathName;
        }

        const onAnchorClick = (event: MouseEvent) => {
            const target = event.currentTarget;
            if (!(target instanceof HTMLAnchorElement)) return;

            const href = target.getAttribute("href");

            // check if the href is a relative path and not the current path
            if (href && href.startsWith("/") && href !== pathName) {
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

export default memo(RouterTransition);
