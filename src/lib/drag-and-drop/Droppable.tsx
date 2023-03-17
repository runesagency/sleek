import type { DragEndEvent, DragStartEvent, DroppableContextProps } from "@/lib/drag-and-drop";

import { DragDropContext, DroppableContext } from "@/lib/drag-and-drop";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export enum SortableDirection {
    Vertical = "vertical",
    Horizontal = "horizontal",
    Auto = "auto",
}

export const droppableAttributes = {
    highestDroppable: "data-highest-droppable",
    droppable: "data-droppable",
    droppableId: "data-droppable-id",
    sortable: "data-sortable",
    sortableDirection: "data-sortable-direction",
    accepts: "data-accepts",
    collide: "data-collide",
};

export type DroppableSnapshot = {
    isDraggingOver: boolean;
    isHovered: boolean;
};

export type DroppableProvided<T> = {
    ref: React.RefObject<T>;
};

export type DroppableProps<T> = {
    id: string;
    accepts?: string[];
    collide?: boolean;
    onDragStart?: (event: DragStartEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    children: (provided: DroppableProvided<T>, snapshot: DroppableSnapshot) => JSX.Element;
} & (
    | {
          sortable: true;
          sortableDirection: SortableDirection;
      }
    | {
          sortable: false;
          sortableDirection?: never;
      }
);

export default function Droppable<T extends HTMLElement>({ id, children, ...options }: DroppableProps<T>) {
    const {
        sortable, //
        sortableDirection,
        accepts,
        collide,
        onDragStart: onDragStartSource,
        onDragEnd: onDragEndSource,
    } = options;

    const { id: contextId, hovered: contextHovered } = useContext(DragDropContext);

    if (!contextId) {
        throw new Error("Droppable must be a child of DragDropProvider");
    }

    const ref = useRef<T>(null);
    const { id: parentDroppableId } = useContext(DroppableContext);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const onDragStart = useCallback(
        (event: DragStartEvent) => {
            setIsDraggingOver(true);
            onDragStartSource?.(event);
        },
        [onDragStartSource]
    );

    const onDragEnd = useCallback(
        (event: DragEndEvent) => {
            setIsDraggingOver(false);
            onDragEndSource?.(event);
        },
        [onDragEndSource]
    );

    const contextValue: DroppableContextProps = useMemo(() => {
        return {
            id,
            onDragStart,
            onDragEnd,
        };
    }, [id, onDragEnd, onDragStart]);

    const snapshot: DroppableSnapshot = useMemo(() => {
        return {
            isDraggingOver,
            isHovered,
        };
    }, [isDraggingOver, isHovered]);

    useEffect(() => {
        const current = ref.current;

        if (current) {
            if (!parentDroppableId) {
                current.setAttribute(droppableAttributes.highestDroppable, "true");
            }

            current.setAttribute(droppableAttributes.droppable, "true");
            current.setAttribute(droppableAttributes.droppableId, id);

            if (sortable) {
                current.setAttribute(droppableAttributes.sortable, "true");
                current.setAttribute(droppableAttributes.sortableDirection, sortableDirection);
            } else {
                current.removeAttribute(droppableAttributes.sortable);
                current.removeAttribute(droppableAttributes.sortableDirection);
            }

            if (accepts) {
                current.setAttribute(droppableAttributes.accepts, accepts.join(","));
            } else {
                current.removeAttribute(droppableAttributes.accepts);
            }

            if (collide) {
                current.setAttribute(droppableAttributes.collide, "true");
            } else {
                current.removeAttribute(droppableAttributes.collide);
            }
        }

        return () => {
            if (current) {
                current.removeAttribute(droppableAttributes.highestDroppable);
                current.removeAttribute(droppableAttributes.droppable);
                current.removeAttribute(droppableAttributes.droppableId);
                current.removeAttribute(droppableAttributes.sortable);
                current.removeAttribute(droppableAttributes.sortableDirection);
                current.removeAttribute(droppableAttributes.accepts);
                current.removeAttribute(droppableAttributes.collide);
            }
        };
    }, [accepts, collide, parentDroppableId, id, ref, sortable, sortableDirection]);

    useEffect(() => {
        if (contextHovered?.id === id && !isHovered) {
            setIsHovered(true);
        } else if (contextHovered?.id !== id && isHovered) {
            setIsHovered(false);
        }
    }, [contextHovered, id, isHovered]);

    return <DroppableContext.Provider value={contextValue}>{children({ ref }, snapshot)}</DroppableContext.Provider>;
}
