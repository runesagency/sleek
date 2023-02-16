import type { MenuContextProps, MenuVariantType } from "@/lib/menu";

import { MenuVariant, MenuContext, MenuPosition } from "@/lib/menu";

import { memo, useCallback, useMemo, useRef, useState } from "react";

type MenuProviderProps = {
    children: React.ReactNode;
};

const MenuProvider = ({ children }: MenuProviderProps) => {
    const targetRef = useRef<HTMLElement | null>(null);
    const targetPosition = useRef<MenuPosition>(MenuPosition.Element);
    const clientCoordinates = useRef({ x: 0, y: 0 });
    const offset = useRef({ x: 0, y: 0 });

    const [isOpen, setOpen] = useState(false);
    const [instanceId, setInstanceId] = useState("");

    const [variant, setVariant] = useState<MenuVariantType>({
        type: MenuVariant.Context,
        lists: [],
    });

    const setTargetRef = useCallback((ref: HTMLElement) => {
        targetRef.current = ref;
    }, []);

    const setClientCoordinates = useCallback((x: number, y: number) => {
        clientCoordinates.current = { x, y };
    }, []);

    const setTargetPosition = useCallback((position: MenuPosition) => {
        targetPosition.current = position;
    }, []);

    const setOffset = useCallback((x: number, y: number) => {
        offset.current = { x, y };
    }, []);

    const contextValue = useMemo<MenuContextProps>(() => {
        const defaultProps = {
            targetRef,
            offset,
            instanceId,
            targetPosition,
            clientCoordinates,
            setOpen,
            setOffset,
            setVariant,
            setTargetRef,
            setInstanceId,
            setTargetPosition,
            setClientCoordinates,
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
    }, [instanceId, isOpen, setClientCoordinates, setOffset, setTargetPosition, setTargetRef, variant]);

    return <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>;
};

export default memo(MenuProvider);
