"use client";

import type { LoadingBarRef } from "react-top-loading-bar";

import { useRouter } from "next/navigation";
import { memo, useEffect, useRef } from "react";
import LoadingBar from "react-top-loading-bar";

const RouterTransition = () => {
    const router = useRouter();
    const ref = useRef<LoadingBarRef>(null);

    // useEffect(() => {
    //     const onStart = (url: string) => {
    //         if (url !== router.asPath) {
    //             ref.current?.continuousStart();
    //         }
    //     };

    //     const onComplete = () => {
    //         ref.current?.complete();
    //     };

    //     router.events.on("routeChangeStart", onStart);
    //     router.events.on("routeChangeComplete", onComplete);
    //     router.events.on("routeChangeError", onComplete);

    //     return () => {
    //         router.events.off("routeChangeStart", onStart);
    //         router.events.off("routeChangeComplete", onComplete);
    //         router.events.off("routeChangeError", onComplete);
    //     };
    // }, [router.asPath, router.events]);

    return <LoadingBar ref={ref} color="#FFFFFF" shadow />;
};

export default memo(RouterTransition);
