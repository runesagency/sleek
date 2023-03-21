import type { ApiResult } from "@/lib/types";

import useSWR from "swr";

export const useRequest = <T = unknown>(url: string, initialData?: T) => {
    const fetcher = async (url: string) => {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        try {
            const { result, error }: ApiResult<T> = await res.json();

            if (error) throw error;
            return result;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error("An unknown error occurred.");
            }
        }
    };

    return useSWR<T, Error>(url, {
        fetcher,
        fallbackData: initialData,
    });
};
