import type { MenuContextProps, MenuVariantType } from "@/lib/menu";

import { MenuAlignment, MenuVariant, MenuContext, MenuAnchor, MenuDirection } from "@/lib/menu";

import { memo, useMemo, useRef, useState } from "react";

type MenuProviderProps = {
    children: React.ReactNode;
};

const MenuProvider = ({ children }: MenuProviderProps) => {
    const targetRef = useRef<HTMLElement | null>(null);
    const anchor = useRef<MenuAnchor>(MenuAnchor.Element);
    const clientCoordinates = useRef({ x: 0, y: 0 });
    const offset = useRef({ x: 0, y: 0 });
    const direction = useRef<MenuDirection>(MenuDirection.Right);
    const alignment = useRef<MenuAlignment>(MenuAlignment.Start);

    const [isOpen, setOpen] = useState(false);
    const [instanceId, setInstanceId] = useState("");

    const [variant, setVariant] = useState<MenuVariantType>({
        type: MenuVariant.Context,
        lists: [],
    });

    const contextValue = useMemo<MenuContextProps>(() => {
        const defaultProps = {
            targetRef,
            offset,
            instanceId,
            anchor,
            clientCoordinates,
            direction,
            alignment,
            setOpen,
            setVariant,
            setInstanceId,
        };

        if (!isOpen) {
            return {
                isOpen,
                lists: null,
                type: null,
                ...defaultProps,
            };
        }

        return {
            isOpen,
            ...variant,
            ...defaultProps,
        };
    }, [instanceId, offset, targetRef, anchor, clientCoordinates, direction, isOpen, variant]);

    return <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>;
};

export default memo(MenuProvider);
