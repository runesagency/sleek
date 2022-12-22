export type ToStringIfExtends<K, E> = K extends E ? string : K;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ParsedSSRObjectProps<T extends Record<string, any>> = {
    [key in keyof T]: ToStringIfExtends<T[key], Date>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ParsedSSRArrayProps<T extends Record<string, any>[]> = {
    [key in keyof T]: ParsedSSRObjectProps<T[key]>;
};
