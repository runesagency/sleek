import type { DragStartEvent, DragCancelEvent, DragEnterEvent, DragLeaveEvent, DragEndEvent, DragDropContextProps } from ".";

import { DragDropContext } from ".";

import { useCallback, useMemo, useState } from "react";

export type DragDropProviderProps = {
    onDragStart?: (event: DragStartEvent) => void;
    onDragCancel?: (event: DragCancelEvent) => void;
    onDragEnter?: (event: DragEnterEvent) => void;
    onDragLeave?: (event: DragLeaveEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    children: React.ReactNode;
};

export default function DragDropProvider({ children, ...listeners }: DragDropProviderProps) {
    const [dragged, setDragged] = useState<DragDropContextProps["dragged"]>(undefined);
    const [hovered, setHovered] = useState<DragDropContextProps["hovered"]>(undefined);

    const {
        onDragStart: onDragStartSource, //
        onDragCancel: onDragCancelSource,
        onDragEnter: onDragEnterSource,
        onDragLeave: onDragLeaveSource,
        onDragEnd: onDragEndSource,
    } = listeners;

    const onDragStart = useCallback(
        (event: DragStartEvent) => {
            setDragged(event.dragged);
            onDragStartSource?.(event);
        },
        [onDragStartSource]
    );

    const onDragCancel = useCallback(
        (event: DragCancelEvent) => {
            setDragged(undefined);
            onDragCancelSource?.(event);
        },
        [onDragCancelSource]
    );

    const onDragEnter = useCallback(
        (event: DragEnterEvent) => {
            setHovered(event.dropped);
            onDragEnterSource?.(event);
        },
        [onDragEnterSource]
    );

    const onDragLeave = useCallback(
        (event: DragLeaveEvent) => {
            setHovered(undefined);
            onDragLeaveSource?.(event);
        },
        [onDragLeaveSource]
    );

    const onDragEnd = useCallback(
        (event: DragEndEvent) => {
            setDragged(undefined);
            setHovered(undefined);
            onDragEndSource?.(event);
        },
        [onDragEndSource]
    );

    const contextValue: DragDropContextProps = useMemo(() => {
        return {
            id: Math.random().toString(36).substring(2, 9),
            dragged,
            hovered,
            onDragStart,
            onDragCancel,
            onDragEnter,
            onDragLeave,
            onDragEnd,
        };
    }, [dragged, hovered, onDragStart, onDragCancel, onDragEnter, onDragLeave, onDragEnd]);

    return <DragDropContext.Provider value={contextValue}>{children}</DragDropContext.Provider>;
}
