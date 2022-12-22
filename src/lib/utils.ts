import type { ParsedSSRArrayProps, ParsedSSRObjectProps } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSSRObjectProps<T extends Record<string, any>>(obj: T): ParsedSSRObjectProps<T> {
    for (const key in obj) {
        if (!obj[key]) continue;

        if ((obj[key] as Date) instanceof Date) {
            obj[key] = obj[key]?.toString();
        }
    }

    return obj as ParsedSSRObjectProps<T>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSSRArrayProps<T extends Record<string, any>[]>(obj: T): ParsedSSRArrayProps<T> {
    return obj.map(parseSSRObjectProps) as ParsedSSRArrayProps<T>;
}
