import type { LoadingBarRef } from "react-top-loading-bar";

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import LoadingBar from "react-top-loading-bar";

export default function RouterTransition() {
    const router = useRouter();
    const ref = useRef<LoadingBarRef>(null);

    useEffect(() => {
        const handleStart = (url: string) => {
            if (url !== router.asPath) {
                ref.current?.continuousStart();
            }
        };

        const handleComplete = () => {
            ref.current?.complete();
        };

        router.events.on("routeChangeStart", handleStart);
        router.events.on("routeChangeComplete", handleComplete);
        router.events.on("routeChangeError", handleComplete);

        return () => {
            router.events.off("routeChangeStart", handleStart);
            router.events.off("routeChangeComplete", handleComplete);
            router.events.off("routeChangeError", handleComplete);
        };
    }, [router.asPath, router.events]);

    return <LoadingBar ref={ref} color="#FFFFFF" shadow />;
}
