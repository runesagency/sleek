import type { useDraggableOptions } from "@/lib/hooks/drag-and-drop/use-draggable";
import type { useDroppableOptions } from "@/lib/hooks/drag-and-drop/use-droppable";

import { useEffect, useRef } from "react";

export type DragEndEvent = {
    dragged: useDraggableOptions;
    dropped: {
        id: string;
        sortable: boolean;
        childrenIndex?: number;
    };
};

export const constants = {
    dataAttribute: {
        dragDropContext: "data-drag-drop-context",
    },
};

export default function useDragDropContext<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const current = ref.current;

        if (current) {
            current.setAttribute(constants.dataAttribute.dragDropContext, "true");
        }

        return () => {
            if (current) {
                current.removeAttribute(constants.dataAttribute.dragDropContext);
            }
        };
    });

    return {
        ref,
    };
}
