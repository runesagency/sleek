import type { ControlledMenuContextProps, ControlledMenuVariantType } from ".";

import { ControlledMenuVariant, ContextMenuContext, TargetPosition } from ".";

import { memo, useCallback, useMemo, useRef, useState } from "react";

type ContextMenuProviderProps = {
    children: React.ReactNode;
};

const ContextMenuProvider = ({ children }: ContextMenuProviderProps) => {
    const targetRef = useRef<HTMLElement | null>(null);
    const targetPosition = useRef<TargetPosition>(TargetPosition.Element);
    const clientCoordinates = useRef({ x: 0, y: 0 });
    const offset = useRef({ x: 0, y: 0 });

    const [isOpen, setOpen] = useState(false);
    const [instanceId, setInstanceId] = useState("");

    const [variant, setVariant] = useState<ControlledMenuVariantType>({
        type: ControlledMenuVariant.ContextMenu,
        lists: [],
    });

    const setTargetRef = useCallback((ref: HTMLElement) => {
        targetRef.current = ref;
    }, []);

    const setClientCoordinates = useCallback((x: number, y: number) => {
        clientCoordinates.current = { x, y };
    }, []);

    const setTargetPosition = useCallback((position: TargetPosition) => {
        targetPosition.current = position;
    }, []);

    const setOffset = useCallback((x: number, y: number) => {
        offset.current = { x, y };
    }, []);

    const contextValue = useMemo<ControlledMenuContextProps>(() => {
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

    return <ContextMenuContext.Provider value={contextValue}>{children}</ContextMenuContext.Provider>;
};

export default memo(ContextMenuProvider);
