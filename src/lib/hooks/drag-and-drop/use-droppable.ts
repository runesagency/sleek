import type { DragEndEvent, DragEnterEvent, DragLeaveEvent } from "@/lib/hooks/drag-and-drop/use-drag-drop-context";

import { constants as contextConstants } from "@/lib/hooks/drag-and-drop/use-drag-drop-context";

import { useEffect, useRef } from "react";

export enum SortableDirection {
    Vertical = "vertical",
    Horizontal = "horizontal",
    Auto = "auto",
}

export type useDroppableOptions = {
    id: string;
    accepts?: string[];
} & (
    | {
          sortable: true;
          sortableDirection: SortableDirection;
      }
    | {
          sortable: false;
          sortableDirection: never;
      }
);

export const constants = {
    dataAttribute: {
        droppable: "data-droppable",
        droppableId: "data-droppable-id",
        sortable: "data-sortable",
        sortableDirection: "data-sortable-direction",
        accepts: "data-accepts",
    },
};

export default function useDroppable<T extends HTMLElement = HTMLDivElement>({ id, accepts, sortable, sortableDirection }: useDroppableOptions) {
    const ref = useRef<T>(null);

    const dragEnterHandler = useRef<(event: DragEnterEvent) => void>(() => true);
    const dragLeaveHandler = useRef<(event: DragLeaveEvent) => void>(() => true);
    const dragEndHandler = useRef<(event: DragEndEvent) => void>(() => true);

    /**
     * @description
     * Fires when a user is dragging an item over this current droppable
     *
     * @param handler Function to be called when a drag is updated
     */
    const onDragEnter = (handler: (event: DragEnterEvent) => void) => {
        dragEnterHandler.current = handler;
    };

    /**
     * @description
     * Fires when a user is leaving the current droppable
     *
     * @param handler Function to be called when a drag leaves a drop target
     */
    const onDragLeave = (handler: (event: DragLeaveEvent) => void) => {
        dragLeaveHandler.current = handler;
    };

    /**
     * @description
     * After a user has dropped an item to current droppable, this event is fired.
     *
     * @param handler Function to be called when a drag ends
     */
    const onDragEnd = (handler: (event: DragEndEvent) => void) => {
        dragEndHandler.current = handler;
    };

    useEffect(() => {
        const current = ref.current;

        const onDragEnter = ((event: CustomEvent<DragEnterEvent>) => {
            dragEnterHandler.current(event.detail);
        }) as EventListener;

        const onDragLeave = ((event: CustomEvent<DragLeaveEvent>) => {
            dragLeaveHandler.current(event.detail);
        }) as EventListener;

        const onDragEnd = ((event: CustomEvent<DragEndEvent>) => {
            dragEndHandler.current(event.detail);
        }) as EventListener;

        if (current) {
            current.setAttribute(constants.dataAttribute.droppable, "true");
            current.setAttribute(constants.dataAttribute.droppableId, id);

            if (sortable) {
                current.setAttribute(constants.dataAttribute.sortable, "true");
                current.setAttribute(constants.dataAttribute.sortableDirection, sortableDirection);
            } else {
                current.removeAttribute(constants.dataAttribute.sortable);
                current.removeAttribute(constants.dataAttribute.sortableDirection);
            }

            if (accepts) {
                current.setAttribute(constants.dataAttribute.accepts, accepts.join(","));
            } else {
                current.removeAttribute(constants.dataAttribute.accepts);
            }

            current.addEventListener(contextConstants.events.dragEnter, onDragEnter);
            current.addEventListener(contextConstants.events.dragLeave, onDragLeave);
            current.addEventListener(contextConstants.events.dragEnd, onDragEnd);
        }

        return () => {
            if (current) {
                current.removeAttribute(constants.dataAttribute.droppable);
                current.removeAttribute(constants.dataAttribute.droppableId);
                current.removeAttribute(constants.dataAttribute.sortable);
                current.removeAttribute(constants.dataAttribute.sortableDirection);
                current.removeAttribute(constants.dataAttribute.accepts);

                current.removeEventListener(contextConstants.events.dragEnter, onDragEnter);
                current.removeEventListener(contextConstants.events.dragLeave, onDragLeave);
                current.removeEventListener(contextConstants.events.dragEnd, onDragEnd);
            }
        };
    }, [accepts, id, ref, sortable, sortableDirection]);

    return {
        ref,
        onDragEnter,
        onDragLeave,
        onDragEnd,
    };
}
