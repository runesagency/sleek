import { useEffect, useRef } from "react";

export type DragEvent = {
    dragged: {
        id: string;
        type: string;
    };
    dropped: {
        id: string;
        sortable: boolean;
        index: number;
    };
};

export type DragStartEvent = Pick<DragEvent, "dragged">;

export type DragCancelEvent = DragStartEvent;

export type DragEnterEvent = DragEvent;

export type DragLeaveEvent = DragEvent;

export type DragEndEvent = DragEvent;

export const constants = {
    dataAttribute: {
        dragDropContext: "data-drag-drop-context",
    },
    events: {
        dragStart: "drag-start",
        dragCancel: "drag-cancel",
        dragEnter: "drag-enter",
        dragLeave: "drag-leave",
        dragEnd: "drag-end",
    },
};

export default function useDragDropContext<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null);

    const dragStartHandler = useRef<(event: DragStartEvent) => void>(() => true);
    const dragCancelHandler = useRef<(event: DragCancelEvent) => void>(() => true);
    const dragEnterHandler = useRef<(event: DragEnterEvent) => void>(() => true);
    const dragLeaveHandler = useRef<(event: DragLeaveEvent) => void>(() => true);
    const dragEndHandler = useRef<(event: DragEndEvent) => void>(() => true);

    /**
     * @description
     * Fires when a user starts dragging an item (after moving the element by X pixels)
     *
     * @param handler Function to be called when a drag starts
     */
    const onDragStart = (handler: (event: DragStartEvent) => void) => {
        dragStartHandler.current = handler;
    };

    /**
     * @description
     * When a user didn't meet the threshold to start a drag, the drag is counted as cancelled, and this event is fired.
     * Also fires when a user drags an item outside of a drop target (if the drop target is not a sortable list).
     *
     * @param handler Function to be called when a drag is cancelled
     */
    const onDragCancel = (handler: (event: DragCancelEvent) => void) => {
        dragCancelHandler.current = handler;
    };

    /**
     * @description
     * Fires when a user is dragging an item over a drop target
     *
     * @param handler Function to be called when a drag is updated
     */
    const onDragEnter = (handler: (event: DragEnterEvent) => void) => {
        dragEnterHandler.current = handler;
    };

    /**
     * @description
     * Fires when a user is leaving the current drop target
     *
     * @param handler Function to be called when a drag leaves a drop target
     */
    const onDragLeave = (handler: (event: DragLeaveEvent) => void) => {
        dragLeaveHandler.current = handler;
    };

    /**
     * @description
     * After a user has dropped an item to a drop target, this event is fired.
     *
     * @param handler Function to be called when a drag ends
     */
    const onDragEnd = (handler: (event: DragEndEvent) => void) => {
        dragEndHandler.current = handler;
    };

    useEffect(() => {
        const current = ref.current;

        const onDragStart = ((event: CustomEvent<DragStartEvent>) => {
            dragStartHandler.current(event.detail);
        }) as EventListener;

        const onDragCancel = ((event: CustomEvent<DragCancelEvent>) => {
            dragCancelHandler.current(event.detail);
        }) as EventListener;

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
            current.setAttribute(constants.dataAttribute.dragDropContext, "true");

            current.addEventListener(constants.events.dragStart, onDragStart);
            current.addEventListener(constants.events.dragCancel, onDragCancel);
            current.addEventListener(constants.events.dragEnter, onDragEnter);
            current.addEventListener(constants.events.dragLeave, onDragLeave);
            current.addEventListener(constants.events.dragEnd, onDragEnd);
        }

        return () => {
            if (current) {
                current.removeAttribute(constants.dataAttribute.dragDropContext);

                current.removeEventListener(constants.events.dragStart, onDragStart);
                current.removeEventListener(constants.events.dragCancel, onDragCancel);
                current.removeEventListener(constants.events.dragEnter, onDragEnter);
                current.removeEventListener(constants.events.dragLeave, onDragLeave);
                current.removeEventListener(constants.events.dragEnd, onDragEnd);
            }
        };
    }, [ref]);

    return {
        ref,
        onDragStart,
        onDragCancel,
        onDragEnter,
        onDragLeave,
        onDragEnd,
    };
}
