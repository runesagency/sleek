export type ParsedSSRProps<T extends Record<string, unknown>[] | Record<string, unknown>> = //
    T extends Record<string, unknown>[]
        ? {
              [key in keyof T]: T[key] extends Record<string, unknown>
                  ? ParsedSSRProps<T[key]> //
                  : T[key] extends Record<string, unknown>[]
                  ? ParsedSSRProps<T[key]>
                  : T[key];
          }
        : T extends Record<string, unknown>
        ? {
              [key in keyof T]: T[key] extends (Date | null) | Date
                  ? string //
                  : T[key] extends Record<string, unknown>
                  ? ParsedSSRProps<T[key]>
                  : T[key] extends Record<string, unknown>[]
                  ? ParsedSSRProps<T[key]>
                  : T[key];
          }
        : T;

export function parseSSRProps<T extends Record<string, unknown>[] | Record<string, unknown>>(obj: T): ParsedSSRProps<T> {
    if (Array.isArray(obj)) {
        return obj.map(parseSSRProps) as ParsedSSRProps<T>;
    } else {
        for (const key in obj) {
            if (typeof obj[key] === "object" || Array.isArray(obj[key])) {
                obj[key] = parseSSRProps(obj[key] as T) as T[Extract<keyof T, string>];
            }

            if (obj[key] instanceof Date) {
                obj[key] = (obj[key] as Date).toString() as T[Extract<keyof T, string>];
            }
        }

        return obj as ParsedSSRProps<T>;
    }
}
